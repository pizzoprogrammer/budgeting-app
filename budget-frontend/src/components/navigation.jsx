import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { BarChart3, Wallet, TrendingUp, BarChart2, Settings, LogOut, Menu, Moon, Sun, Target, Clock, DollarSign } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transactions', label: 'Transactions', icon: Wallet },
    { path: '/budgets', label: 'Budgets', icon: TrendingUp },
    { path: '/bills', label: 'Bills', icon: Clock },
    { path: '/forecast', label: 'Forecast', icon: DollarSign },
    { path: '/reports', label: 'Reports', icon: BarChart2 },
    { path: '/savings-goals', label: 'Savings Goals', icon: Target },
  ];

  const NavLink = ({ path, label, icon: Icon }) => (
    <Link
      to={path}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        location.pathname === path
          ? 'bg-indigo-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <BarChart3 className="text-indigo-600" size={28} />
            <span className="text-xl font-bold text-gray-900 dark:text-white">BudgetApp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 px-2.5 h-8 rounded-lg border border-border bg-background hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-sm dark:text-gray-300">{user?.name || 'User'}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                <DropdownMenuItem disabled className="dark:text-gray-500">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/settings" className="dark:text-gray-300 flex items-center">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="dark:text-gray-300">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
