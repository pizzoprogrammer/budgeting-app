import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, BarChart3, Bell, Zap, Eye, EyeOff } from 'lucide-react';

export function SettingsPage() {
  const { token, user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const BUDGETING_METHODOLOGIES = [
    { id: 'traditional', label: 'Traditional', desc: 'Standard monthly budgeting' },
    { id: 'zero-based', label: 'Zero-Based', desc: 'Every dollar has a purpose' },
    { id: 'envelope', label: 'Envelope', desc: 'Money in buckets' },
    { id: '50-30-20', label: '50/30/20 Rule', desc: '50% needs, 30% wants, 20% savings' },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const result = await api.settings.get(token);
        if (result.error) {
          setError(result.error);
        } else {
          setSettings(result);
        }
      } catch (err) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const handleSaveStrategy = async (methodology) => {
    if (!token) return;
    setSaving(true);
    try {
      const result = await api.settings.updateBudgetingMethodology(token, methodology);
      if (result.error) {
        setError(result.error);
      } else {
        setSettings(result);
      }
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMFA = async (enabled) => {
    if (!token) return;
    setSaving(true);
    try {
      const result = await api.settings.updateMFA(token, enabled, 'email');
      if (result.error) {
        setError(result.error);
      } else {
        setSettings(result);
      }
    } catch (err) {
      setError('Failed to update MFA settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = async (type, value) => {
    if (!token) return;
    setSaving(true);
    try {
      const result = await api.settings.updateNotifications(token, { [type]: value });
      if (result.error) {
        setError(result.error);
      } else {
        setSettings(result);
      }
    } catch (err) {
      setError('Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300">{error}</div>}

      {/* Budgeting Methodology */}
      <Card className="p-6 dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgeting Methodology</h2>
        </div>
        <p className="text-gray-600 mb-6 dark:text-gray-400">Choose your preferred budgeting approach</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUDGETING_METHODOLOGIES.map(method => (
            <button
              key={method.id}
              onClick={() => handleSaveStrategy(method.id)}
              disabled={saving}
              className={`p-4 rounded-lg border-2 transition text-left ${
                settings?.budgetingMethodology === method.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                  : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-500'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">{method.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{method.desc}</div>
              {settings?.budgetingMethodology === method.id && (
                <Badge className="mt-2 bg-blue-600 dark:bg-blue-500">Selected</Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6 dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-green-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add extra protection to your account</p>
              </div>
            </div>
            <Button
              variant={settings?.mfaEnabled ? 'default' : 'outline'}
              onClick={() => handleToggleMFA(!settings?.mfaEnabled)}
              disabled={saving}
            >
              {settings?.mfaEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>

          {settings?.mfaEnabled && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">✓ 2FA is enabled via {settings?.mfaMethod}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-orange-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.billReminders}
              onChange={(e) => handleToggleNotification('billReminders', e.target.checked)}
              disabled={saving}
              className="w-4 h-4 rounded"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Bill Reminders</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified before bills are due</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.budgetAlerts}
              onChange={(e) => handleToggleNotification('budgetAlerts', e.target.checked)}
              disabled={saving}
              className="w-4 h-4 rounded"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Budget Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alert when you exceed budget categories</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.forecastAlerts}
              onChange={(e) => handleToggleNotification('forecastAlerts', e.target.checked)}
              disabled={saving}
              className="w-4 h-4 rounded"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Forecast Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notify about projected negative balances</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Auto-Categorization */}
      <Card className="p-6 dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-yellow-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Features</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={settings?.autoCategory}
              className="w-4 h-4 rounded"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Auto-Categorization</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically categorize transactions based on merchant</p>
            </div>
          </label>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Machine learning model learns from your categorization to improve accuracy
            </p>
          </div>
        </div>
      </Card>

      {/* Bank Integration Status */}
      <Card className="p-6 dark:bg-slate-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connected Bank Accounts</h2>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-3">No bank accounts connected yet</p>
          <Button variant="outline">Connect Bank Account</Button>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
          ℹ️ Plaid integration is ready. Connect your bank to auto-sync transactions.
        </div>
      </Card>

      <div className="pt-6 border-t dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Settings saved automatically. Last updated: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : 'Never'}
        </p>
      </div>
    </div>
  );
}

export default SettingsPage;
