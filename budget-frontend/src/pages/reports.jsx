import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, Lightbulb, BarChart3, Calendar } from 'lucide-react';
import {
  getCategorySpendingStats,
  getSpendingRecommendations,
  calculateSpendingTrends,
} from '@/lib/utils';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9', '#6366f1'];

export function Reports() {
  const { token, user } = useAuth();
  const [categoryExpense, setCategoryExpense] = useState(null);
  const [categoryIncome, setCategoryIncome] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timePeriod, setTimePeriod] = useState('monthly'); // 'monthly' or 'yearly'

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [expenseSummary, incomeSummary, txList, summary] = await Promise.all([
          api.transactions.getCategoryExpenseSummary(token),
          api.transactions.getCategoryIncomeSummary(token),
          api.transactions.getAll(token),
          api.transactions.getMonthlySummary(token),
        ]);

        if (expenseSummary.error) setError(expenseSummary.error);
        else setCategoryExpense(expenseSummary);

        if (incomeSummary.error) setError(incomeSummary.error);
        else setCategoryIncome(incomeSummary);

        if (txList && Array.isArray(txList)) setTransactions(txList);

        if (summary && !summary.error) setMonthlySummary(summary);
      } catch (err) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading reports...</p>
      </div>
    );
  }

  // Helper: Calculate yearly summary from transactions
  const calculateYearlySummary = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);

    const yearTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= yearStart && txDate <= yearEnd;
    });

    const yearlyIncome = yearTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const yearlyExpense = yearTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Group by month
    const monthlyData = {};
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = { income: 0, expense: 0 };
    }

    yearTransactions.forEach(tx => {
      const month = new Date(tx.date).getMonth();
      if (tx.type === 'income') {
        monthlyData[month].income += tx.amount;
      } else {
        monthlyData[month].expense += tx.amount;
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month: monthNames[month],
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    }));

    return { yearlyIncome, yearlyExpense, chartData, yearTransactions };
  };

  // Helper: Calculate category breakdown for yearly data
  const calculateYearlyCategoryBreakdown = (typeTransactions) => {
    const breakdown = {};
    typeTransactions.forEach(tx => {
      if (!breakdown[tx.category]) {
        breakdown[tx.category] = 0;
      }
      breakdown[tx.category] += tx.amount;
    });
    return Object.entries(breakdown).map(([category, total]) => ({
      name: category,
      value: total
    }));
  };

  // API returns { breakdown: [...] }, not array directly
  // API uses '_id' for category, not 'category'
  const expenseArray = (categoryExpense && !categoryExpense.error && Array.isArray(categoryExpense.breakdown)) ? categoryExpense.breakdown : [];
  const expenseData = expenseArray.map((item) => ({
    name: item._id,
    value: item.total,
  }));

  const incomeArray = (categoryIncome && !categoryIncome.error && Array.isArray(categoryIncome.breakdown)) ? categoryIncome.breakdown : [];
  const incomeData = incomeArray.map((item) => ({
    name: item._id,
    value: item.total,
  }));

  const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);
  const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);

  // Compute yearly data
  const { yearlyIncome, yearlyExpense, chartData: yearlyChartData, yearTransactions } = calculateYearlySummary();
  const yearlyIncomeTransactions = yearTransactions.filter(tx => tx.type === 'income');
  const yearlyExpenseTransactions = yearTransactions.filter(tx => tx.type === 'expense');
  const yearlyExpenseData = calculateYearlyCategoryBreakdown(yearlyExpenseTransactions);
  const yearlyIncomeData = calculateYearlyCategoryBreakdown(yearlyIncomeTransactions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setTimePeriod('monthly')}
            variant={timePeriod === 'monthly' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Calendar size={16} />
            Monthly
          </Button>
          <Button
            onClick={() => setTimePeriod('yearly')}
            variant={timePeriod === 'yearly' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Calendar size={16} />
            Yearly
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Total Income {timePeriod === 'yearly' ? '(This Year)' : '(This Month)'}
            </h3>
            <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(
              timePeriod === 'yearly' ? yearlyIncome : (totalIncome || 0),
              user?.currency
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {timePeriod === 'yearly' ? yearlyIncomeData.length : incomeData.length} income sources
          </p>
        </Card>

        <Card className="p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Total Expenses {timePeriod === 'yearly' ? '(This Year)' : '(This Month)'}
            </h3>
            <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(
              timePeriod === 'yearly' ? yearlyExpense : (totalExpense || 0),
              user?.currency
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {timePeriod === 'yearly' ? yearlyExpenseData.length : expenseData.length} expense categories
          </p>
        </Card>
      </div>

      {timePeriod === 'yearly' && (
        <Card className="p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Monthly Trends for {new Date().getFullYear()}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value, user?.currency)} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Expense Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie */}
        {(timePeriod === 'yearly' ? yearlyExpenseData : expenseData).length > 0 && (
          <Card className="p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Expense Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timePeriod === 'yearly' ? yearlyExpenseData : expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(timePeriod === 'yearly' ? yearlyExpenseData : expenseData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, user?.currency)} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Expense Breakdown Bar */}
        {(timePeriod === 'yearly' ? yearlyExpenseData : expenseData).length > 0 && (
          <Card className="p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Expenses by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timePeriod === 'yearly' ? yearlyExpenseData : expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value, user?.currency)} />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Income Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown Pie */}
        {(timePeriod === 'yearly' ? yearlyIncomeData : incomeData).length > 0 && (
          <Card className="p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Income Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timePeriod === 'yearly' ? yearlyIncomeData : incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(timePeriod === 'yearly' ? yearlyIncomeData : incomeData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, user?.currency)} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Income Breakdown Bar */}
        {(timePeriod === 'yearly' ? yearlyIncomeData : incomeData).length > 0 && (
          <Card className="p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Income by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timePeriod === 'yearly' ? yearlyIncomeData : incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value, user?.currency)} />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Details */}
        {expenseData.length > 0 && (
          <Card className="p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Expense Details</h2>
            <div className="divide-y dark:divide-gray-700">
              {expenseArray?.map((item, idx) => {
                const percent = ((item.total / totalExpense) * 100).toFixed(1);
                return (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize text-gray-900 dark:text-gray-300">{item._id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">${item.total.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600 dark:text-red-400">${item.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{percent}% of expenses</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Income Details */}
        {incomeData.length > 0 && (
          <Card className="p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Income Details</h2>
            <div className="divide-y dark:divide-gray-700">
              {incomeArray?.map((item, idx) => {
                const percent = ((item.total / totalIncome) * 100).toFixed(1);
                return (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize text-gray-900 dark:text-gray-300">{item._id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">${item.total.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">${item.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{percent}% of income</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Premium Analytics Section */}
      <div className="space-y-6">
        {/* Category Spending Statistics */}
        {transactions.length > 0 && (
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={24} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Category Spending Analysis</h2>
            </div>
            {(() => {
              const stats = getCategorySpendingStats(transactions);
              return stats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Category</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Total</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Count</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Average</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-600">
                      {stats.map((stat, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-4 py-3 capitalize font-medium text-gray-900 dark:text-gray-300">{stat.category}</td>
                          <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">${stat.total.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-400">{stat.count}</td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-400">${stat.average.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">No spending data available</p>
              );
            })()}
          </Card>
        )}

        {/* Smart Spending Recommendations */}
        {transactions.length > 0 && monthlySummary && (
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:shadow-lg transition-all border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb size={24} className="text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Recommendations</h2>
            </div>
            {(() => {
              const stats = getCategorySpendingStats(transactions);
              const income = monthlySummary?.income || 0;
              const recommendations = getSpendingRecommendations(stats, income);
              return recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-30 rounded-lg border border-amber-100 dark:border-amber-800 flex gap-3"
                    >
                      <span className="text-xl flex-shrink-0">💡</span>
                      <p className="text-gray-800 dark:text-gray-200">{rec.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">✅ Great job!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your spending patterns look healthy</p>
                </div>
              );
            })()}
          </Card>
        )}
      </div>
    </div>
  );
}
