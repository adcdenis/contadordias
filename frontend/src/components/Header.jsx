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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

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
    setMobileMenuOpen(false);
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold flex-shrink-0 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
              <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6a1.5 1.5 0 00-1.5 1.5v11.25c0 .827.673 1.5 1.5 1.5h13.5c.827 0 1.5-.673 1.5-1.5V7.5c0-.827-.673-1.5-1.5-1.5H5.25z" clipRule="evenodd" />
            </svg>
            <span>Lembre+</span>
          </Link>
          
          {user ? (
            <>
              {/* Menu Desktop - visível em telas médias e grandes */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                <Link to="/dashboard" className="px-2 py-1 lg:px-3 lg:py-2 rounded hover:bg-blue-700 text-sm lg:text-base flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                  </svg>
                  Dashboard
                </Link>
                <Link to="/resumo" className="px-2 py-1 lg:px-3 lg:py-2 rounded hover:bg-blue-700 text-sm lg:text-base flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                  </svg>
                  Resumo
                </Link>

                {/* Opções dropdown */}
                <div className="relative" ref={optionsRef}>
                  <button
                    className="px-2 py-1 lg:px-3 lg:py-2 rounded hover:bg-blue-700 flex items-center text-sm lg:text-base gap-2"
                    onClick={() => setOptionsOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={optionsOpen}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.279 5.48a1.875 1.875 0 00-2.416.919l-.243.422a1.875 1.875 0 00.319 2.37l.94.853c.091.083.147.208.147.351 0 .342.03.686.09 1.024.014.08-.006.166-.076.235l-.94.853a1.875 1.875 0 00-.319 2.37l.243.422a1.875 1.875 0 002.416.919l1.038-.41c.116-.043.284-.032.45.083.312.197.65.395.986.57.182.088.277.228.297.348l.178 1.071c.151.904.933 1.567 1.85 1.567h.486c.917 0 1.699-.663 1.85-1.567l.178-1.072c.02-.119.115-.26.297-.347a7.493 7.493 0 00.986-.57c.166-.115.334-.126.45-.083l1.038.41a1.875 1.875 0 002.416-.919l.243-.422a1.875 1.875 0 00-.319-2.37l-.94-.853c-.07-.069-.09-.155-.076-.235.06-.338.09-.682.09-1.024 0-.143.056-.268.147-.351l.94-.853a1.875 1.875 0 00.319-2.37l-.243-.422a1.875 1.875 0 00-2.416-.919l-1.038.41c-.116.043-.284.032-.45-.083a7.493 7.493 0 00-.986-.57c-.182-.088-.277-.228-.297-.348L12.928 3.817c-.151-.904-.933-1.567-1.85-1.567h-.486zM8.25 12a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" clipRule="evenodd" />
                    </svg>                
                    Opções
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`absolute right-0 mt-2 w-40 lg:w-48 bg-white rounded-md shadow-lg py-1 z-10 ${optionsOpen ? 'block' : 'hidden'}`}>
                    <Link
                      to="/relatorios"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                      onClick={() => setOptionsOpen(false)}
                    >
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l5 5-5 5M7 12h10" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17l-5-5 5-5M17 12H7" />
                      </svg>
                      Backup
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                        onClick={() => setOptionsOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700" fill="currentColor" aria-hidden="true">
                          <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
                        </svg>
                        Admin
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* Avatar dropdown */}
                <div className="relative flex-shrink-0" ref={menuRef}>
                  <button
                    className="px-2 py-1 lg:px-3 lg:py-2 rounded hover:bg-blue-700 flex items-center flex-shrink-0"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    <Tooltip content={user.name}>
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="mr-1 w-8 h-8 rounded-full flex-shrink-0 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'inline-flex';
                          }}
                        />
                      ) : null}
                      <span
                        className={`mr-1 inline-flex items-center justify-center w-8 h-8 bg-white text-blue-600 font-semibold rounded-full flex-shrink-0 ${user.profilePicture ? 'hidden' : ''}`}
                        aria-label={user.name}
                        style={{ display: user.profilePicture ? 'none' : 'inline-flex' }}
                      >
                        {getInitials(user.name)}
                      </span>
                    </Tooltip>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={`absolute right-0 mt-2 w-40 lg:w-48 bg-white rounded-md shadow-lg py-1 z-10 ${menuOpen ? 'block' : 'hidden'}`}>
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
              </nav>

              {/* Menu Mobile - visível apenas em telas pequenas */}
              <div className="md:hidden flex items-center gap-2">
                {/* Botão hambúrguer */}
                <div className="relative" ref={mobileMenuRef}>
                  <button
                    className="p-2 rounded hover:bg-blue-700 flex items-center justify-center"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={mobileMenuOpen}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  {/* Menu mobile dropdown */}
                  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                    <Link
                      to="/dashboard"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link
                      to="/resumo"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                      </svg>
                      Resumo
                    </Link>
                    <Link
                      to="/relatorios"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
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
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l5 5-5 5M7 12h10" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17l-5-5 5-5M17 12H7" />
                      </svg>
                      Backup
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 inline-flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700" fill="currentColor" aria-hidden="true">
                          <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
                        </svg>
                        Admin
                      </Link>
                    )}
                  </div>
                </div>

                {/* Avatar compacto */}
                <div className="relative" ref={menuRef}>
                  <button
                    className="p-1 rounded hover:bg-blue-700 flex items-center"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline-flex';
                        }}
                      />
                    ) : null}
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 bg-white text-blue-600 font-semibold rounded-full ${user.profilePicture ? 'hidden' : ''}`}
                      aria-label={user.name}
                      style={{ display: user.profilePicture ? 'none' : 'inline-flex' }}
                    >
                      {getInitials(user.name)}
                    </span>
                  </button>
                  
                  <div className={`absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 ${menuOpen ? 'block' : 'hidden'}`}>
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
              </div>
            </>
          ) : (
            /* Menu não logado */
            <nav className="flex items-center gap-2">
              <Link to="/login" className="px-2 py-1 sm:px-3 sm:py-2 rounded hover:bg-blue-700 text-sm sm:text-base">
                Entrar
              </Link>
              <Link to="/register" className="px-2 py-1 sm:px-3 sm:py-2 bg-white text-blue-600 rounded hover:bg-gray-100 text-sm sm:text-base">
                Registrar
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;