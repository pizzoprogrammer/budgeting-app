import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function CashFlowForecast() {
  const { token, user } = useAuth();
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchForecasts = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const result = await api.forecast.getAll(token);
      if (result.error) {
        setError(result.error);
      } else {
        setForecasts(result || []);
        setError('');
      }
    } catch (err) {
      setError('Failed to load forecasts');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const generateForecasts = async () => {
    if (!token) return;
    try {
      setIsGenerating(true);
      const result = await api.forecast.generate(token, 6);
      if (result.error) {
        setError(result.error);
      } else {
        setForecasts(result || []);
      }
    } catch (err) {
      setError('Failed to generate forecasts');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, [fetchForecasts]);

  if (loading) return <div className="text-center py-8">Loading forecasts...</div>;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = forecasts.map(f => ({
    month: monthNames[f.month - 1],
    income: f.projectedIncome,
    expenses: f.projectedExpenses,
    bills: f.projectedRecurringBills,
    balance: f.projectedBalance
  }));

  const avgBalance = forecasts.length > 0 
    ? forecasts.reduce((sum, f) => sum + f.projectedBalance, 0) / forecasts.length 
    : 0;

  const positiveForecasts = forecasts.filter(f => f.projectedBalance > 0).length;
  const totalForecasts = forecasts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900">Cash Flow Forecast</h1>
        <Button onClick={generateForecasts} disabled={isGenerating} className="gap-2">
          <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? 'Generating...' : 'Generate Forecast'}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Average Projected Balance</p>
              <p className={`text-3xl font-bold ${avgBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(avgBalance, user?.currency)}
              </p>
            </div>
            <TrendingUp className="text-blue-600 opacity-30" size={40} />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Positive Months</p>
            <p className="text-3xl font-bold text-green-600">{positiveForecasts}/{totalForecasts}</p>
            <p className="text-xs text-gray-600 mt-2">Months with positive balance</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
          <div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Forecast Months</p>
            <p className="text-3xl font-bold text-orange-600">{totalForecasts}</p>
            <p className="text-xs text-gray-600 mt-2">Projected ahead</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <>
          {/* Balance Trend */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Projected Balance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value, user?.currency)} />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Income vs Expenses */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value, user?.currency)} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" />
                <Bar dataKey="expenses" fill="#ef4444" />
                <Bar dataKey="bills" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* Detailed Forecasts */}
      {forecasts.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Forecast Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-right">Income</th>
                  <th className="px-4 py-2 text-right">Expenses</th>
                  <th className="px-4 py-2 text-right">Bills</th>
                  <th className="px-4 py-2 text-right">Projected Balance</th>
                  <th className="px-4 py-2 text-center">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{monthNames[f.month - 1]} {f.year}</td>
                    <td className="px-4 py-2 text-right text-green-600 font-medium">
                      {formatCurrency(f.projectedIncome, user?.currency)}
                    </td>
                    <td className="px-4 py-2 text-right text-red-600 font-medium">
                      {formatCurrency(f.projectedExpenses, user?.currency)}
                    </td>
                    <td className="px-4 py-2 text-right text-orange-600 font-medium">
                      {formatCurrency(f.projectedRecurringBills, user?.currency)}
                    </td>
                    <td className={`px-4 py-2 text-right font-bold ${f.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(f.projectedBalance, user?.currency)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {(f.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {forecasts.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-4">No forecasts generated yet. Click "Generate Forecast" to create one!</p>
          <Button onClick={generateForecasts}>Generate Forecast</Button>
        </Card>
      )}
    </div>
  );
}

export default CashFlowForecast;
