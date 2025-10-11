import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário no localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Garantir que o header Authorization seja aplicado imediatamente ao carregar
      if (parsed?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
    setLoading(false);
  }, []);

  // Configurar o axios para incluir o token em todas as requisições
  useEffect(() => {
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // Função para login
  const login = async (email, password) => {
    try {
  const response = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/login`, {
        email,
        password
      });
      
      const userData = response.data;
      // Aplicar o token imediatamente para evitar corrida com useEffect
      if (userData?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  };

  // Função para registro
  const register = async (name, email, password) => {
    try {
  const response = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/register`, {
        name,
        email,
        password
      });
      
      const userData = response.data;
      // Aplicar o token imediatamente para evitar corrida com useEffect
      if (userData?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar'
      };
    }
  };

  // Login com Google: troca id_token por JWT próprio
  const loginWithGoogle = async (idToken) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/google`, {
        token: idToken
      });
      const userData = response.data;
      if (userData?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro na autenticação com Google'
      };
    }
  };

  // Função para logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};