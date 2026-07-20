import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';

export function Dashboard() {
  const { token, user } = useAuth();
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [status, summary] = await Promise.all([
          api.budget.getStatus(token),
          api.transactions.getMonthlySummary(token),
        ]);

        if (status.error) {
          setError(status.error);
        } else {
          setBudgetStatus(status);
        }

        if (summary.error) {
          setError(summary.error);
        } else {
          setMonthlySummary(summary);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const totalIncome = monthlySummary?.totalIncome || 0;
  const totalExpense = monthlySummary?.totalExpense || 0;
  const savings = totalIncome - totalExpense;
  const savingsPercent = totalIncome ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Income</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome, user?.currency)}</p>
            </div>
            <TrendingUp className="text-green-600 opacity-20" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpense, user?.currency)}</p>
            </div>
            <TrendingDown className="text-red-600 opacity-20" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Remaining</p>
              <p className={`text-3xl font-bold ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(savings, user?.currency)}
              </p>
            </div>
            <DollarSign className="text-blue-600 opacity-20" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Savings Rate</p>
              <p className="text-3xl font-bold text-indigo-600">{savingsPercent}%</p>
            </div>
            <PiggyBank className="text-indigo-600 opacity-20" size={32} />
          </div>
        </Card>
      </div>

      {/* Budget Status */}
      {budgetStatus && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Budget Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold text-gray-700">Category</th>
                  <th className="pb-3 font-semibold text-gray-700">Budget</th>
                  <th className="pb-3 font-semibold text-gray-700">Spent</th>
                  <th className="pb-3 font-semibold text-gray-700">Remaining</th>
                  <th className="pb-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {budgetStatus.expenseStatus?.map((item, idx) => {
                  const percentUsed = item.budget ? ((item.spent / item.budget) * 100).toFixed(0) : 0;
                  const isOverBudget = item.spent > item.budget;

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-3 capitalize">{item.category}</td>
                      <td className="py-3">${item.budget.toFixed(2)}</td>
                      <td className="py-3">${item.spent.toFixed(2)}</td>
                      <td className="py-3">${(item.budget - item.spent).toFixed(2)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isOverBudget ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{percentUsed}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
