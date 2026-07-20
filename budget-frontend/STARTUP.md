# 🚀 Getting Started - Budget App Frontend

## Prerequisites
- Node.js 18+ (download from nodejs.org)
- npm (comes with Node.js)
- Backend running on `http://localhost:5000`

## Quick Start (60 seconds)

### Step 1: Navigate to frontend
```bash
cd budget-frontend
```

### Step 2: Setup environment (optional)
```bash
cp .env.example .env.local
```

### Step 3: Install dependencies
```bash
npm install
```

### Step 4: Start dev server
```bash
npm run dev
```

### Step 5: Open in browser
```
http://localhost:5173
```

That's it! 🎉

---

## Running Backend (Optional - In Another Terminal)

```bash
cd backend
npm install
npm start
```

Backend will run on: `http://localhost:5000`

---

## 📱 UI Pages Overview

### 🔑 Authentication Pages
- **Login Page** (`/login`)
  - Email and password fields
  - Link to signup
  - Beautiful gradient background

- **Signup Page** (`/signup`)
  - Name, email, password fields
  - Password confirmation
  - Link to login

### 📊 Main Pages (After Login)

#### Dashboard (`/dashboard`)
- 4 summary cards: Income, Expenses, Remaining, Savings Rate
- Pie charts: Expense and Income breakdown by category
- Budget status table with progress bars
- Budget alerts (if any categories are over budget)

#### Transactions (`/transactions`)
- Add New Transaction button (dialog form)
- Advanced filters:
  - Search by note
  - Filter by type (Income/Expense)
  - Filter by category
  - Filter by date range
- Transaction table showing all records
- Delete button for each transaction

#### Budgets (`/budgets`)
- Add Budget button
- Month/Year selectors
- Budget cards showing:
  - Budget amount
  - Amount spent
  - Progress bar
  - Over-budget alert (if applicable)
- Delete button for each budget

#### Reports (`/reports`)
- Total Income & Expenses cards
- Pie chart: Expense distribution
- Bar chart: Expenses by category
- Pie chart: Income distribution
- Bar chart: Income by category
- Detailed tables with percentages

#### Settings (`/settings`)
- Display account info (name, email, role)
- Logout button

---

## 🎨 UI Features

### Navigation Bar
- Logo and app name
- Navigation links (Desktop: always visible, Mobile: hamburger menu)
- User menu with settings and logout

### Components
- Clean, professional cards
- Color-coded values (red/green/orange)
- Responsive tables
- Modal dialogs for forms
- Beautiful charts with tooltips
- Progress bars for budgets
- Loading states
- Error messages

### Responsive Design
- Works on all screen sizes
- Mobile menu collapses on small screens
- Charts resize automatically
- Tables scroll horizontally on mobile

---

## 🔐 Demo Credentials

Use any credentials to sign up. The backend will create the account:
```
Email: demo@example.com
Password: password123
Name: Demo User
```

---

## 📝 Typical Workflow

1. **Sign up** with your email
2. **Go to Dashboard** - see overview
3. **Add Transactions** - record income/expenses
4. **View Transactions** - see all records, filter if needed
5. **Create Budgets** - set monthly budgets by category
6. **Monitor Dashboard** - see progress and alerts
7. **Review Reports** - analyze spending patterns

---

## ⚡ Common Tasks

### Add a Transaction
1. Click "Add Transaction" button
2. Select type (Income/Expense)
3. Select category
4. Enter amount
5. Add optional note
6. Click "Add Transaction"

### Filter Transactions
1. Use search box for note search
2. Select type from dropdown
3. Select category from dropdown
4. Pick start and/or end date
5. Filters apply instantly
6. Click "Clear Filters" to reset

### Create a Budget
1. Go to Budgets page
2. Select month and year
3. Click "Add Budget"
4. Choose category
5. Enter budget amount
6. Click "Add Budget"
7. See progress in cards

### View Reports
1. Go to Reports page
2. See pie charts for breakdown
3. See bar charts for comparison
4. View detailed tables below charts

---

## 🛠️ Development Tips

### Hot Module Replacement
Changes auto-reload in browser (no page refresh needed)

### Console Errors
Open browser DevTools (F12) to see errors

### API Debugging
- Check Network tab in DevTools
- Verify backend is running
- Check .env.local VITE_API_URL

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📊 What's Built?

### Pages: 6
- Login, Signup, Dashboard, Transactions, Budgets, Reports, Settings

### Components: 10+
- Using shadcn/ui for consistency

### Features: 20+
- Authentication, filtering, search, charts, alerts, etc.

### Styles: Built with Tailwind CSS
- Responsive design
- 300+ utility classes used

### Charts: Recharts integration
- Pie charts, Bar charts, Tooltips

---

## 🎯 Test Scenarios

### Scenario 1: First Time User
1. Signup with new email
2. Add some income transactions
3. Add some expense transactions
4. Create budgets
5. View dashboard
6. Check reports

### Scenario 2: Power User
1. Login
2. Add many transactions
3. Filter by date range
4. Search specific notes
5. View over-budget categories
6. Analyze reports

### Scenario 3: Budget Tracking
1. Create monthly budgets
2. Add expense transactions
3. Watch progress bars
4. See alerts when over budget
5. Review monthly report

---

## 📞 Support

If something doesn't work:

1. **Port 5173 in use?**
   - Kill process or use different port

2. **Backend not responding?**
   - Check backend is running on port 5000
   - Check .env.local has correct API URL

3. **Login not working?**
   - Backend must be running
   - Check network tab in DevTools

4. **Charts not showing?**
   - Add some transactions first
   - Recharts needs data to display

5. **Styles look wrong?**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Or use Incognito/Private mode

---

## 🚀 Next Steps

1. ✅ Start dev server (`npm run dev`)
2. ✅ Open in browser (`http://localhost:5173`)
3. ✅ Sign up with test account
4. ✅ Explore the dashboard
5. ✅ Add some transactions
6. ✅ Create budgets
7. ✅ View reports

---

## 📚 File Descriptions

| File | Purpose |
|------|---------|
| `vite.config.js` | Build configuration |
| `postcss.config.js` | CSS processing |
| `jsconfig.json` | JavaScript paths |
| `.env.example` | Environment template |
| `package.json` | Dependencies |
| `QUICKSTART.md` | Detailed setup |
| `FEATURES.md` | Complete features list |
| `README.md` | Project overview |

---

## 🎉 You're All Set!

Run this command and start building:
```bash
npm run dev
```

**Enjoy your budget app! 💰📊**

---

*Last Updated: 2024*
*Built with React, Vite, Tailwind CSS & shadcn/ui*
