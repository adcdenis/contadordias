import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

/**
 * Calcula o tempo detalhado entre duas datas
 * @param {Date} targetDate - Data alvo
 * @param {Date} currentDate - Data atual (opcional)
 * @returns {Object} Objeto com anos, meses, dias, horas, minutos, segundos e se é passado
 */
export const calculateDetailedTime = (targetDate, currentDate = new Date()) => {
  const target = new Date(targetDate);
  const isPast = currentDate > target;
  
  // Calcular a diferença em milissegundos
  let diffMs = Math.abs(currentDate - target);
  
  // Converter para unidades de tempo
  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor((diffMs / (1000 * 60 * 60 * 24)) % 30);
  const months = Math.floor((diffMs / (1000 * 60 * 60 * 24 * 30)) % 12);
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  
  // Formatar a data
  const formattedDate = format(target, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt });
  
  // Criar string formatada para exibição
  let formattedDistance = '';
  if (years > 0) formattedDistance += `${years} ${years === 1 ? 'ano' : 'anos'}, `;
  if (months > 0) formattedDistance += `${months} ${months === 1 ? 'mês' : 'meses'}, `;
  if (days > 0) formattedDistance += `${days} ${days === 1 ? 'dia' : 'dias'}, `;
  if (hours > 0) formattedDistance += `${hours} ${hours === 1 ? 'hora' : 'horas'}, `;
  if (minutes > 0) formattedDistance += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}, `;
  formattedDistance += `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
  
  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    past: isPast,
    formattedDistance,
    formattedDate
  };
};