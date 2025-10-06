import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Página não encontrada</p>
      <Link to="/" className="btn btn-primary">
        Voltar para a página inicial
      </Link>
    </div>
  );
};

export default NotFound;