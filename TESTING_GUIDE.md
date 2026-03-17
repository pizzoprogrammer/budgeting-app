# 🧪 Complete Testing Guide - Budget App

## 📋 Pre-Testing Setup

### 1. Ensure Backend is Running
```bash
# Terminal 1: Backend
cd backend
npm start
```
Expected output:
```
Server running on port 5000
Connected to MongoDB
```

### 2. Ensure Frontend is Running
```bash
# Terminal 2: Frontend
cd budget-frontend
npm run dev
```
Expected output:
```
VITE ready in XX ms
Local: http://localhost:5173/
```

### 3. Open Browser
Open **http://localhost:5173** in your browser

---

## 🔐 STEP 1: Authentication Testing

### Test 1.1: Sign Up ✅
1. You should see **Login page**
2. Click **"Sign up"** link
3. Fill in:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "test123456"
   - Confirm: "test123456"
4. Click **"Sign Up"**
5. ✅ **Expected**: Redirected to Dashboard
6. ✅ **Check**: User menu shows "Test User"

**Test Variations:**
- Try signing up with same email (should fail)
- Try password mismatch (should show error)
- Try short password (should show error)

---

### Test 1.2: Logout & Login ✅
1. Click **user avatar** (top right)
2. Click **"Logout"**
3. ✅ **Expected**: Redirected to Login page
4. Enter credentials:
   - Email: "testuser@example.com"
   - Password: "test123456"
5. Click **"Login"**
6. ✅ **Expected**: Redirected to Dashboard, logged in

**Test Variations:**
- Try wrong password (should fail)
- Try wrong email (should fail)
- Try leaving fields empty (should show validation)

---

### Test 1.3: Protected Routes ✅
1. Login successfully
2. Copy dashboard URL
3. Logout
4. Go back to dashboard URL
5. ✅ **Expected**: Redirected to Login page

---

## 📊 STEP 2: Dashboard Testing

### Test 2.1: Dashboard Loads ✅
1. You should see:
   - ✅ 4 summary cards (Income, Expenses, Remaining, Savings %)
   - ✅ "Last Updated" blue card
   - ✅ Auto-refresh checkbox
   - ✅ Refresh button
   - ✅ Pie charts (if you have transactions)
   - ✅ Budget status table

### Test 2.2: Summary Cards Display ✅
1. Check **Total Income**: Should show $0.00 (no transactions yet)
2. Check **Total Expenses**: Should show $0.00
3. Check **Remaining**: Should show $0.00
4. Check **Savings Rate**: Should show 0%
5. ✅ **Expected**: All cards visible with gradient backgrounds

### Test 2.3: Auto-Refresh Toggle ✅
1. Look at **"Last Updated"** timestamp
2. Check the **"Auto-refresh (60s)"** checkbox
3. Wait for status to say "Just now"
4. Click **"Refresh"** button
5. ✅ **Expected**: Timestamp updates to "Just now"
6. Uncheck auto-refresh
7. ✅ **Expected**: Auto-refresh stops

### Test 2.4: Budget Status Table ✅
1. Initially should be **empty**
2. After you create budgets, should show:
   - ✅ Category names
   - ✅ Budget amounts
   - ✅ Spent amounts
   - ✅ Progress bars
   - ✅ Percentage used

---

## 💰 STEP 3: Transaction Testing

### Test 3.1: Add Income Transaction ✅
1. Click **"Transactions"** in navbar
2. Click **"+ Add Transaction"** button
3. Fill in:
   - Type: **Income** ✓
   - Category: **Salary** ✓
   - Amount: **5000**
   - Note: "Monthly salary"
4. Click **"Add Transaction"**
5. ✅ **Expected**:
   - Green success message appears
   - Transaction appears in table
   - Dashboard updates (Income now shows $5000)
   - Auto-refresh triggers

### Test 3.2: Add Expense Transaction ✅
1. Click **"+ Add Transaction"**
2. Fill in:
   - Type: **Expense** ✓
   - Category: **Food** ✓
   - Amount: **50**
   - Note: "Lunch"
