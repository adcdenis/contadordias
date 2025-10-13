import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Tooltip from './Tooltip';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef(null);

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
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2">
        <Link to="/" className="text-2xl font-bold flex-shrink-0">Lembre+</Link>
        
        <nav className="flex flex-wrap items-center gap-2 ml-auto min-w-0">
          {user ? (
            <>
              <Link to="/dashboard" className="px-2 py-1 sm:px-3 sm:py-2 rounded hover:bg-blue-700 mr-1 sm:mr-2 text-sm sm:text-base">
                Dashboard
              </Link>
              <Link to="/resumo" className="px-2 py-1 sm:px-3 sm:py-2 rounded hover:bg-blue-700 mr-1 sm:mr-2 text-sm sm:text-base">
                Resumo
              </Link>

              {/* Opções dropdown */}
              <div className="relative" ref={optionsRef}>
                <button
                  className="px-2 py-1 sm:px-3 sm:py-2 rounded hover:bg-blue-700 flex items-center text-sm sm:text-base"
                  onClick={() => setOptionsOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={optionsOpen}
                >
                  {/* Ícone de opções com melhor legibilidade */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="6" r="1.7" />
                    <circle cx="12" cy="12" r="1.7" />
                    <circle cx="12" cy="18" r="1.7" />
                  </svg>
                  Opções
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-10 ${optionsOpen ? 'block' : 'hidden'}`}>
                  <Link
                    to="/relatorios"
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                    onClick={() => setOptionsOpen(false)}
                  >
                    {/* Ícone de relatórios: barras mais visíveis */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700" fill="currentColor" aria-hidden="true">
                      <rect x="5" y="10" width="3" height="7" rx="0" />
                      <rect x="10.5" y="6" width="3" height="11" rx="0" />
                      <rect x="16" y="12" width="3" height="5" rx="0" />
                    </svg>
                    Relatórios
                  </Link>
                  <Link
                    to="/importar-exportar"
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                    onClick={() => setOptionsOpen(false)}
                  >
                    {/* Ícone de importar/exportar: setas bidirecionais */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l5 5-5 5M7 12h10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17l-5-5 5-5M17 12H7" />
                    </svg>
                    Importar/Exportar
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                      onClick={() => setOptionsOpen(false)}
                    >
                      {/* Ícone de Admin: escudo sólido para destaque */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700" fill="currentColor" aria-hidden="true">
                        <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
                      </svg>
                      Admin
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  className="px-2 py-1 sm:px-3 sm:py-2 rounded hover:bg-blue-700 flex items-center flex-shrink-0 ml-1 sm:ml-2"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <Tooltip content={user.name}>
                    <span
                      className="mr-1 inline-flex items-center justify-center w-8 h-8 bg-white text-blue-600 font-semibold rounded-full flex-shrink-0"
                      aria-label={user.name}
                    >
                      {getInitials(user.name)}
                    </span>
                  </Tooltip>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-10 ${menuOpen ? 'block' : 'hidden'}`}>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h9.19l-3.22-3.22a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-2 py-1 sm:px-3 sm:py-2 rounded hover:bg-blue-700 mr-1 sm:mr-2 text-sm sm:text-base">
                Entrar
              </Link>
              <Link to="/register" className="px-2 py-1 sm:px-3 sm:py-2 bg-white text-blue-600 rounded hover:bg-gray-100 text-sm sm:text-base">
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