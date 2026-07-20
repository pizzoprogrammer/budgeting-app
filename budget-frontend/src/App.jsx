import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Navigation } from '@/components/navigation';
import { LoginPage } from '@/pages/login';
import { SignupPage } from '@/pages/signup';
import { Dashboard } from '@/pages/dashboard-auto-refresh';
import { Transactions } from '@/pages/transactions-auto-refresh';
import { Budgets } from '@/pages/budgets';
import { Reports } from '@/pages/reports';
import { Settings } from '@/pages/settings';
import { SavingsGoals } from '@/pages/savings-goals';
import { Bills } from '@/pages/bills';
import { CashFlowForecast } from '@/pages/forecast';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const { token } = useAuth();

  return (
    <Router>
      {token && <Navigation />}
      <div className={token ? 'min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors' : ''}>
        <div className={token ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProtectedRoute>
                  <Budgets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/savings-goals"
              element={
                <ProtectedRoute>
                  <SavingsGoals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bills"
              element={
                <ProtectedRoute>
                  <Bills />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast"
              element={
                <ProtectedRoute>
                  <CashFlowForecast />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