3. Click **"Add Transaction"**
4. ✅ **Expected**:
   - Green success message
   - Transaction appears (red badge)
   - Dashboard updates (Expenses now shows $50)

### Test 3.3: Transaction List ✅
1. You should see **2 transactions**:
   - One income (green, +$5000)
   - One expense (red, -$50)
2. Each row shows:
   - ✅ Date
   - ✅ Category
   - ✅ Type (Income/Expense badge)
   - ✅ Amount (color-coded)
   - ✅ Note
   - ✅ Delete button

### Test 3.4: Auto-Refresh Transactions ✅
1. Check the **auto-refresh checkbox**
2. Add another transaction in another tab/window
3. ✅ **Expected**: Table auto-updates in 30 seconds
4. Watch **"Last Updated"** change to "Just now"

### Test 3.5: Filter Transactions ✅

**Filter by Type:**
1. Click **"Type"** dropdown
2. Select **"Income"**
3. ✅ **Expected**: Only income transactions shown
4. Select **"Expense"**
5. ✅ **Expected**: Only expenses shown
6. Select **"All Types"**
7. ✅ **Expected**: All shown again

**Filter by Category:**
1. Click **"Category"** dropdown
2. Select **"Food"**
3. ✅ **Expected**: Only Food transactions shown
4. Select **"All Categories"**
5. ✅ **Expected**: All shown again

**Search by Note:**
1. Type **"salary"** in search box
2. ✅ **Expected**: Only "Monthly salary" transaction shown
3. Clear search
4. ✅ **Expected**: All transactions shown again

**Filter by Date Range:**
1. Click **"From"** date field
2. Select **today's date**
3. ✅ **Expected**: Only today's transactions shown
4. Click **"Clear Filters"**
5. ✅ **Expected**: All filters reset

### Test 3.6: Delete Transaction ✅
1. Find a transaction (e.g., the $50 expense)
2. Click **delete button** (trash icon)
3. ✅ **Expected**:
   - Green success message
   - Transaction removed from table
   - Dashboard updates (Expenses back to $0)
4. Check **transaction count** decreased

### Test 3.7: Validation ✅
1. Try to add transaction with:
   - Empty amount (should not allow)
   - No category selected (should not allow)
   - No type selected (should not allow)

---

## 📋 STEP 4: Budget Testing

### Test 4.1: Add Budget ✅
1. Click **"Budgets"** in navbar
2. Verify **Month/Year selectors** at top
3. Click **"+ Add Budget"** button
4. Fill in:
   - Category: **Food** ✓
   - Budget Amount: **500**
5. Click **"Add Budget"**
6. ✅ **Expected**:
   - Budget card appears
   - Shows $500 budget
   - Shows $0 spent (no expenses yet)
   - 0% progress bar

### Test 4.2: Budget Progress Tracking ✅
1. Stay on **Budgets** page
2. Add another transaction: **Expense → Food → $100**
3. ✅ **Expected**: Budget card updates:
   - Shows "Spent: $100"
   - Progress bar shows 20%
4. Add another Food expense: **$150**
5. ✅ **Expected**:
   - Shows "Spent: $250"
   - Progress bar shows 50%

### Test 4.3: Over-Budget Alert ✅
1. Add another Food expense: **$300**
2. ✅ **Expected**:
   - Budget card shows "Overspent"
   - Shows red warning
   - Shows amount over: "+$50 overspent"
3. Check **Dashboard**:
   - ✅ Budget alert appears
   - ✅ Shows "Food exceeded by $50"

### Test 4.4: Create Multiple Budgets ✅
1. Add budget for **Rent: $1200**
2. Add budget for **Utilities: $150**
3. Add budget for **Entertainment: $200**
4. ✅ **Expected**: All 4 budgets showing on page

### Test 4.5: Month/Year Selection ✅
1. Click **"Month"** dropdown
2. Change to **February**
3. ✅ **Expected**: Budgets list clears (no budgets for Feb)
4. Change back to **January** (current month)
5. ✅ **Expected**: Your budgets reappear

