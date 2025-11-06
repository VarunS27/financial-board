import api from './api';

// Auth Services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },
};

// Transaction Services
export const transactionService = {
  getAll: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  getStats: async (months = 6) => {
    const response = await api.get('/transactions/stats/summary', {
      params: { months },
    });
    return response.data;
  },
};

// Portfolio Services
export const portfolioService = {
  getAll: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/portfolio/${id}`);
    return response.data;
  },

  create: async (portfolioData) => {
    const response = await api.post('/portfolio', portfolioData);
    return response.data;
  },

  update: async (id, portfolioData) => {
    const response = await api.put(`/portfolio/${id}`, portfolioData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/portfolio/${id}`);
    return response.data;
  },
};

// Stock Services
export const stockService = {
  getQuote: async (symbol) => {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  },

  getHistory: async (symbol, interval = 'daily') => {
    const response = await api.get(`/stocks/${symbol}/history`, {
      params: { interval },
    });
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/stocks/search/${query}`);
    return response.data;
  },
};
