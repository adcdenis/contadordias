import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import CounterForm from '../components/CounterForm';
import { calculateDetailedTime } from '../utils/timeUtils';

const CounterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});

  // Buscar detalhes do contador
  useEffect(() => {
    const fetchCounter = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters/${id}`);
        setCounter(response.data);
        calculateTimeRemaining(new Date(response.data.eventDate));
      } catch (err) {
        setError('Erro ao carregar detalhes do contador');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounter();
  }, [id]);

  // Calcular tempo restante
  const calculateTimeRemaining = (eventDate) => {
    const updateTime = () => {
      const { years, months, days, hours, minutes, seconds, past } = calculateDetailedTime(eventDate);
      setTimeRemaining({ years, months, days, hours, minutes, seconds, past });
    };
    
    // Atualizar imediatamente
    updateTime();
    
    // Atualizar a cada segundo
    const interval = setInterval(updateTime, 1000);
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  };

  // Atualizar contador
  const handleUpdateCounter = async (updatedData) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters/${id}`, updatedData);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters/${id}`);
      setCounter(response.data);
      setEditing(false);
      calculateTimeRemaining(new Date(response.data.eventDate));
    } catch (err) {
      setError('Erro ao atualizar contador');
      console.error(err);
    }
  };

  // Excluir contador
  const handleDeleteCounter = async () => {
    if (window.confirm('Tem certeza que deseja excluir este contador?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters/${id}`);
        navigate('/dashboard');
      } catch (err) {
        setError('Erro ao excluir contador');
        console.error(err);
      }
    }
  };

  // Alternar favorito
  const handleToggleFavorite = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters/${id}`, {
        ...counter,
        isFavorite: !counter.isFavorite
      });
      setCounter({
        ...counter,
        isFavorite: !counter.isFavorite
      });
    } catch (err) {
      setError('Erro ao atualizar contador');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando detalhes do contador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <div className="mt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Voltar para Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Contador não encontrado</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 btn btn-primary"
        >
          Voltar para Dashboard
        </button>
      </div>
    );
  }

  const eventDateObj = new Date(counter.eventDate);
  const formattedDate = format(eventDateObj, "dd 'de' MMMM 'de' yyyy", { locale: pt });

  return (
    <div>
      {editing ? (
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-bold mb-4">Editar Contador</h2>
          <CounterForm 
            counter={counter} 
            onSubmit={handleUpdateCounter} 
            onCancel={() => setEditing(false)} 
          />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{counter.name}</h1>
            <div className="flex space-x-2">
              <button 
                onClick={handleToggleFavorite}
                className="text-yellow-500 hover:text-yellow-600"
                title={counter.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                {counter.isFavorite ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              {counter.category}
            </span>
            {counter.tags && counter.tags.map((tag, index) => (
              <span key={index} className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2">
                {tag}
              </span>
            ))}
          </div>
          
          {counter.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{counter.description}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Data do Evento</h3>
            <p className="text-gray-700">{formattedDate}</p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Contador</h3>
            {timeRemaining.past ? (
              <p className="text-2xl font-bold text-red-600">Este evento já ocorreu</p>
            ) : (
              <div className="grid grid-cols-6 gap-2 text-center">
                {timeRemaining.years > 0 && (
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <span className="block text-2xl font-bold">{timeRemaining.years}</span>
                    <span className="text-gray-600 text-sm">{timeRemaining.years === 1 ? 'Ano' : 'Anos'}</span>
                  </div>
                )}
                {timeRemaining.months > 0 && (
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <span className="block text-2xl font-bold">{timeRemaining.months}</span>
                    <span className="text-gray-600 text-sm">{timeRemaining.months === 1 ? 'Mês' : 'Meses'}</span>
                  </div>
                )}
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="block text-2xl font-bold">{timeRemaining.days}</span>
                  <span className="text-gray-600 text-sm">{timeRemaining.days === 1 ? 'Dia' : 'Dias'}</span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="block text-2xl font-bold">{timeRemaining.hours}</span>
                  <span className="text-gray-600 text-sm">{timeRemaining.hours === 1 ? 'Hora' : 'Horas'}</span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="block text-2xl font-bold">{timeRemaining.minutes}</span>
                  <span className="text-gray-600 text-sm">{timeRemaining.minutes === 1 ? 'Min' : 'Mins'}</span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="block text-2xl font-bold">{timeRemaining.seconds}</span>
                  <span className="text-gray-600 text-sm">{timeRemaining.seconds === 1 ? 'Seg' : 'Segs'}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary mr-2"
              >
                Voltar
              </button>
              <button
                onClick={() => setEditing(true)}
                className="btn btn-success"
              >
                Editar
              </button>
            </div>
            <button
              onClick={handleDeleteCounter}
              className="btn btn-danger"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounterDetail;