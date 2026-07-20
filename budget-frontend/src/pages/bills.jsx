import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Check, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function Bills() {
  const { token, user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'utilities',
    dueDate: '1',
    frequency: 'monthly',
  });

  const CATEGORIES = ['utilities', 'entertainment', 'insurance', 'subscriptions', 'rent', 'others'];

  const fetchBills = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const result = await api.bills.getAll(token);
      if (result.error) {
        setError(result.error);
      } else {
        setBills(result || []);
        setError('');
      }
    } catch (err) {
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleAddBill = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const result = await api.bills.create(token, {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        dueDate: parseInt(formData.dueDate),
        frequency: formData.frequency,
      });

      if (result.error) {
        setError(result.error);
      } else {
        await fetchBills();
        setDialogOpen(false);
        setFormData({ name: '', amount: '', category: 'utilities', dueDate: '1', frequency: 'monthly' });
      }
    } catch (err) {
      setError('Failed to add bill');
    }
  };

  const handleMarkPaid = async (billId) => {
    if (!token) return;
    try {
      const result = await api.bills.markPaid(token, billId);
      if (!result.error) {
        await fetchBills();
      }
    } catch (err) {
      setError('Failed to mark bill as paid');
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!token) return;
    try {
      const result = await api.bills.delete(token, billId);
      if (!result.error) {
        await fetchBills();
      }
    } catch (err) {
      setError('Failed to delete bill');
    }
  };

  if (loading) return <div className="text-center py-8">Loading bills...</div>;

  const upcomingBills = bills.filter(b => b.isUpcoming);
  const pastBills = bills.filter(b => !b.isUpcoming);
  const totalMonthly = bills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900">Bills & Subscriptions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <Label htmlFor="name">Bill Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Netflix, Electricity"
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date (Day of Month)</Label>
                <Input
                  id="dueDate"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">Add Bill</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Monthly Recurring Bills</h2>
        <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalMonthly, user?.currency)}</p>
        <p className="text-sm text-gray-600 mt-2">{bills.length} total bills</p>
      </Card>

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" /> Upcoming Bills ({upcomingBills.length})
          </h2>
          <div className="grid gap-4">
            {upcomingBills.map(bill => (
              <Card key={bill._id} className="p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{bill.name}</h3>
                    <p className="text-sm text-gray-600">
                      Due in {bill.daysUntilDue} days • {new Date(bill.nextDueDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{bill.category}</Badge>
                      <Badge variant="outline">{bill.frequency}</Badge>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(bill.amount, user?.currency)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMarkPaid(bill._id)}
                      variant="ghost"
                      size="icon"
                      className="text-green-600 hover:bg-green-50"
                    >
                      <Check size={18} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteBill(bill._id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bills.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No bills yet. Add your first bill to get started!</p>
        </Card>
      )}
    </div>
  );
}

export default Bills;
