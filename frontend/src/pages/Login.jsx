import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const googleBtnRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login(email, password);
      
      if (result.success) {
        showToast('Login realizado com sucesso');
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Falha ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Inicializar Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return; // sem client id, não renderiza botão
    }
    if (window.google && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const idToken = response.credential;
              const result = await loginWithGoogle(idToken);
              if (result.success) {
                showToast('Login com Google realizado com sucesso');
                navigate('/dashboard');
              } else {
                setError(result.message || 'Falha no login com Google');
              }
            } catch (err) {
              console.error('Erro no callback do Google:', err);
              setError('Falha no login com Google');
            }
          }
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with'
        });
        // opcional: one-tap
        // window.google.accounts.id.prompt();
      } catch (err) {
        console.error('Erro ao inicializar Google Identity Services:', err);
      }
    }
  }, [loginWithGoogle, navigate, showToast]);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Entrar</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="form-label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              'Entrando...'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h9.19l-3.22-3.22a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
                Entrar
              </>
            )}
          </button>
        </div>
      </form>

      {/* Login com Google */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4 text-center">
          <p className="text-gray-600 mb-2">Ou continue com</p>
          <div ref={googleBtnRef} className="flex justify-center"></div>
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <p className="text-red-600 text-sm mt-2">VITE_GOOGLE_CLIENT_ID não configurado</p>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <p>
          Não tem uma conta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;