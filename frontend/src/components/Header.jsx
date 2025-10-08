import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Tooltip from './Tooltip';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Util para obter iniciais do nome do usuário
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <Link to="/" className="text-2xl font-bold">Contador de Dias</Link>
        
        <nav className="flex items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-blue-700 mr-2">
                Dashboard
              </Link>
              <Link to="/resumo" className="px-3 py-2 rounded hover:bg-blue-700 mr-2">
                Resumo
              </Link>
              <Link to="/importar-exportar" className="px-3 py-2 rounded hover:bg-blue-700 mr-2">
                Importar/Exportar
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="px-3 py-2 rounded hover:bg-blue-700 mr-2">
                  Admin
                </Link>
              )}
              
              <div className="relative" ref={menuRef}>
                <button
                  className="px-3 py-2 rounded hover:bg-blue-700 flex items-center"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <Tooltip content={user.name}>
                    <span
                      className="mr-1 inline-flex items-center justify-center w-8 h-8 bg-white text-blue-600 font-semibold rounded-full"
                      aria-label={user.name}
                    >
                      {getInitials(user.name)}
                    </span>
                  </Tooltip>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ${menuOpen ? 'block' : 'hidden'}`}>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 rounded hover:bg-blue-700 mr-2">
                Entrar
              </Link>
              <Link to="/register" className="px-3 py-2 bg-white text-blue-600 rounded hover:bg-gray-100">
                Registrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;