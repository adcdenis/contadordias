import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configurar axios com token de autenticação
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// API de autenticação
export const authAPI = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/auth/profile`);
    return response.data;
  }
};

// API de contadores
export const counterAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/counters`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/counters/${id}`);
    return response.data;
  },
  
  create: async (counterData) => {
    const response = await axios.post(`${API_URL}/counters`, counterData);
    return response.data;
  },
  
  update: async (id, counterData) => {
    const response = await axios.put(`${API_URL}/counters/${id}`, counterData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/counters/${id}`);
    return response.data;
  }
};

// API de administração
export const adminAPI = {
  getAllUsers: async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  }
};

export { setAuthToken };
export default { authAPI, counterAPI, adminAPI, setAuthToken };