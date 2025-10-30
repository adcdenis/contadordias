/**
 * Calcula o tempo detalhado entre duas datas (versão backend)
 * @param {Date} targetDate - Data alvo
 * @param {Date} currentDate - Data atual (opcional)
 * @returns {Object} Objeto com anos, meses, dias, horas, minutos, segundos e se é passado
 */
const calculateDetailedTime = (targetDate, currentDate = new Date()) => {
  const target = new Date(targetDate);
  const current = new Date(currentDate);
  const isPast = current >= target;

  const start = isPast ? target : current;
  const end = isPast ? current : target;

  let cursor = new Date(start);

  // Calcular anos
  let years = 0;
  while (true) {
    const nextYear = new Date(cursor);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    if (nextYear <= end) {
      years++;
      cursor = nextYear;
    } else {
      break;
    }
  }

  // Calcular meses
  let months = 0;
  while (true) {
    const nextMonth = new Date(cursor);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= end) {
      months++;
      cursor = nextMonth;
    } else {
      break;
    }
  }

  // Calcular dias
  const days = Math.floor((end - cursor) / (1000 * 60 * 60 * 24));
  cursor.setDate(cursor.getDate() + days);

  // Calcular horas
  const hours = Math.floor((end - cursor) / (1000 * 60 * 60));
  cursor.setHours(cursor.getHours() + hours);

  // Calcular minutos
  const minutes = Math.floor((end - cursor) / (1000 * 60));
  cursor.setMinutes(cursor.getMinutes() + minutes);

  // Calcular segundos
  const seconds = Math.floor((end - cursor) / 1000);

  // Criar string formatada para exibição
  let formattedDistance = '';
  if (years > 0) formattedDistance += `${years} ${years === 1 ? 'ano' : 'anos'}, `;
  if (months > 0) formattedDistance += `${months} ${months === 1 ? 'mês' : 'meses'}, `;
  if (days > 0) formattedDistance += `${days} ${days === 1 ? 'dia' : 'dias'}, `;
  if (hours > 0) formattedDistance += `${hours} ${hours === 1 ? 'hora' : 'horas'}, `;
  if (minutes > 0) formattedDistance += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}, `;
  formattedDistance += `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;

  // Remover vírgula final se existir
  formattedDistance = formattedDistance.replace(/, $/, '');

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    past: isPast,
    formattedDistance
  };
};

module.exports = {
  calculateDetailedTime
};