### Test 4.6: Delete Budget ✅
1. Delete the **Entertainment** budget
2. ✅ **Expected**:
   - Card disappears
   - Only 3 budgets remain
   - No confirmation needed (or minimal)

---

## 📊 STEP 5: Reports Testing

### Test 5.1: Reports Page Loads ✅
1. Click **"Reports"** in navbar
2. You should see:
   - ✅ Total Income card
   - ✅ Total Expenses card
   - ✅ Expense Distribution pie chart
   - ✅ Expenses by Category bar chart
   - ✅ Income Distribution pie chart
   - ✅ Income by Category bar chart
   - ✅ Detailed tables

### Test 5.2: Charts Display ✅
1. **Expense Pie Chart** should show:
   - ✅ Food slice (largest)
   - ✅ Other slices if applicable
   - ✅ Percentages labeled
2. **Bar Chart** should show:
   - ✅ Categories on X-axis
   - ✅ Amounts on Y-axis
   - ✅ Red bars for expenses
   - ✅ Green bars for income

### Test 5.3: Detail Tables ✅
1. Scroll to **"Expense Details"** table
2. Should show:
   - ✅ Food: $250 (50% of total)
   - ✅ Rent: --(no transaction yet)
   - ✅ Transaction count
3. Check **"Income Details"**
   - ✅ Salary: $5000 (100% of income)
   - ✅ Transaction count

---

## 🧭 STEP 6: Navigation Testing

### Test 6.1: Navbar Navigation ✅
1. Click **"Dashboard"** → loads dashboard ✅
2. Click **"Transactions"** → loads transactions ✅
3. Click **"Budgets"** → loads budgets ✅
4. Click **"Reports"** → loads reports ✅
5. Click **logo/app name** → goes to dashboard ✅

### Test 6.2: User Menu ✅
1. Click **user avatar** (top right)
2. Menu shows:
   - ✅ Email address
   - ✅ "Settings" option
   - ✅ "Logout" option
3. Click **"Settings"**:
   - ✅ Shows account info
   - ✅ Name, email, role displayed
   - ✅ Logout button present

### Test 6.3: Active Link Highlighting ✅
1. Go to **Dashboard** → link highlighted in blue ✅
2. Go to **Transactions** → link highlighted ✅
3. Go to **Budgets** → link highlighted ✅

---

## 📱 STEP 7: Responsive Design Testing

### Test 7.1: Desktop (1024px+) ✅
1. Open at full width
2. Verify:
   - ✅ 4 cards in a row
   - ✅ 2 pie charts side-by-side
   - ✅ Full table visible
   - ✅ Navigation bar title visible

### Test 7.2: Tablet (768px) ✅
1. Resize browser to **768px width**
2. Verify:
   - ✅ 2 cards per row
   - ✅ Charts stack vertically
   - ✅ Table still usable
   - ✅ Navigation still accessible

### Test 7.3: Mobile (375px) ✅
1. Resize browser to **375px width** (iPhone)
2. Verify:
   - ✅ 1 card per row
   - ✅ Hamburger menu appears
   - ✅ Cards still readable
   - ✅ Table scrolls horizontally
   - ✅ Touch-friendly buttons

### Test 7.4: Mobile Menu ✅
1. On mobile, click **hamburger menu** (☰)
2. ✅ **Expected**: Menu opens with all nav links
3. Click **Dashboard** link
4. ✅ **Expected**: Menu closes, loads page
5. Click menu again
6. ✅ **Expected**: Shows all links again

---

## ⚡ STEP 8: Auto-Refresh Testing

### Test 8.1: Dashboard Auto-Refresh ✅
1. Go to **Dashboard**
2. Note the **"Last Updated"** time
3. Wait **60 seconds**
4. ✅ **Expected**: Page auto-refreshes silently
5. **"Last Updated"** should change

