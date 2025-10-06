import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center">
      <div className="text-center max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-6">Contador de Dias</h1>
        <p className="text-xl mb-8">
          Acompanhe eventos importantes da sua vida com nosso contador de dias.
          Nunca mais esqueça datas importantes!
        </p>
        
        {user ? (
          <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
            Ir para o Dashboard
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="btn btn-primary text-lg px-8 py-3">
              Entrar
            </Link>
            <Link to="/register" className="btn btn-success text-lg px-8 py-3">
              Registrar
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-blue-600 text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Acompanhe Eventos</h2>
          <p className="text-gray-600">
            Crie contadores para aniversários, feriados, viagens, prazos e muito mais.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-blue-600 text-4xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Organize por Categorias</h2>
          <p className="text-gray-600">
            Classifique seus contadores por categorias e tags para manter tudo organizado.
          </p>
        </div>
        
        {/* Seção de favoritos removida */}
      </div>
      
      <div className="bg-gray-100 w-full py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Como Funciona</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Crie uma Conta</h3>
              <p className="text-gray-600">
                Registre-se gratuitamente para começar a usar o Contador de Dias.
              </p>
            </div>
            
            <div>
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Adicione Contadores</h3>
              <p className="text-gray-600">
                Crie contadores para suas datas importantes com descrições e categorias.
              </p>
            </div>
            
            <div>
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Acompanhe o Tempo</h3>
              <p className="text-gray-600">
                Visualize quanto tempo falta ou já passou desde seus eventos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;