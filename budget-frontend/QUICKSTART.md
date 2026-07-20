# Budget App - Quick Start Guide

## Project Setup

### 1. Environment Variables

Create a `.env.local` file in the `budget-frontend` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
cd budget-frontend
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

### 4. Start the Backend

In another terminal:
```bash
cd backend
npm install
npm start
```

The API will be available at **http://localhost:5000**

---

## Application Features

### 📊 Dashboard
- **Real-time Overview**: View total income, expenses, remaining balance, and savings rate
- **Budget Status**: See all budget allocations with spending progress bars
- **Visual Analytics**:
  - Expense pie chart showing distribution by category
  - Income pie chart showing distribution by source
  - Budget alerts for over-budget categories
- **Quick Insights**: Identifies which expense categories are over budget

### 💰 Transactions
- **Add Transactions**: Create income or expense records with:
  - Type (Income/Expense)
  - Category selection
  - Amount
  - Optional note
- **Advanced Filtering**:
  - Search by note/description
  - Filter by transaction type
  - Filter by category
  - Filter by date range
  - Multiple filters work together
- **Transaction List**:
  - Sortable table with all transaction details
  - Color-coded by type (green for income, red for expenses)
  - Delete capability
  - Shows matching count for current filters

### 📈 Reports
- **Comprehensive Analytics**:
  - Total income and expense summaries
  - Expense distribution pie chart
  - Income distribution pie chart
  - Category-wise bar charts
- **Detailed Breakdowns**:
  - Transaction count per category
  - Percentage of total per category
  - Sortable tables with all metrics
- **Visual Comparisons**: Multiple chart formats for better insights

### 📋 Budgets
- **Monthly Budget Planning**:
  - Set budgets by category for any month/year
  - View progress with visual indicators
  - See spending vs budget allocation
- **Over-Budget Alerts**:
  - Visual warnings when categories exceed budget
  - Shows overspent amount
  - Month/year filtering
- **Budget Management**:
  - Create new budgets
  - Delete existing budgets
  - Easy progress tracking

### ⚙️ Settings
- **Account Management**:
  - View account information
  - See assigned role
  - Logout option

---

## User Interface Features

### Responsive Design
- ✅ Fully responsive on mobile, tablet, and desktop
- ✅ Mobile navigation with hamburger menu
- ✅ Adaptive layouts for all screen sizes
- ✅ Touch-friendly buttons and inputs

### Components
Built with **shadcn/ui** for consistency:
- Clean, professional design
- Accessible forms
- Reusable UI components
- Consistent styling with Tailwind CSS

### Visual Indicators
- 🔴 Red for expenses/negative values
- 🟢 Green for income/positive values
- 🟡 Yellow/orange for alerts
- Progress bars for budget tracking

---

## Authentication Flow

1. **Sign Up**: Create account with name, email, password
2. **Login**: Use credentials to access the app
3. **Session Management**: Token stored in localStorage
4. **Auto-Logout**: Clear token manually in Settings
5. **Protected Routes**: All pages except login/signup require authentication

---

## API Integration

### Base URL
```
http://localhost:5000/api
```

### Main Endpoints Used
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET/POST/DELETE /transactions` - Transaction management
- `GET /transactions/summary/*` - Financial summaries
- `GET/POST/DELETE /budget` - Budget management
- `GET /budget/status` - Budget tracking data

### Authentication
All protected requests include:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Keyboard Shortcuts

| Keyboard | Action |
|----------|--------|
| `Click Date` | Open date picker |
| `Enter in Form` | Submit form |
| `Tab` | Navigate form fields |

---

## Troubleshooting

### Port Already in Use
```bash
# Change dev port (update vite.config.js)
# Or kill existing process on port 5173
```

### API Connection Errors
```bash
# Verify backend is running on port 5000
# Update VITE_API_URL in .env.local
# Check CORS settings in backend
```

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
npm install
npm run build
```

### Login Issues
- Clear browser localStorage: `localStorage.clear()`
- Check backend is running
- Verify credentials

---

## Performance Optimization Tips

1. **Lazy Load Routes**: Consider code-splitting for Reports page
2. **Memoize Components**: Use React.memo for large lists
3. **Optimize Charts**: Recharts re-renders are efficient
4. **Filter Optimization**: Filtering done client-side (memoized)

---

## File Structure Summary

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── navigation.jsx   # Main navigation
├── pages/
│   ├── login.jsx                 # Login page
│   ├── signup.jsx                # Registration
│   ├── dashboard-enhanced.jsx    # Dashboard with charts
│   ├── transactions-enhanced.jsx # Transactions with filters
│   ├── budgets.jsx               # Budget management
│   ├── reports.jsx               # Financial reports
│   └── settings.jsx              # User settings
├── lib/
│   ├── api.js                    # API client
│   ├── auth-context.jsx          # Auth state management
│   └── utils.js                  # Utility functions
└── App.jsx                       # Main app with routing
```

---

## Next Steps

Potential future enhancements:
- Recurring transactions support
- Multi-currency support
- Export to CSV/PDF
- Dark mode toggle
- Bill reminders
- Admin dashboard
- Year-over-year comparisons
- Budget goal tracking
- Email notifications

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review application error messages
3. Check browser console (F12) for errors
4. Verify backend is running and accessible

---

**Happy budgeting! 💰📊**
