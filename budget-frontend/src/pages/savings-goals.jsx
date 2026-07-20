import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function SavingsGoals() {
  const { user, token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  });

  // Fetch goals on mount
  useEffect(() => {
    if (token) {
      fetchGoals();
    }
  }, [token]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const result = await api.savingsGoals.getAll(token);
      if (result && !result.error) {
        setGoals(result);
      }
    } catch (err) {
      console.error('Failed to fetch goals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
    });
    setShowModal(true);
  };

  const handleEditClick = (goal) => {
    setEditingId(goal._id);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.targetAmount) {
      setMessage('Name and target amount are required');
      setMessageType('error');
      return;
    }

    const payload = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      targetDate: formData.targetDate ? new Date(formData.targetDate) : null,
    };

    try {
      let result;
      if (editingId) {
        result = await api.savingsGoals.update(token, editingId, payload);
        setMessage('✓ Goal updated successfully');
      } else {
        result = await api.savingsGoals.create(token, payload);
        setMessage('✓ Goal created successfully');
      }

      if (result && !result.error) {
        setMessageType('success');
        setShowModal(false);
        await fetchGoals();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result?.error || 'Failed to save goal');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Failed to save goal', err);
      setMessage('Error saving goal');
      setMessageType('error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const result = await api.savingsGoals.delete(token, id);
      if (result && !result.error) {
        setMessage('✓ Goal deleted successfully');
        setMessageType('success');
        await fetchGoals();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result?.error || 'Failed to delete goal');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Failed to delete goal', err);
      setMessage('Error deleting goal');
      setMessageType('error');
    }
  };

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Target size={28} className="text-blue-600 dark:text-blue-400" />
          Savings Goals
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Create and track your personal savings goals</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${messageType === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'}`}>
          {message}
        </div>
      )}

      <Button
        onClick={handleAddClick}
        className="flex items-center gap-2"
        type="button"
      >
        <Plus size={20} />
        Add New Goal
      </Button>

      {loading ? (
        <Card className="p-8 text-center dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Loading goals...</p>
        </Card>
      ) : goals.length === 0 ? (
        <Card className="p-8 text-center dark:bg-gray-800 dark:border-gray-700">
          <Target size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No goals yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first savings goal to get started!</p>
          <Button
            onClick={handleAddClick}
            type="button"
            className="w-full sm:w-auto"
          >
            Create Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <Card key={goal._id} className="p-6 dark:bg-gray-800 dark:border-gray-700 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No target date'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(goal)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      type="button"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(goal.currentAmount, user?.currency)}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(goal.targetAmount, user?.currency)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {progress.toFixed(0)}% of target • {formatCurrency(remaining, user?.currency)} remaining
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <TrendingUp size={16} />
                    <span>On track</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingId ? 'Edit Goal' : 'Create New Goal'}
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalName">Goal Name</Label>
                  <Input
                    id="goalName"
                    placeholder="e.g., Emergency Fund"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    type="text"
                  />
                </div>

                <div>
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    placeholder="e.g., 5000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    type="number"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    placeholder="e.g., 1000"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    type="number"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="targetDate">Target Date (Optional)</Label>
                  <Input
                    id="targetDate"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    type="date"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1"
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                    type="button"
                  >
                    {editingId ? 'Update Goal' : 'Create Goal'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
