import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
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
import { Plus, Trash2, Search, Filter } from 'lucide-react';

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
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const result = await api.transactions.getAll(token);
      if (result.error) {
        setError(result.error);
      } else {
        setTransactions(result);
      }
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      if (searchQuery && !transaction.note?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && transaction.category !== filterCategory) {
        return false;
      }

      // Date range filter
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
        await fetchTransactions();
        setDialogOpen(false);
        setFormData({ amount: '', category: '', type: 'expense', note: '' });
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
        await fetchTransactions();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900">Transactions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
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

              <Button type="submit" className="w-full">
                Add Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600 dark:text-gray-300" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
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

          {/* Category Filter */}
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

          {/* Start Date */}
          <Input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            placeholder="Start date"
          />

          {/* End Date */}
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
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50 dark:bg-gray-800">
                <tr className="text-left">
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Date</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Category</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Type</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Amount</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Note</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
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
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 capitalize">{transaction.category}</td>
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
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                        {transaction.note || '-'}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors"
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
          <div className="px-6 py-3 border-t bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </Card>
      )}
    </div>
  );
}
