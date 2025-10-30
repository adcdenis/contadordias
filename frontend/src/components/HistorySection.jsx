import React, { useState, useEffect } from 'react';
import { FaTrash, FaHistory, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { counterAPI } from '../utils/api';

const HistorySection = ({ counterId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (counterId && !historyLoaded) {
      fetchHistory();
    }
  }, [counterId, historyLoaded]);

  useEffect(() => {
    // Reset state when counterId changes
    setHistory([]);
    setHistoryLoaded(false);
    setIsExpanded(false);
  }, [counterId]);

  useEffect(() => {
    if (isExpanded && counterId && !historyLoaded) {
      fetchHistory();
    }
  }, [isExpanded, counterId, historyLoaded]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await counterAPI.getHistory(counterId);
      setHistory(response);
      setHistoryLoaded(true);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      showToast('❌ Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (historyId) => {
    if (!window.confirm('Tem certeza que deseja excluir este item do histórico?')) {
      return;
    }

    try {
      setDeleting(historyId);
      await counterAPI.deleteHistoryItem(historyId);
      setHistory(history.filter(item => item._id !== historyId));
      showToast('✅ Item do histórico removido com sucesso');
    } catch (error) {
      console.error('Erro ao deletar item do histórico:', error);
      showToast('❌ Erro ao remover item do histórico');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getOperationLabel = (operation) => {
    const labels = {
      create: 'Criação',
      update: 'Atualização',
      delete: 'Exclusão'
    };
    return labels[operation] || operation;
  };

  const getOperationColor = (operation) => {
    const colors = {
      create: 'text-green-600',
      update: 'text-blue-600',
      delete: 'text-red-600'
    };
    return colors[operation] || 'text-gray-600';
  };

  const formatTimeSnapshot = (timeSnapshot) => {
    if (!timeSnapshot) return 'N/A';
    
    const { past, years, months, days, hours, minutes, seconds } = timeSnapshot;
    const parts = [];
    
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mês${months > 1 ? 'es' : ''}`);
    if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
    if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);
    
    if (parts.length === 0) return 'Menos de 1 segundo';
    
    const timeText = parts.join(', ');
    return past ? `${timeText} atrás` : `${timeText} faltantes`;
  };

  const formatCategory = (category) => {
    return category || 'Geral';
  };

  const formatRecurrence = (recurrence) => {
    const recurrenceLabels = {
      none: 'Nenhuma',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return recurrenceLabels[recurrence] || recurrence || 'Nenhuma';
  };

  // Componente para descrição com tooltip
  const DescriptionWithTooltip = ({ description, itemId, maxLength = 50 }) => {
    const displayText = description || 'Sem descrição';
    const shouldTruncate = displayText.length > maxLength;
    const truncatedText = shouldTruncate ? `${displayText.substring(0, maxLength)}...` : displayText;
    
    if (!shouldTruncate) {
      return <span>{displayText}</span>;
    }

    return (
      <div className="relative inline-block">
        <span 
          className="cursor-help border-b border-dotted border-gray-400"
          onMouseEnter={() => setShowTooltip(itemId)}
          onMouseLeave={() => setShowTooltip(null)}
          title={displayText}
        >
          {truncatedText}
        </span>
        {showTooltip === itemId && (
          <div className="absolute z-50 bottom-full left-0 mb-2 p-2 bg-gray-800 text-white text-sm rounded shadow-lg max-w-xs break-words">
            {displayText}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FaHistory className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Histórico de Alterações
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>
        {isExpanded ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaHistory className="mx-auto text-4xl mb-2 opacity-50" />
              <p>Nenhum histórico encontrado</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recorrência
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data do Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Snapshot de Tempo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Operação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora da Atualização
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.snapshot.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <DescriptionWithTooltip 
                            description={item.snapshot.description} 
                            itemId={`desktop-${item._id}`}
                            maxLength={40}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCategory(item.snapshot.category)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatRecurrence(item.snapshot.recurrence)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.snapshot.eventDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatTimeSnapshot(item.timeSnapshot)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getOperationColor(item.operation)}`}>
                            {getOperationLabel(item.operation)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteHistoryItem(item._id)}
                            disabled={deleting === item._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Excluir item do histórico"
                          >
                            {deleting === item._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {history.map((item) => (
                  <div key={item._id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">
                        {item.snapshot.name}
                      </h4>
                      <button
                        onClick={() => handleDeleteHistoryItem(item._id)}
                        disabled={deleting === item._id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 ml-2"
                        title="Excluir item do histórico"
                      >
                        {deleting === item._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Descrição:</span>
                        <span className="ml-2 text-gray-500">
                          <DescriptionWithTooltip 
                            description={item.snapshot.description} 
                            itemId={`mobile-${item._id}`}
                            maxLength={60}
                          />
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Categoria:</span>
                        <span className="ml-2 text-gray-500">
                          {formatCategory(item.snapshot.category)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Recorrência:</span>
                        <span className="ml-2 text-gray-500">
                          {formatRecurrence(item.snapshot.recurrence)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Data do Evento:</span>
                        <span className="ml-2 text-gray-500">
                          {formatDate(item.snapshot.eventDate)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Snapshot de Tempo:</span>
                        <span className="ml-2 text-gray-500">
                          {formatTimeSnapshot(item.timeSnapshot)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Operação:</span>
                        <span className={`ml-2 font-medium ${getOperationColor(item.operation)}`}>
                          {getOperationLabel(item.operation)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Atualização:</span>
                        <span className="ml-2 text-gray-500">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HistorySection;