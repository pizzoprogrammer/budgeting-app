import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Search, Filter, RefreshCw, Clock, Download } from 'lucide-react';
import { exportToCSV, formatTransactionsForExport } from '@/lib/utils';

const EXPENSE_CATEGORIES = [
  'food',
  'rent',
  'shopping',
  'utilities',
  'entertainment',
  'transport',
  'others',
];

const INCOME_CATEGORIES = [
  'salary',
  'wages',
  'freelance',
  'business',
  'kindcheque',
  'investments',
  'gifts',
  'others',
];

export function Transactions() {
  const { token, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    type: 'expense',
    note: '',
  });
  const [success, setSuccess] = useState('');

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    try {
      setIsRefreshing(true);
      const result = await api.transactions.getAll(token);
      if (result.error) {
        setError(result.error);
      } else {
        setTransactions(result);
        setLastUpdated(new Date());
        setError('');
      }
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (searchQuery && !transaction.note?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }

      if (filterCategory !== 'all' && transaction.category !== filterCategory) {
        return false;
      }

      const transactionDate = new Date(transaction.date);
      if (filterStartDate) {
        const startDate = new Date(filterStartDate);
        if (transactionDate < startDate) return false;
      }
      if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (transactionDate > endDate) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, filterType, filterCategory, filterStartDate, filterEndDate]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const result = await api.transactions.create(token, {
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        note: formData.note,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Transaction added successfully!');
        await fetchTransactions();
        setDialogOpen(false);
        setFormData({ amount: '', category: '', type: 'expense', note: '' });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!token) return;
    try {
      const result = await api.transactions.delete(token, id);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Transaction deleted successfully!');
        await fetchTransactions();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="flex items-center gap-2">
          {filteredTransactions.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 dark:border-gray-600 dark:text-gray-300"
              onClick={() => {
                const exportData = formatTransactionsForExport(filteredTransactions);
                exportToCSV(exportData, `transactions-${new Date().toISOString().split('T')[0]}.csv`);
              }}
            >
              <Download size={20} />
              Export
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 hover:shadow-lg transition-all">
                <Plus size={20} />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value, category: '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input
                    id="note"
                    type="text"
                    placeholder="Add a note..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full hover:shadow-lg transition-all">
                  Add Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 animate-pulse">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-900 rounded-lg text-green-700 dark:text-emerald-200 animate-pulse">
          ✓ {success}
        </div>
      )}

      {/* Auto-Refresh Controls */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-slate-900 dark:to-slate-800 dark:border-blue-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-blue-600 dark:text-blue-300" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Last Updated</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{formatTime(lastUpdated)}</p>
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
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-refresh (30s)</span>
            </label>
            <Button
              onClick={fetchTransactions}
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

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600 dark:text-gray-300" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            placeholder="Start date"
          />

          <Input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            placeholder="End date"
          />
        </div>

        {(searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterStartDate || filterEndDate) && (
          <Button variant="outline" onClick={clearFilters} className="text-sm">
            Clear Filters
          </Button>
        )}
      </Card>

      {/* Transactions Table */}
      {loading && !transactions.length ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin">
            <RefreshCw className="text-gray-400" size={32} />
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <tr className="text-left">
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Date</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Category</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Type</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Amount</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Note</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {transactions.length === 0
                        ? 'No transactions yet. Add your first transaction to get started!'
                        : 'No transactions match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-3 dark:text-gray-300">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 capitalize font-medium dark:text-gray-300">{transaction.category}</td>
                      <td className="px-6 py-3">
                        <Badge
                          className={
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }
                        >
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 font-semibold">
                        <span
                          className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, user?.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {transaction.note || '-'}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-2 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t bg-gray-50 dark:border-gray-700 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 font-medium">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </Card>
      )}
    </div>
  );
}
