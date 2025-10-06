import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';

// Configuração global do axios: baseURL e inclusão automática do token
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const token = JSON.parse(stored)?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (_) {
    // Ignorar erros de parsing do localStorage
  }
  return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);