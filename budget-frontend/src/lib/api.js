const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// To be set by auth context to handle token expiration
let logoutCallback = null;

export const setApiLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Wrapper to handle 401 responses
const handleResponse = async (res) => {
  if (res.status === 401 && logoutCallback) {
    // Token expired or invalid
    logoutCallback();
    window.location.href = '/login';
    return { error: 'Session expired. Please login again.' };
  }
  return res.json();
};

export const api = {
  auth: {
    register: (name, email, password, currency = 'USD') =>
      fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, currency }),
      }).then(res => res.json()),

    login: (email, password) =>
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(res => res.json()),
  },

  // user profile / settings
  profile: {
    get: (token) =>
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    update: (token, updates) =>
      fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }).then(res => handleResponse(res)),
  },

  transactions: {
    getAll: (token) =>
      fetch(`${API_BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    create: (token, data) =>
      fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(res => handleResponse(res)),

    delete: (token, id) =>
      fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    getMonthlySummary: (token) => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      return fetch(`${API_BASE_URL}/transactions/summary/monthly?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res));
    },

    getCategoryExpenseSummary: (token) => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      return fetch(`${API_BASE_URL}/transactions/summary/category/expense?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res));
    },

    getCategoryIncomeSummary: (token) => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      return fetch(`${API_BASE_URL}/transactions/summary/category/income?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res));
    },
  },

  budget: {
    getAll: (token, month, year) =>
      fetch(`${API_BASE_URL}/budget?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    create: (token, data) =>
      fetch(`${API_BASE_URL}/budget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(res => handleResponse(res)),

    getStatus: (token) => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      return fetch(`${API_BASE_URL}/budget/status?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res));
    },

    delete: (token, id) =>
      fetch(`${API_BASE_URL}/budget/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),
  },

  admin: {
    getUsers: (token) =>
      fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    getTransactions: (token) =>
      fetch(`${API_BASE_URL}/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    deleteUser: (token, userId) =>
      fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),
  },

  savingsGoals: {
    getAll: (token) =>
      fetch(`${API_BASE_URL}/savingsgoals`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    create: (token, data) =>
      fetch(`${API_BASE_URL}/savingsgoals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(res => handleResponse(res)),

    update: (token, id, data) =>
      fetch(`${API_BASE_URL}/savingsgoals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(res => handleResponse(res)),

    delete: (token, id) =>
      fetch(`${API_BASE_URL}/savingsgoals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),
  },

  bills: {
    getAll: (token) =>
      fetch(`${API_BASE_URL}/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    create: (token, data) =>
      fetch(`${API_BASE_URL}/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(res => handleResponse(res)),

    update: (token, id, data) =>
      fetch(`${API_BASE_URL}/bills/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(res => handleResponse(res)),

    markPaid: (token, id) =>
      fetch(`${API_BASE_URL}/bills/${id}/mark-paid`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    delete: (token, id) =>
      fetch(`${API_BASE_URL}/bills/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),
  },

  forecast: {
    getAll: (token) =>
      fetch(`${API_BASE_URL}/forecast`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    generate: (token, months = 6) =>
      fetch(`${API_BASE_URL}/forecast/generate?months=${months}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    getMonthForecast: (token, month, year) =>
      fetch(`${API_BASE_URL}/forecast/${month}/${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),
  },

  categorization: {
    autoCategorize: (token, description, type = 'expense') =>
      fetch(`${API_BASE_URL}/categorization/auto-categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, type }),
      }).then(res => handleResponse(res)),

    learn: (token, description, category, type) =>
      fetch(`${API_BASE_URL}/categorization/learn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, category, type }),
      }).then(res => handleResponse(res)),

    getMappings: (token) =>
      fetch(`${API_BASE_URL}/categorization/mappings`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    deleteMapping: (token, id) =>
      fetch(`${API_BASE_URL}/categorization/mappings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),
  },

  bank: {
    initConnection: (token) =>
      fetch(`${API_BASE_URL}/bank/init-connection`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    connect: (token, publicToken, accountType, accountName) =>
      fetch(`${API_BASE_URL}/bank/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicToken, accountType, accountName }),
      }).then(res => handleResponse(res)),

    getAccounts: (token) =>
      fetch(`${API_BASE_URL}/bank`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    sync: (token, accountId) =>
      fetch(`${API_BASE_URL}/bank/${accountId}/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    disconnect: (token, accountId) =>
      fetch(`${API_BASE_URL}/bank/${accountId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),
  },

  settings: {
    get: (token) =>
      fetch(`${API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => handleResponse(res)),

    updateBudgetingMethodology: (token, methodology) =>
      fetch(`${API_BASE_URL}/settings/budgeting-methodology`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ methodology }),
      }).then(res => handleResponse(res)),

    updateMFA: (token, mfaEnabled, mfaMethod) =>
      fetch(`${API_BASE_URL}/settings/mfa`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mfaEnabled, mfaMethod }),
      }).then(res => handleResponse(res)),

    updateNotifications: (token, notifications) =>
      fetch(`${API_BASE_URL}/settings/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notifications),
      }).then(res => handleResponse(res)),
  },
};
