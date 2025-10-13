import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center">
      <div className="text-center max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-6">Lembre+</h1>
        <p className="text-xl mb-8">
          Acompanhe eventos importantes da sua vida com nosso contador de dias.
          Nunca mais esqueça datas importantes!
        </p>
        
        {user ? (
          <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4.5 12a.75.75 0 01.75-.75h11.19l-3.22-3.22a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H5.25A.75.75 0 014.5 12z" clipRule="evenodd" />
            </svg>
            Ir para o Dashboard
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="btn btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h9.19l-3.22-3.22a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Entrar
            </Link>
            <Link to="/register" className="btn btn-success text-lg px-8 py-3 inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zM4.5 20.25a7.5 7.5 0 0115 0 .75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                <path d="M19.5 8.25h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5a.75.75 0 011.5 0v1.5z" />
              </svg>
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
            Classifique seus contadores por categorias para manter tudo organizado.
          </p>
        </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75v-8.19l-2.72 2.72a.75.75 0 11-1.06-1.06l4-4a.75.75 0 011.06 0l4 4a.75.75 0 11-1.06 1.06l-2.72-2.72v8.19a.75.75 0 01-.75.75z" clipRule="evenodd" />
                  <path d="M4.5 4.5a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75v0a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Importação/Exportação</h3>
              <p className="text-gray-600 mb-4">
                Importe contadores a partir de um arquivo JSON ou exporte seus dados para backup.
              </p>             
            </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 20.5h16" />
                  <path d="M7 18V9" />
                  <path d="M12 18V6" />
                  <path d="M17 18V11" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Página de Resumo</h3>
              <p className="text-gray-600 mb-4">
                Veja totais e gráficos por categoria para entender seus eventos rapidamente.
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
                Registre-se gratuitamente para começar a usar o Lembre+.
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

      {/* Link para Política de Privacidade (apenas visível na Home) */}
      <div className="text-center mb-8">
        <Link to="/privacidade" className="text-gray-600 hover:underline">
          Política de Privacidade
        </Link>
      </div>
    </div>
  );
};

export default Home;