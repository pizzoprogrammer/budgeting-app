import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// SUPPORTED CURRENCIES
// ============================================================================
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
];

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatTransactionsForExport = (transactions) => {
  return transactions.map(t => ({
    Date: new Date(t.date).toLocaleDateString(),
    Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
    Category: t.category.charAt(0).toUpperCase() + t.category.slice(1),
    Amount: formatCurrency(t.amount, t.currency || 'USD'),
    Note: t.note || '-'
  }));
};


// ============================================================================
// ANALYTICS & TRENDS
// ============================================================================

export const calculateSpendingTrends = (transactions) => {
  const monthlyData = {};

  transactions.forEach(t => {
    if (t.type === 'expense') {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += t.amount;
    }
  });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month: new Date(month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
      spending: parseFloat(total.toFixed(2))
    }));
};

export const calculateAverageSpending = (transactions, category) => {
  const categoryTransactions = transactions.filter(
    t => t.category === category && t.type === 'expense'
  );

  if (categoryTransactions.length === 0) return 0;

  const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  return parseFloat((total / categoryTransactions.length).toFixed(2));
};

export const getCategorySpendingStats = (transactions) => {
  const categories = {};

  transactions.forEach(t => {
    if (t.type === 'expense') {
      if (!categories[t.category]) {
        categories[t.category] = { total: 0, count: 0, avg: 0 };
      }
      categories[t.category].total += t.amount;
      categories[t.category].count += 1;
    }
  });

  return Object.entries(categories).map(([category, data]) => ({
    category,
    total: parseFloat(data.total.toFixed(2)),
    count: data.count,
    average: parseFloat((data.total / data.count).toFixed(2))
  }));
};

// ============================================================================
// INSIGHTS & ALERTS
// ============================================================================

export const getSpendingInsights = (transactions, budgets) => {
  const insights = [];

  budgets.forEach(budget => {
    const categoryTransactions = transactions.filter(
      t => t.category === budget.category && t.type === 'expense'
    );
    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percent = (spent / budget.amount) * 100;

    if (spent > budget.amount) {
      insights.push({
        type: 'error',
        priority: 1,
        message: `${budget.category} exceeded by $${(spent - budget.amount).toFixed(2)}`
      });
    } else if (percent > 85) {
      insights.push({
        type: 'warning',
        priority: 2,
        message: `${budget.category} is at ${percent.toFixed(0)}% of budget`
      });
    }
  });

  return insights.sort((a, b) => a.priority - b.priority);
};

export const compareMonths = (transactions, currentMonth, currentYear, previousMonth, previousYear) => {
  const getMonthSpending = (month, year) => {
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() + 1 === month &&
               date.getFullYear() === year &&
               t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const current = getMonthSpending(currentMonth, currentYear);
  const previous = getMonthSpending(previousMonth, previousYear);
  const difference = current - previous;
  const percentChange = previous > 0 ? ((difference / previous) * 100).toFixed(1) : 0;

  return {
    currentMonth: parseFloat(current.toFixed(2)),
    previousMonth: parseFloat(previous.toFixed(2)),
    difference: parseFloat(difference.toFixed(2)),
    percentChange: parseFloat(percentChange),
    trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same'
  };
};

// ============================================================================
// CURRENCY UTILITIES
// ============================================================================

export const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch (e) {
    // fallback simple formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// ============================================================================
// SAVINGS GOALS
// ============================================================================

export const calculateSavingsProgress = (income, expense, goal) => {
  const savings = income - expense;
  const progress = goal > 0 ? (savings / goal) * 100 : 0;
  const remaining = Math.max(0, goal - savings);

  return {
    current: parseFloat(savings.toFixed(2)),
    goal: parseFloat(goal.toFixed(2)),
    progress: parseFloat(progress.toFixed(1)),
    remaining: parseFloat(remaining.toFixed(2)),
    achieved: savings >= goal
  };
};

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export const getSpendingRecommendations = (stats, income) => {
  const recommendations = [];
  const targetAllocation = income * 0.3; // 30% on essential categories

  stats.forEach(stat => {
    const essentialCategories = ['rent', 'utilities', 'food', 'transport'];

    if (essentialCategories.includes(stat.category) && stat.total > targetAllocation) {
      recommendations.push({
        type: 'info',
        message: `${stat.category} spending is high. Consider ways to reduce.`
      });
    }

    if (stat.average > 100 && stat.count > 5) {
      recommendations.push({
        type: 'info',
        message: `Your average ${stat.category} transaction is $${stat.average}. Look for patterns.`
      });
    }
  });

  return recommendations;
};

