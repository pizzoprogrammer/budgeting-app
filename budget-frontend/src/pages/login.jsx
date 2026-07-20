import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Mail } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.auth.login(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        setToken(result.token);
        setUser({
          email,
          name: result.name,
          role: result.role,
          currency: result.currency || 'USD'
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetMessage('Please enter your email');
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    // TODO: Implement actual password reset endpoint
    // For now, show a success message
    setResetMessage('✓ If an account exists with this email, you will receive a password reset link.');
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetEmail('');
      setResetMessage('');
    }, 3000);
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Budget App</h1>
        <p className="text-center text-gray-600 mb-6">Manage your finances wisely</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Sign up
          </Link>
        </p>
      </Card>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
            <p className="text-gray-600 text-sm mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetLoading}
                />
              </div>

              {resetMessage && (
                <p className={`text-sm ${resetMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {resetMessage}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setResetMessage('');
                  }}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={resetLoading}
                >
                  <Mail size={16} />
                  {resetLoading ? 'Sending...' : 'Send Link'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}