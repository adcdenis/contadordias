import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateDetailedTime } from '../utils/timeUtils';

const CounterCard = ({ counter, onDelete, onToggleFavorite }) => {
  const { _id, name, description, eventDate, category, isFavorite } = counter;
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
  
  // Obter a distância de tempo formatada já está em timeDetails.formattedDistance
  
  // Obter a data formatada
  const formattedDate = timeDetails.formattedDate;
  
  // Determinar a classe CSS com base no status do evento
  const cardClass = isPastEvent 
    ? 'counter-card-past' 
    : isFavorite 
      ? 'counter-card-favorite' 
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
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg md:text-xl font-semibold truncate">{name}</h3>
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(_id, isFavorite);
            }}
            className="counter-action-btn text-yellow-500 hover:text-yellow-600"
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {isFavorite ? '★' : '☆'}
          </button>
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
      
      <div className="mb-3">
        <span className="counter-badge">{category}</span>
      </div>
      
      {description && (
        <p className="text-gray-700 mb-3 line-clamp-2">{description}</p>
      )}

      {Array.isArray(counter.tags) && counter.tags.length > 0 && (
        <div className="mb-3">
          {counter.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="counter-tag">{tag}</span>
          ))}
        </div>
      )}
      
      <div className="mt-2">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${isYearsVisible ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-3 text-center`}>
          {isYearsVisible && (
            <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'}`}>
              <span className="counter-metric-number">{timeDetails.years}</span>
              <span className="counter-metric-label">Anos</span>
            </div>
          )}
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'}`}>
            <span className="counter-metric-number">{timeDetails.days}</span>
            <span className="counter-metric-label">Dias</span>
          </div>
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'}`}>
            <span className="counter-metric-number">{timeDetails.hours}</span>
            <span className="counter-metric-label">Horas</span>
          </div>
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'}`}>
            <span className="counter-metric-number">{timeDetails.minutes}</span>
            <span className="counter-metric-label">Mins</span>
          </div>
          <div className={`counter-metric ${isPastEvent ? 'counter-metric-red' : 'counter-metric-blue'}`}>
            <span className="counter-metric-number">{timeDetails.seconds}</span>
            <span className="counter-metric-label">Segs</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">{formattedDate}</p>
      </div> 
      
    </div>
  );
};

export default CounterCard;