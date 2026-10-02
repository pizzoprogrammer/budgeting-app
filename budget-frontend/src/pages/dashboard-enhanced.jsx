import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, AlertCircle } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9', '#6366f1'];

export function Dashboard() {
  const { token } = useAuth();
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [categoryExpense, setCategoryExpense] = useState(null);
  const [categoryIncome, setCategoryIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [status, summary, expenseSummary, incomeSummary] = await Promise.all([
          api.budget.getStatus(token),
          api.transactions.getMonthlySummary(token),
          api.transactions.getCategoryExpenseSummary(token),
          api.transactions.getCategoryIncomeSummary(token),
        ]);

        if (status.error) setError(status.error);
        else setBudgetStatus(status);

        if (summary.error) setError(summary.error);
        else setMonthlySummary(summary);

        if (expenseSummary.error) setError(expenseSummary.error);
        else setCategoryExpense(expenseSummary);

        if (incomeSummary.error) setError(incomeSummary.error);
        else setCategoryIncome(incomeSummary);
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
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  const totalIncome = monthlySummary?.totalIncome || 0;
  const totalExpense = monthlySummary?.totalExpense || 0;
  const savings = totalIncome - totalExpense;
  const savingsPercent = totalIncome ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  // Prepare pie chart data
  const expenseData = categoryExpense?.map((item) => ({
    name: item.category,
    value: item.total,
  })) || [];

  const incomeData = categoryIncome?.map((item) => ({
    name: item.category,
    value: item.total,
  })) || [];

  // Find over-budget categories
  const overBudgetCategories = budgetStatus?.expenseStatus?.filter((item) => item.spent > item.budget) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 dark:text-gray-400">Total Income</p>
              <p className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-green-600 opacity-20" size={32} />
          </div>
        </Card>

        <Card className="p-6 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 dark:text-gray-400">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
            </div>
            <TrendingDown className="text-red-600 opacity-20" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 dark:text-gray-400">Remaining</p>
              <p className={`text-3xl font-bold ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${savings.toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-blue-600 opacity-20" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 dark:text-gray-400">Savings Rate</p>
              <p className="text-3xl font-bold text-indigo-600">{savingsPercent}%</p>
            </div>
            <PiggyBank className="text-indigo-600 opacity-20" size={32} />
          </div>
        </Card>
      </div>

      {/* Budget Alerts */}
      {overBudgetCategories.length > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 dark:text-orange-300 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">Budget Alerts</h3>
              <div className="space-y-2">
                {overBudgetCategories.map((item, idx) => (
                  <p key={idx} className="text-sm text-orange-800 dark:text-orange-200">
                    <span className="capitalize font-medium">{item.category}</span> is over budget by{' '}
                    <span className="font-bold">${(item.spent - item.budget).toFixed(2)}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        {expenseData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Income Breakdown */}
        {incomeData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Income Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Budget Status Table */}
      {budgetStatus && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Budget Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold text-gray-700 dark:text-gray-200">Category</th>
                  <th className="pb-3 font-semibold text-gray-700 dark:text-gray-200">Budget</th>
                  <th className="pb-3 font-semibold text-gray-700 dark:text-gray-200">Spent</th>
                  <th className="pb-3 font-semibold text-gray-700 dark:text-gray-200">Remaining</th>
                  <th className="pb-3 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {budgetStatus.expenseStatus?.map((item, idx) => {
                  const percentUsed = item.budget ? ((item.spent / item.budget) * 100).toFixed(0) : 0;
                  const isOverBudget = item.spent > item.budget;

                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
