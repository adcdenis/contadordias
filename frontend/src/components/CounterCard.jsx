import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateDetailedTime } from '../utils/timeUtils';
import { truncateForMobile } from '../utils/textUtils';
import { googleCalendarService } from '../services/googleCalendarService';
import { useToast } from '../context/ToastContext';

const CounterCard = ({ counter, onDelete, selected = false, onSelectChange, selectionMode = false }) => {
  const { _id, name, description, eventDate, category, recurrence } = counter;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const { showToast } = useToast();
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

  // Função para criar evento no Google Calendar
  const handleGoogleCalendarIntegration = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsCreatingEvent(true);
    
    try {
      // Preparar dados do evento
      const eventData = {
        name: counter.name,
        eventDate: counter.eventDate,
        description: counter.description || `Evento importante: ${counter.name}`
      };
      
      // Criar evento diretamente no Google Calendar com lembretes padrão
      const result = googleCalendarService.createEventFromCounter(eventData);
      
      if (result.success) {
        showToast('✅ ' + result.message);
      }
    } catch (error) {
      console.error('Erro na integração com Google Calendar:', error);
      showToast('❌ Erro ao abrir Google Calendar: ' + error.message);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Função para compartilhar snapshot do contador
  const handleShareCounter = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Gerar texto de compartilhamento com todas as informações
      const shareText = generateShareText();
      
      // Verificar se o Web Share API está disponível
      if (navigator.share) {
        await navigator.share({
          title: `Contador: ${name}`,
          text: shareText
        });
        showToast('✅ Contador compartilhado com sucesso!');
      } else {
        // Fallback para clipboard
        await navigator.clipboard.writeText(shareText);
        showToast('✅ Informações do contador copiadas para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar contador:', error);
      showToast('❌ Erro ao compartilhar contador');
    }
  };

  // Função para gerar texto de compartilhamento
  const generateShareText = () => {
    const statusText = isPastEvent ? 'passou' : 'falta';
    const timeText = timeDetails.formattedDistance;
    
    let shareText = `📅 *${name}*\n`;
    
    if (description) {
      shareText += `📝 ${description}\n`;
    }
    
    shareText += `🗓️ Data: ${formattedDate}\n`;
    shareText += `⏰ ${isPastEvent ? 'Tempo decorrido' : 'Tempo restante'}: ${timeText}\n`;
    
    if (category) {
      shareText += `🏷️ Categoria: ${category}\n`;
    }
    
    if (recurrence && recurrence !== 'none') {
      const recurrenceText = recurrence === 'weekly' ? 'Semanal' : 
                            recurrence === 'monthly' ? 'Mensal' : 'Anual';
      shareText += `🔁 Recorrência: ${recurrenceText}\n`;
    }
    
    shareText += `\n⏱️ Detalhes do tempo:\n`;
    
    if (timeDetails.years > 0) {
      shareText += `• ${timeDetails.years} ${timeDetails.years === 1 ? 'ano' : 'anos'}\n`;
    }
    if (timeDetails.months > 0) {
      shareText += `• ${timeDetails.months} ${timeDetails.months === 1 ? 'mês' : 'meses'}\n`;
    }
    shareText += `• ${timeDetails.days} ${timeDetails.days === 1 ? 'dia' : 'dias'}\n`;
    shareText += `• ${timeDetails.hours} ${timeDetails.hours === 1 ? 'hora' : 'horas'}\n`;
    shareText += `• ${timeDetails.minutes} ${timeDetails.minutes === 1 ? 'minuto' : 'minutos'}\n`;
    shareText += `• ${timeDetails.seconds} ${timeDetails.seconds === 1 ? 'segundo' : 'segundos'}\n`;
    
    shareText += `\n📱 Compartilhado via Contador de Dias`;
    
    return shareText;
  };

  return (
    <div 
      className={`counter-card ${cardClass} cursor-pointer relative pr-8`}
      onClick={navigateToCounter}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 max-w-[calc(100%-2rem)]">
          {/* Checkbox de seleção múltipla (visível apenas em modo de seleção) */}
          {selectionMode && onSelectChange && (
            <input
              type="checkbox"
              aria-label="Selecionar contador"
              checked={!!selected}
              onChange={(e) => onSelectChange(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          )}
          <h3 className="text-base md:text-lg font-semibold truncate">
            <span className="block sm:hidden">{truncateForMobile(name)}</span>
            <span className="hidden sm:block">{name}</span>
          </h3>
        </div>
      </div>
      
      {/* Ícones de ação posicionados absolutamente na lateral direita */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 items-center" onClick={(e) => e.stopPropagation()}>
        {/* Compartilhar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShareCounter(e);
          }}
          className="counter-action-btn text-orange-600 hover:text-orange-700 p-1 bg-white/80 hover:bg-white rounded shadow-sm"
          title="Compartilhar"
        >
          <span className="counter-icon text-xs">📤</span>
        </button>

        {/* Google Calendar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleGoogleCalendarIntegration(e);
          }}
          disabled={isCreatingEvent}
          className="counter-action-btn text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed p-1 bg-white/80 hover:bg-white rounded shadow-sm"
          title="Google Calendar"
        >
          <span className="counter-icon text-xs">{isCreatingEvent ? "⏳" : "📅"}</span>
        </button>

        {/* Ver detalhes */}
        <Link 
          to={`/counter/${_id}`} 
          className="counter-action-btn text-blue-600 hover:text-blue-700 p-1 bg-white/80 hover:bg-white rounded shadow-sm"
          title="Ver detalhes"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="counter-icon text-xs">👁️</span>
        </Link>

        {/* Editar */}
        <Link
          to={`/counter/${_id}?edit=1`}
          className="counter-action-btn text-green-600 hover:text-green-700 p-1 bg-white/80 hover:bg-white rounded shadow-sm"
          title="Editar"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="counter-icon text-xs">✏️</span>
        </Link>

        {/* Excluir */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick();
          }}
          className="counter-action-btn text-red-600 hover:text-red-700 p-1 bg-white/80 hover:bg-white rounded shadow-sm"
          title="Excluir"
        >
          <span className="counter-icon text-xs">🗑️</span>
        </button>
      </div>
      
      {/* Modal de confirmação de exclusão */}
      {showConfirmDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Confirmar exclusão</h3>
            <p className="mb-6">Tem certeza que deseja excluir o contador "{name}"?</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={(e) => { e.stopPropagation(); cancelDelete(); }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-2 flex items-center flex-wrap max-w-[calc(100%-2rem)]">
        <span className="counter-badge">{category}</span>
        {recurrence && recurrence !== 'none' && (
          <span className="counter-badge">
            🔁 {recurrence === 'weekly' ? 'Semanal' : recurrence === 'monthly' ? 'Mensal' : 'Anual'}
          </span>
        )}
      </div>      
      
      <div className="mt-1 max-w-[calc(100%-2rem)]">
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