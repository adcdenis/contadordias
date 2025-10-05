import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateDetailedTime } from '../utils/timeUtils';

const CounterCard = ({ counter, onDelete, onToggleFavorite }) => {
  const { _id, name, description, eventDate, category, isFavorite } = counter;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();
  
  // Calcular tempo detalhado
  const timeDetails = calculateDetailedTime(eventDate);
  const isPastEvent = timeDetails.past;
  
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
      className={`counter-card ${cardClass} bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 cursor-pointer`}
      onClick={navigateToCounter}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold truncate">{name}</h3>
        <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(_id, isFavorite);
            }}
            className="text-yellow-500 hover:text-yellow-600 transform hover:scale-110 transition-transform"
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          <Link 
            to={`/counter/${_id}`} 
            className="text-blue-500 hover:text-blue-600 transform hover:scale-110 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <span>👁️</span>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            className="text-red-500 hover:text-red-600 transform hover:scale-110 transition-transform"
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
      
      <div className="mb-4">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
          {category}
        </span>
      </div>
      
      {description && (
        <p className="text-gray-700 mb-4 line-clamp-2">{description}</p>
      )}
      
      <div className="mb-4">
        <p className="text-lg font-bold">
          {isPastEvent ? 'Ocorreu há' : 'Faltam'} {timeDetails.formattedDistance}
        </p>
        <p className="text-sm text-gray-600">{formattedDate}</p>
      </div>
      
      <div className="mt-auto">
        <Link 
          to={`/counter/${_id}`} 
          className="text-blue-600 hover:text-blue-800"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
};

export default CounterCard;