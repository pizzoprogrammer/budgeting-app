import { useEffect, useState } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';

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

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Transactions</h1>
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

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
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
              <tbody className="divide-y dark:divide-gray-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No transactions yet. Add your first transaction to get started!
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-3 dark:text-gray-300">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 capitalize dark:text-gray-300">{transaction.category}</td>
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
        </Card>
      )}
    </div>
  );
}
