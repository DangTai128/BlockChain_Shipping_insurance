import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Blockchain API
export const blockchainAPI = {
  getInfo: async () => {
    const response = await api.get('/blockchain/info');
    return response.data;
  },

  createPolicy: async (data) => {
    const response = await api.post('/blockchain/create-policy', data);
    return response.data;
  },

  getPolicy: async (policyId) => {
    const response = await api.get(`/blockchain/policy/${policyId}`);
    return response.data;
  },

  getUserPolicies: async (userAddress) => {
    const response = await api.get(`/blockchain/user/${userAddress}/policies`);
    return response.data;
  },
};

// Policy API
export const policyAPI = {
  create: async (data) => {
    const response = await api.post('/policy', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/policy');
    return response.data;
  },

  getById: async (policyId) => {
    const response = await api.get(`/policy/${policyId}`);
    return response.data;
  },

  getByUser: async (userAddress) => {
    const response = await api.get(`/policy/user/${userAddress}`);
    return response.data;
  },

  update: async (policyId, data) => {
    const response = await api.put(`/policy/${policyId}`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/policy/stats/overview');
    return response.data;
  },
};

// User API
export const userAPI = {
  create: async (data) => {
    const response = await api.post('/user', data);
    return response.data;
  },

  getByAddress: async (walletAddress) => {
    const response = await api.get(`/user/${walletAddress}`);
    return response.data;
  },

  update: async (walletAddress, data) => {
    const response = await api.put(`/user/${walletAddress}`, data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  getStats: async (walletAddress) => {
    const response = await api.get(`/user/${walletAddress}/stats`);
    return response.data;
  },
};

// Oracle API
export const oracleAPI = {
  checkShipment: async (shipmentId) => {
    const response = await api.post('/oracle/check-shipment', { shipmentId });
    return response.data;
  },

  updateBlockchain: async (shipmentId, status) => {
    const response = await api.post('/oracle/update-blockchain', { shipmentId, status });
    return response.data;
  },

  getTrackingHistory: async (shipmentId) => {
    const response = await api.get(`/oracle/tracking/${shipmentId}`);
    return response.data;
  },

  autoCheck: async () => {
    const response = await api.post('/oracle/auto-check');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/oracle/stats');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
