import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, AlertCircle, RefreshCw, Clock, Target, Zap } from 'lucide-react';
import {
  calculateSavingsProgress,
  getSpendingInsights,
  compareMonths,
  formatCurrency
} from '@/lib/utils';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9', '#6366f1'];

export function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [categoryExpense, setCategoryExpense] = useState(null);
  const [categoryIncome, setCategoryIncome] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setIsRefreshing(true);
      const [status, summary, expenseSummary, incomeSummary, txList, goals, billsList] = await Promise.all([
        api.budget.getStatus(token),
        api.transactions.getMonthlySummary(token),
        api.transactions.getCategoryExpenseSummary(token),
        api.transactions.getCategoryIncomeSummary(token),
        api.transactions.getAll(token),
        api.savingsGoals.getAll(token),
        api.bills.getAll(token),
      ]);

      if (status.error) setError(status.error);
      else setBudgetStatus(status);

      if (summary.error) setError(summary.error);
      else setMonthlySummary(summary);

      if (expenseSummary.error) setError(expenseSummary.error);
      else setCategoryExpense(expenseSummary);

      if (incomeSummary.error) setError(incomeSummary.error);
      else setCategoryIncome(incomeSummary);

      if (txList && Array.isArray(txList)) setTransactions(txList);

      if (goals && Array.isArray(goals)) setSavingsGoals(goals);
      else setSavingsGoals([]);

      if (billsList && Array.isArray(billsList)) setBills(billsList);
      else setBills([]);

      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading && !monthlySummary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin inline-block">
            <RefreshCw className="text-gray-400" size={40} />
          </div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Parse monthly summary - API returns 'income' and 'expense', not 'totalIncome/totalExpense'
  const totalIncome = (monthlySummary && !monthlySummary.error) ? monthlySummary.income || 0 : 0;
  const totalExpense = (monthlySummary && !monthlySummary.error) ? monthlySummary.expense || 0 : 0;
  const savings = totalIncome - totalExpense;
  const savingsPercent = totalIncome ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  // Parse category breakdowns - API returns { breakdown: [...] }, not array directly
  const expenseArray = (categoryExpense && !categoryExpense.error && Array.isArray(categoryExpense.breakdown)) ? categoryExpense.breakdown : [];
  const expenseData = expenseArray.map((item) => ({
    name: item._id,  // API uses '_id' for category name, not 'category'
    value: item.total,
  }));

  const incomeArray = (categoryIncome && !categoryIncome.error && Array.isArray(categoryIncome.breakdown)) ? categoryIncome.breakdown : [];
  const incomeData = incomeArray.map((item) => ({
    name: item._id,  // API uses '_id' for category name, not 'category'
    value: item.total,
  }));

  // Parse budget status - API returns 'expenses' not 'expenseStatus'
  const overBudgetCategories = (budgetStatus && !budgetStatus.error && Array.isArray(budgetStatus.expenses)) ? budgetStatus.expenses.filter((item) => item.actual > item.budgeted) : [];

  // Calculate bills due within 5 days
  const billsDueSoon = bills.filter((bill) => {
    const today = new Date();
    const nextDueDate = new Date(bill.nextDueDate);
    const daysUntilDue = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilDue > 0 && daysUntilDue <= 5 && bill.status !== 'paid'; // Only show active/unpaid bills
  }).sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

  const formatTime = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-pulse">
          {error}
        </div>
      )}

      {/* Auto-Refresh Controls */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Last Updated</p>
              <p className="text-xs text-gray-600">{formatTime(lastUpdated)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Auto-refresh (60s)</span>
            </label>
            <Button
              onClick={fetchData}
              disabled={isRefreshing}
              className="gap-2"
              variant="outline"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Total Income</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(totalIncome, user?.currency)}</p>
            </div>
            <TrendingUp className="text-green-600 opacity-30" size={40} />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Total Expenses</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{formatCurrency(totalExpense, user?.currency)}</p>
            </div>
            <TrendingDown className="text-red-600 opacity-30" size={40} />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Remaining</p>
              <p className={`text-2xl sm:text-3xl font-bold ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(savings, user?.currency)}
              </p>
            </div>
            <DollarSign className="text-blue-600 opacity-30" size={40} />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Savings Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{savingsPercent}%</p>
            </div>
            <PiggyBank className="text-indigo-600 opacity-30" size={40} />
          </div>
        </Card>
      </div>

      {/* Budget Alerts */}
      {overBudgetCategories.length > 0 && (
        <Card className="p-6 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 animate-pulse">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-orange-900 mb-3">⚠️ Budget Alerts</h3>
              <div className="space-y-2">
                {overBudgetCategories.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white bg-opacity-50 p-3 rounded-lg">
                    <span className="text-sm text-orange-800">
                      <span className="capitalize font-medium">{item.category}</span> exceeded budget
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      +${(item.actual - item.budgeted).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Bill Due Alerts */}
      {billsDueSoon.length > 0 && (
        <Card className="p-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 animate-pulse">
          <div className="flex items-start gap-3">
            <Clock className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-3">⏰ Bills Due Soon</h3>
              <div className="space-y-2">
                {billsDueSoon.map((bill, idx) => {
                  const daysUntilDue = Math.ceil((new Date(bill.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={idx} className="flex items-center justify-between bg-white bg-opacity-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm text-blue-800 font-medium">{bill.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {daysUntilDue === 1 ? 'Tomorrow' : `In ${daysUntilDue} days`}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {formatCurrency(bill.amount, user?.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        {expenseData.length > 0 && (
          <Card className="p-6 hover:shadow-lg transition-all">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Expense Breakdown</h2>
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
          <Card className="p-6 hover:shadow-lg transition-all">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Income Breakdown</h2>
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

      {/* Premium Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Goal Progress */}
        {savingsGoals && savingsGoals.length > 0 ? (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-green-600" />
              <h3 className="font-bold text-gray-900">Active Savings Goals</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0),
                    user?.currency
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  of {formatCurrency(
                    savingsGoals.reduce((acc, goal) => acc + goal.targetAmount, 0),
                    user?.currency
                  )}
                </p>
              </div>
              <div className="text-xs text-gray-600">
                {savingsGoals.length} {savingsGoals.length === 1 ? 'goal' : 'goals'} active
              </div>
              <Button
                onClick={() => navigate('/savings-goals')}
                variant="outline"
                className="w-full text-xs"
                type="button"
              >
                View All Goals
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">No Savings Goals</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Create savings goals to track your financial targets
              </p>
              <Button
                onClick={() => navigate('/savings-goals')}
                className="w-full"
                type="button"
              >
                Create Your First Goal
              </Button>
            </div>
          </Card>
        )}

        {/* Month Comparison */}
        {(() => {
          const now = new Date();
          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();
          const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const previousMonth = previousDate.getMonth() + 1;
          const previousYear = previousDate.getFullYear();

          const comparison = compareMonths(transactions, currentMonth, currentYear, previousMonth, previousYear);
          const isUp = comparison.trend === 'up';

          return (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className={isUp ? 'text-orange-500' : 'text-green-600'} />
                <h3 className="font-bold text-gray-900">Month Comparison</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white bg-opacity-50 p-3 rounded">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-bold text-gray-900">${comparison.currentMonth.toFixed(2)}</p>
                </div>
                <div className="bg-white bg-opacity-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Last Month</p>
                  <p className="text-lg font-semibold text-gray-700">${comparison.previousMonth.toFixed(2)}</p>
                </div>
                <div className={`p-3 rounded text-center ${isUp ? 'bg-orange-100' : 'bg-green-100'}`}>
                  <p className={`text-sm font-medium ${isUp ? 'text-orange-800' : 'text-green-800'}`}>
                    {isUp ? '📈' : '📉'} {Math.abs(comparison.percentChange)}% {isUp ? 'Higher' : 'Lower'}
                  </p>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Smart Insights Card */}
        {(() => {
          const insights = getSpendingInsights(transactions, budgetStatus?.expenses || []);
          return (
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-purple-600" />
                <h3 className="font-bold text-gray-900">Smart Insights</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {insights.length > 0 ? (
                  insights.slice(0, 4).map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-xs ${
                        insight.type === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {insight.type === 'error' ? '🔴' : '⚠️'} {insight.message}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600 text-center py-4">
                    ✅ All spending on track!
                  </div>
                )}
              </div>
            </Card>
          );
        })()}
      </div>

      {/* Budget Status Table */}
      {budgetStatus && !budgetStatus.error && Array.isArray(budgetStatus.expenses) && budgetStatus.expenses.length > 0 && (
        <Card className="p-6 hover:shadow-lg transition-all overflow-hidden">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">Budget Overview</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b dark:border-gray-700">
                <tr className="text-left">
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Category</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Budget</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Spent</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-700 dark:text-gray-200 hidden sm:table-cell">Remaining</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {budgetStatus.expenses.map((item, idx) => {
                  // API uses 'budgeted' and 'actual', not 'budget' and 'spent'
                  const percentUsed = item.budgeted ? ((item.actual / item.budgeted) * 100).toFixed(0) : 0;
                  const isOverBudget = item.actual > item.budgeted;

                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 sm:px-6 py-3 capitalize font-medium dark:text-gray-300">{item.category}</td>
                      <td className="px-4 sm:px-6 py-3 dark:text-gray-300">${item.budgeted.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-3 dark:text-gray-300">${item.actual.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-3 hidden sm:table-cell dark:text-gray-300">${(item.budgeted - item.actual).toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isOverBudget ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-400 min-w-fit">{percentUsed}%</span>
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
