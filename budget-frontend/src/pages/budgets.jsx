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

export function Budgets() {
  const { token } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
  });

  const fetchBudgets = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const result = await api.budget.getAll(token, month, year);
      if (result.error) {
        setError(result.error);
      } else {
        // Filter for expense budgets only
        setBudgets(result.filter((b) => b.type === 'expense'));
      }
    } catch (err) {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [token, month, year]);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const result = await api.budget.create(token, {
        category: formData.category,
        amount: parseFloat(formData.amount),
        type: 'expense',
        month,
        year,
      });

      if (result.error) {
        setError(result.error);
      } else {
        await fetchBudgets();
        setDialogOpen(false);
        setFormData({ category: '', amount: '' });
      }
    } catch (err) {
      setError('Failed to add budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!token) return;
    try {
      const result = await api.budget.delete(token, id);
      if (result.error) {
        setError(result.error);
      } else {
        await fetchBudgets();
      }
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-gray-900">Budgets</h1>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(year, m - 1).toLocaleDateString('en-US', {
                      month: 'long',
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={20} />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBudget} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Budget Amount</Label>
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

                <Button type="submit" className="w-full">
                  Add Budget
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading budgets...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.length === 0 ? (
            <Card className="p-8 col-span-full">
              <p className="text-center text-gray-500">
                No budgets set for {new Date(year, month - 1).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}. Create one to track your spending!
              </p>
            </Card>
          ) : (
            budgets.map((budget) => (
              <Card key={budget._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold capitalize text-gray-900">
                      {budget.category}
                    </h3>
                    <p className="text-2xl font-bold text-indigo-600 mt-2">
                      ${budget.amount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBudget(budget._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {budget.spent !== undefined && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Spent</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${budget.spent.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          budget.spent > budget.amount ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        {((budget.spent / budget.amount) * 100).toFixed(0)}% used
                      </span>
                      {budget.spent > budget.amount && (
                        <Badge className="bg-red-100 text-red-800">
                          Overspent by ${(budget.spent - budget.amount).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