### Test 8.2: Transactions Auto-Refresh ✅
1. Go to **Transactions** page
2. Check **"Auto-refresh (30s)"** checkbox
3. Note timestamp
4. Wait **30 seconds**
5. ✅ **Expected**: Data refreshes
6. Add transaction from **different tab**
7. ✅ **Expected**: Appears in this tab within 30 seconds

### Test 8.3: Manual Refresh ✅
1. Click **"Refresh"** button (with spinner icon)
2. ✅ **Expected**:
   - Spinner animates
   - Data reloads
   - "Last Updated" changes to "Just now"

---

## ❌ STEP 9: Error Handling Testing

### Test 9.1: Network Error ✅
1. Disconnect internet (or stop backend)
2. Try to add transaction
3. ✅ **Expected**: Error message appears
4. Reconnect/restart backend
5. Try again
6. ✅ **Expected**: Works again

### Test 9.2: Form Validation ✅
1. Try to add transaction without:
   - Amount (should show error) ✅
   - Category (should show error) ✅
   - Type (should show error) ✅

### Test 9.3: Success Messages ✅
1. Add transaction
2. ✅ **Expected**: Green success message appears
3. Does message auto-dismiss after 3 seconds? ✅
4. Delete transaction
5. ✅ **Expected**: Another green success message

---

## 📊 STEP 10: Data Accuracy Testing

### Test 10.1: Dashboard Math ✅
1. Add:
   - Income: $1000 (salary)
   - Income: $500 (freelance) = **$1500 total**
   - Expense: $300 (food)
   - Expense: $200 (utilities) = **$500 total**
2. Check Dashboard:
   - ✅ Total Income: $1500
   - ✅ Total Expenses: $500
   - ✅ Remaining: $1000
   - ✅ Savings %: 66.7%

### Test 10.2: Budget Math ✅
1. Create budget: Food $400
2. Add expenses:
   - Food: $100
   - Food: $150
   - Food: $100
3. Budget should show:
   - ✅ Spent: $350
   - ✅ Progress: 87.5%
   - ✅ Remaining: $50

### Test 10.3: Category Breakdown ✅
1. Add expenses:
   - Food: $200
   - Utilities: $100
   - Food: $100
2. Go to **Reports**
3. Verify **Expense Pie Chart**:
   - ✅ Food: ~67%
   - ✅ Utilities: ~33%

---

## ✅ Final Verification Checklist

- [ ] Can sign up and login
- [ ] Can add income transactions
- [ ] Can add expense transactions
- [ ] Can delete transactions
- [ ] Can search/filter transactions
- [ ] Dashboard shows correct totals
- [ ] Charts display correctly
- [ ] Can create budgets
- [ ] Budget alerts work
- [ ] Reports display analytics
- [ ] Navigation works smoothly
- [ ] Mobile responsive
- [ ] Auto-refresh works
- [ ] Success messages appear
- [ ] Error messages appear
- [ ] Can logout

---

## 🎯 Quick 5-Minute Test

If you want a quick test:

1. **Sign up** → Creates account ✅
2. **Add Income** ($2000) → Dashboard updates ✅
3. **Add Expense** ($500) → Dashboard updates ✅
4. **Create Budget** (Food $300) → Appears on Budgets ✅
5. **Add Food Expense** ($350) → Alert appears (overspent) ✅
6. **View Reports** → Charts show data ✅
7. **Logout** → Redirects to login ✅

If all 7 work → **Everything is working!** ✅

---

## 🚨 Troubleshooting

### If something fails:
1. Check backend is running: `http://localhost:5000`
2. Check frontend is running: `http://localhost:5173`
3. Check browser console (F12) for errors
4. Check network tab for failed requests
5. Refresh page (hard refresh: Ctrl+Shift+R)
6. Restart both servers

---

## 📸 What Success Looks Like

✅ **Data flows perfectly** from frontend → backend → frontend
✅ **All CRUD** operations work (Create, Read, Update, Delete)
✅ **Charts update** when you add data
✅ **Budgets calculate** correctly
✅ **Responsive on all devices**
✅ **Auto-refresh works silently**
✅ **No console errors**

---

**All tests passing = Production Ready! 🎉**
