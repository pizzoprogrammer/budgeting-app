# Budget Frontend

A modern, responsive budgeting application built with React, Vite, Tailwind CSS, and shadcn/ui components.

## Features

- 🔐 **Authentication** - Secure login and signup with JWT tokens
- 📊 **Dashboard** - Overview of income, expenses, savings, and budget status
- 💰 **Transaction Management** - Add, view, and delete transactions (income/expense)
- 📈 **Budget Planning** - Create and track budgets by category
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Copy the environment variables:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your backend API URL (if different from default):
```env
VITE_API_URL=http://localhost:5000/api
```

3. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   └── navigation.jsx # Main navigation bar
├── pages/           # Page components
│   ├── login.jsx
│   ├── signup.jsx
│   ├── dashboard.jsx
│   ├── transactions.jsx
│   ├── budgets.jsx
│   └── settings.jsx
├── lib/             # Utilities and hooks
│   ├── api.js       # API client
│   ├── auth-context.jsx # Authentication context
│   └── utils.js     # Utility functions
├── App.jsx          # Main app with routing
├── index.css        # Global styles
└── main.jsx         # Entry point
```

## Usage

### Authentication Flow

1. **Sign Up** - Create a new account with name, email, and password
2. **Login** - Use credentials to login and receive JWT token
3. **Token Storage** - Token is automatically saved to localStorage

### Dashboard

- View monthly income, expenses, and savings
- See budget status and spending progress
- View overall savings rate
- Track budget vs. actual spending for each category

### Transactions

- Add new income or expense transactions
- Select category and transaction type
- Add optional notes
- View all transactions sorted by date
- Delete transactions

### Budgets

- Set monthly budgets for expense categories
- View budget allocation and spending progress
- See which categories are over budget
- Filter budgets by month and year
- Delete budgets

### Settings

- View account information
- Logout from the application

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`. Key endpoints:

- **Auth**: `/auth/register`, `/auth/login`
- **Transactions**: `/transactions` (GET, POST, DELETE), `/transactions/summary/*`
- **Budget**: `/budget` (GET, POST, DELETE), `/budget/status`
- **Admin**: `/admin/users`, `/admin/transactions`

All authenticated requests include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Responsive Design

The application is fully responsive with:

- Mobile-first design approach
- Tailwind CSS responsive utilities (sm, md, lg breakpoints)
- Responsive navigation with mobile menu
- Adaptive grid layouts
- Touch-friendly interface

## Components Used

Key shadcn/ui components:
- Button - For action triggers
- Card - For content containers
- Input - For text input
- Select - For dropdown selection
- Dialog - For modals
- Label - For form labels
- Badge - For status indicators
- DropdownMenu - For user menu

## Environment Variables

Create a `.env.local` file with:

```
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### API Connection Issues

If you get CORS errors or cannot connect to the API:
1. Ensure backend is running on `http://localhost:5000`
2. Check `VITE_API_URL` in `.env.local`
3. Verify backend has CORS enabled

### Login Issues

- Check that credentials are correct
- Ensure backend is running
- Clear browser localStorage if tokens become stale

### Build Issues

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Ensure Node.js version is 18+

## Contributing

Feel free to submit issues and enhancements!

## License

This project is part of the budgeting application suite.
