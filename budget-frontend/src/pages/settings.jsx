import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { api } from '@/lib/api';
import { CurrencySelector } from '@/components/currency-selector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Copy, Moon, Sun, LogOut, Shield, Bell, Lock, Mail, Calendar, UserCheck, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Settings() {
  const { user, setUser, token, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);

  // currency state for dropdown
  const [localCurrency, setLocalCurrency] = useState(user?.currency || 'USD');
  const [currencyMessage, setCurrencyMessage] = useState('');

  // sync localCurrency when user.currency changes
  useEffect(() => {
    if (user?.currency) {
      setLocalCurrency(user.currency);
    }
  }, [user?.currency]);

  // password change state
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdMessageType, setPwdMessageType] = useState(''); // 'success' or 'error'

  const handleChangePassword = async () => {
    if (!oldPwd) {
      setPwdMessage('Current password is required');
      setPwdMessageType('error');
      return;
    }
    if (!newPwd || !confirmPwd) {
      setPwdMessage('New password and confirmation are required');
      setPwdMessageType('error');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMessage('New passwords do not match');
      setPwdMessageType('error');
      return;
    }
    if (newPwd === oldPwd) {
      setPwdMessage('New password must be different from current password');
      setPwdMessageType('error');
      return;
    }
    if (newPwd.length < 6) {
      setPwdMessage('New password must be at least 6 characters');
      setPwdMessageType('error');
      return;
    }

    setPwdLoading(true);
    try {
      const updated = await api.profile.update(token, { 
        oldPassword: oldPwd,
        password: newPwd 
      });
      if (updated && !updated.error) {
        setPwdMessage('✓ Password updated successfully');
        setPwdMessageType('success');
        setOldPwd('');
        setNewPwd('');
        setConfirmPwd('');
        setTimeout(() => setPwdMessage(''), 3000);
      } else if (updated.error) {
        setPwdMessage(updated.error);
        setPwdMessageType('error');
      }
    } catch (e) {
      console.error(e);
      setPwdMessage('Failed to update password');
      setPwdMessageType('error');
    } finally {
      setPwdLoading(false);
    }
  };

  const updateCurrency = async () => {
    if (!user || !token) {
      setCurrencyMessage('Not logged in');
      return;
    }
    if (localCurrency === user.currency) {
      setCurrencyMessage('No change to save');
      return;
    }
    try {
      const updated = await api.profile.update(token, { currency: localCurrency });
      if (updated && !updated.error) {
        setUser(prev => ({ ...prev, currency: updated.currency }));
        setCurrencyMessage('✓ Currency saved successfully');
        setTimeout(() => setCurrencyMessage(''), 3000);
      } else {
        setCurrencyMessage(updated?.error || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      setCurrencyMessage('Error: ' + (err.message || 'Failed to save'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and security</p>
      </div>

      {/* Modern Profile Card */}
      <Card className="p-0 overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-0 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>

        <div className="relative p-8">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/30 shadow-lg hover:shadow-xl transition-shadow">
                <span className="text-4xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                <Zap size={14} className="mr-1" />
                {user?.role === 'admin' ? 'Administrator' : 'Active Member'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">{user?.name}</h2>
              <div className="flex items-center gap-2 text-white/80 mb-4">
                <Mail size={16} />
                <p className="text-sm">{user?.email}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm">
                  <span className="flex items-center gap-2">
                    <Shield size={14} />
                    Security: Active
                  </span>
                </div>
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm">
                  <span className="flex items-center gap-2">
                    <UserCheck size={14} />
                    Verified Account
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Information - Modern Grid */}
      <Card className="p-8 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-2">
          <Lock size={24} className="text-blue-600 dark:text-blue-400" />
          Account Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name - Enhanced */}
          <div className="group">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-3">Full Name</label>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-500 transition-all">
              <UserCheck size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-gray-900 dark:text-white font-semibold">{user?.name}</p>
            </div>
          </div>

          {/* Email Address - Enhanced */}
          <div className="group">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-3">Email Address</label>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-500 transition-all cursor-pointer" onClick={() => copyToClipboard(user?.email)}>
              <Mail size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-gray-900 dark:text-white font-semibold break-all text-sm">{user?.email}</p>
              <Copy size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0 ml-auto" />
            </div>
            {copiedId && <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Copied!</p>}
          </div>

          {/* Account Role - Enhanced */}
          <div className="group">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-3">Account Role</label>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-500 transition-all">
              <Shield size={18} className={user?.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'} />
              <p className="text-gray-900 dark:text-white font-semibold">
                {user?.role === 'admin' ? 'Administrator' : 'Regular User'}
              </p>
              {user?.role === 'admin' && <span className="ml-auto px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded font-semibold">Admin</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={24} />
          Preferences
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon size={20} className="text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Sun size={20} className="text-yellow-500" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Theme</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Currency Preference */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Currency
          </label>
          <CurrencySelector
            value={user?.currency || 'USD'}
            onChange={(newCurrency) => setLocalCurrency(newCurrency)}
          />
          <Button
            type="button"
            className="w-full mt-3"
            onClick={updateCurrency}
          >
            Save Currency
          </Button>
          {currencyMessage && (
            <p className={`text-sm mt-2 ${
              currencyMessage.includes('Error') || currencyMessage.includes('Failed') || currencyMessage.includes('Not logged')
                ? 'text-red-600'
                : 'text-green-600'
            }`}>
              {currencyMessage}
            </p>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 Theme preference is saved and will be remembered next time you visit.
          </p>
        </div>
      </Card>

      {/* Advanced Options */}
      <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Advanced</h2>

        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clear Browser Cache</p>
            <Button
              variant="outline"
              className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => {
                localStorage.clear();
                alert('Cache cleared! Please refresh the page.');
              }}
            >
              Clear Cache
            </Button>
          </div>

          {/* Change Password */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Change Password</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="oldPwd">Current Password</Label>
                <Input id="oldPwd" type="password" placeholder="Enter your current password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} disabled={pwdLoading} />
              </div>
              <div>
                <Label htmlFor="newPwd">New Password</Label>
                <Input id="newPwd" type="password" placeholder="Enter your new password" value={newPwd} onChange={e => setNewPwd(e.target.value)} disabled={pwdLoading} />
              </div>
              <div>
                <Label htmlFor="confirmPwd">Confirm New Password</Label>
                <Input id="confirmPwd" type="password" placeholder="Confirm your new password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} disabled={pwdLoading} />
              </div>
              <Button onClick={handleChangePassword} disabled={pwdLoading} type="button">
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </Button>
              {pwdMessage && (
                <p className={`text-sm ${pwdMessageType === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {pwdMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Logout Section */}
      <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
        <h2 className="text-2xl font-bold mb-4 text-red-900 dark:text-red-300 flex items-center gap-2">
          <LogOut size={24} />
          Logout
        </h2>
        <p className="text-red-800 dark:text-red-400 mb-4">
          Sign out of your account. You'll need to login again to access your data.
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors font-medium flex items-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </Card>

      {/* About This App */}
      <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">About</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>💰 <strong>Budget App</strong> v1.0.0</p>
          <p>A modern, responsive budgeting and expense tracking application.</p>
          
        </div>
      </Card>
    </div>
  );
}
