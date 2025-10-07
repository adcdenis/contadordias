import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import CounterForm from '../components/CounterForm';
import { calculateDetailedTime } from '../utils/timeUtils';
import { useToast } from '../context/ToastContext';

const CounterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [categories, setCategories] = useState([]);

  // Buscar detalhes do contador
  useEffect(() => {
    const fetchCounter = async () => {
      try {
        setLoading(true);
  const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/counters/${id}`);
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

  // Buscar categorias existentes para sugerir na edição
  useEffect(() => {
    const fetchCategories = async () => {
      try {
  const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/counters`);
        const uniqueCategories = [...new Set(response.data.map(c => c.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        // Não bloqueia a página caso não consiga carregar categorias
        console.error('Erro ao carregar categorias', err);
      }
    };
    fetchCategories();
  }, []);

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
    await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/counters/${id}`, updatedData);
    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/counters/${id}`);
      setCounter(response.data);
      setEditing(false);
      calculateTimeRemaining(new Date(response.data.eventDate));
      showToast('Contador atualizado com sucesso');
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao atualizar contador');
      console.error(err);
    }
  };

  // Excluir contador
  const handleDeleteCounter = async () => {
    if (window.confirm('Tem certeza que deseja excluir este contador?')) {
      try {
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/counters/${id}`);
        showToast('Contador excluído com sucesso');
        navigate('/dashboard');
      } catch (err) {
        setError('Erro ao excluir contador');
        console.error(err);
      }
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
  const formattedDate = format(eventDateObj, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt });

  return (
    <div>
      {editing ? (
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-bold mb-4">Editar Contador</h2>
          <CounterForm 
            counter={counter} 
            onSubmit={handleUpdateCounter} 
            onCancel={() => setEditing(false)} 
            categories={categories}
          />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{counter.name}</h1>
          </div>
          
          <div className="mb-6">
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              {counter.category}
            </span>
            {counter.recurrence && counter.recurrence !== 'none' && (
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                🔁 {counter.recurrence === 'weekly' ? 'Semanal' : counter.recurrence === 'monthly' ? 'Mensal' : 'Anual'}
              </span>
            )}
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
              <div className="grid grid-cols-6 gap-2 text-center">
                {timeRemaining.years > 0 && (
                   <div className={`counter-metric ${timeRemaining.past ? 'counter-metric-red rounded-lg' : 'counter-metric-blue rounded-lg'}`}> 
                    <span className="block text-2xl font-bold">{timeRemaining.years}</span>
                    <span className="text-gray-600 text-sm">{timeRemaining.years === 1 ? 'Ano' : 'Anos'}</span>
                  </div>
                )}
                {timeRemaining.months > 0 && (
                   <div className={`counter-metric ${timeRemaining.past ? 'counter-metric-red rounded-lg' : 'counter-metric-blue rounded-lg'}`}> 
                    <span className="block text-2xl font-bold">{timeRemaining.months}</span>
                    <span className="text-gray-600 text-sm">{timeRemaining.months === 1 ? 'Mês' : 'Meses'}</span>
                  </div>
                )}
                 <div className={`counter-metric ${timeRemaining.past ? 'counter-metric-red rounded-lg' : 'counter-metric-blue rounded-lg'}`}> 
                  <span className="block text-2xl font-bold">{timeRemaining.days}</span>
                  <span className="text-gray-600 text-sm">{timeRemaining.days === 1 ? 'Dia' : 'Dias'}</span>
                </div>
                 <div className={`counter-metric ${timeRemaining.past ? 'counter-metric-red rounded-lg' : 'counter-metric-blue rounded-lg'}`}> 
                  <span className="block text-2xl font-bold">{timeRemaining.hours}</span>
                  <span className="text-gray-600 text-sm">{timeRemaining.hours === 1 ? 'Hora' : 'Horas'}</span>
                </div>
                 <div className={`counter-metric ${timeRemaining.past ? 'counter-metric-red rounded-lg' : 'counter-metric-blue rounded-lg'}`}> 
                  <span className="block text-2xl font-bold">{timeRemaining.minutes}</span>
                  <span className="text-gray-600 text-sm">{timeRemaining.minutes === 1 ? 'Min' : 'Mins'}</span>
                </div>
                 <div className={`counter-metric ${timeRemaining.past ? 'counter-metric-red rounded-lg' : 'counter-metric-blue rounded-lg'}`}> 
                  <span className="block text-2xl font-bold">{timeRemaining.seconds}</span>
                  <span className="text-gray-600 text-sm">{timeRemaining.seconds === 1 ? 'Seg' : 'Segs'}</span>
                </div>
              </div>           
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