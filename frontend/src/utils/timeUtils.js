import { 
  format,
  addYears,
  addMonths,
  addDays,
  addHours,
  addMinutes,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds
} from 'date-fns';
import { pt } from 'date-fns/locale';

/**
 * Calcula o tempo detalhado entre duas datas
 * @param {Date} targetDate - Data alvo
 * @param {Date} currentDate - Data atual (opcional)
 * @returns {Object} Objeto com anos, meses, dias, horas, minutos, segundos e se é passado
 */
export const calculateDetailedTime = (targetDate, currentDate = new Date()) => {
  const target = new Date(targetDate);
  const current = new Date(currentDate);
  const isPast = current >= target;

  const start = isPast ? target : current;
  const end = isPast ? current : target;

  let cursor = start;

  // Diferenças precisas por unidade, respeitando calendário real
  const years = differenceInYears(end, cursor);
  cursor = addYears(cursor, years);

  const months = differenceInMonths(end, cursor);
  cursor = addMonths(cursor, months);

  const days = differenceInDays(end, cursor);
  cursor = addDays(cursor, days);

  const hours = differenceInHours(end, cursor);
  cursor = addHours(cursor, hours);

  const minutes = differenceInMinutes(end, cursor);
  cursor = addMinutes(cursor, minutes);

  const seconds = differenceInSeconds(end, cursor);

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