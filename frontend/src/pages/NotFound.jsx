import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Página não encontrada</p>
      <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 010 1.06L8.56 10.5h10.69a.75.75 0 010 1.5H8.56l4.23 4.21a.75.75 0 11-1.06 1.06l-5.5-5.5a.75.75 0 010-1.06l5.5-5.5a.75.75 0 011.06 0z" clipRule="evenodd" />
        </svg>
        Voltar para a página inicial
      </Link>
    </div>
  );
};

export default NotFound;