import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateDetailedTime } from '../utils/timeUtils';

const CounterCard = ({ counter, onDelete }) => {
  const { _id, name, description, eventDate, category, recurrence } = counter;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  
  // Atualizar o tempo atual a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calcular tempo detalhado usando o tempo atual atualizado (memoizado para performance)
  const timeDetails = useMemo(() => {
    return calculateDetailedTime(eventDate, currentTime);
  }, [eventDate, currentTime]);
  
  const isPastEvent = timeDetails.past;
  const isYearsVisible = timeDetails.years > 0;
  const isMonthVisible = timeDetails.months > 0;
  
  // Obter a distância de tempo formatada já está em timeDetails.formattedDistance
  
  // Obter a data formatada
  const formattedDate = timeDetails.formattedDate;
  
  // Determinar a classe CSS com base no status do evento
  const cardClass = isPastEvent 
    ? 'counter-card-past' 
    : 'counter-card-future';
      
  // Função para confirmar exclusão
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };
  
  // Função para confirmar a exclusão
  const confirmDelete = () => {
    onDelete(_id);
    setShowConfirmDelete(false);
  };
  
  // Função para cancelar a exclusão
  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const navigateToCounter = () => {
    navigate(`/counter/${_id}`);
  };

  return (
    <div 
      className={`counter-card ${cardClass} cursor-pointer`}
      onClick={navigateToCounter}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base md:text-lg font-semibold truncate">{name}</h3>
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link 
            to={`/counter/${_id}`} 
            className="counter-action-btn text-blue-600 hover:text-blue-700"
            onClick={(e) => e.stopPropagation()}
            title="Ver detalhes"
          >
            <span>👁️</span>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            className="counter-action-btn text-red-600 hover:text-red-700"
            title="Excluir"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>
      
      {/* Modal de confirmação de exclusão */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar exclusão</h3>
            <p className="mb-6">Tem certeza que deseja excluir o contador "{name}"?</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-2 flex items-center flex-wrap">
        <span className="counter-badge">{category}</span>
        {recurrence && recurrence !== 'none' && (
          <span className="counter-badge">
            🔁 {recurrence === 'weekly' ? 'Semanal' : recurrence === 'monthly' ? 'Mensal' : 'Anual'}
          </span>
        )}
      </div>      
      
      <div className="mt-1">
        <div className={`grid grid-cols-6 gap-2 text-center`}>
          {isYearsVisible && (
            <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'} rounded-lg`}>
              <span className="counter-metric-number">{timeDetails.years}</span>
              <span className="counter-metric-label">{timeDetails.years === 1 ? 'Ano' : 'Anos'}</span>
            </div>
          )}
          {isMonthVisible && (
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'} rounded-lg`}>
            <span className="counter-metric-number">{timeDetails.months}</span>
            <span className="counter-metric-label">{timeDetails.months === 1 ? 'Mês' : 'Meses'}</span>
          </div>
          )}
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'} rounded-lg`}>
            <span className="counter-metric-number">{timeDetails.days}</span>
            <span className="counter-metric-label">{timeDetails.days === 1 ? 'Dia' : 'Dias'}</span>
          </div>
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'} rounded-lg`}>
            <span className="counter-metric-number">{timeDetails.hours}</span>
            <span className="counter-metric-label">{timeDetails.hours === 1 ? 'Hora' : 'Horas'}</span>
          </div>
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'} rounded-lg`}>
            <span className="counter-metric-number">{timeDetails.minutes}</span>
            <span className="counter-metric-label">{timeDetails.minutes === 1 ? 'Min' : 'Mins'}</span>
          </div>
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'} rounded-lg`}>
            <span className="counter-metric-number">{timeDetails.seconds}</span>
            <span className="counter-metric-label">{timeDetails.seconds === 1 ? 'Seg' : 'Segs'}</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">{formattedDate}</p>
      </div> 
      
    </div>
  );
};

export default CounterCard;