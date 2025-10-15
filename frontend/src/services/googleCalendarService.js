export const googleCalendarService = {
  // Criar evento no Google Calendar (abre em nova aba)
  createEventFromCounter(counterData, customReminders = null) {
    try {
      const { name, eventDate, description } = counterData;
      
      // Validar se a data existe e é válida
      if (!eventDate) {
        throw new Error('Data do evento não encontrada');
      }
      
      const eventDateObj = new Date(eventDate);
      
      // Verificar se a data é válida
      if (isNaN(eventDateObj.getTime())) {
        throw new Error('Data do evento inválida');
      }
      
      // Formatar data para o Google Calendar (YYYYMMDDTHHMMSSZ)
      const startDate = eventDateObj.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      
      // Evento de 1 hora de duração
      const endDate = new Date(eventDateObj.getTime() + 60 * 60 * 1000)
        .toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      
      // Processar lembretes personalizados ou usar padrão
      let reminderMinutes = [60, 1440]; // Padrão: 1 hora e 1 dia antes
      
      if (customReminders && Array.isArray(customReminders)) {
        reminderMinutes = customReminders.map(reminder => {
          const { value, unit } = reminder;
          const multipliers = {
            minutes: 1,
            hours: 60,
            days: 1440,
            weeks: 10080
          };
          return value * (multipliers[unit] || 1);
        });
      }
      
      // Parâmetros do evento
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: name || 'Evento',
        dates: `${startDate}/${endDate}`,
        details: description || `Evento criado pelo Lembre+: ${name}`,
        reminders: reminderMinutes.join(',') // em minutos
      });
      
      const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
      
      // Abrir em nova aba
      window.open(url, '_blank');
      
      return { success: true, message: 'Evento aberto no Google Calendar. Complete a criação na nova aba.' };
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw new Error(`Falha ao abrir o Google Calendar: ${error.message}`);
    }
  },

  // Criar arquivo .ics para download
  async createICSFile(counterData) {
    try {
      const { title, eventDate, description } = counterData;
      
      // Validar se a data existe e é válida
      if (!eventDate) {
        throw new Error('Data do evento não encontrada');
      }
      
      const eventDateObj = new Date(eventDate);
      
      // Verificar se a data é válida
      if (isNaN(eventDateObj.getTime())) {
        throw new Error('Data do evento inválida');
      }
      
      const startDate = eventDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = new Date(eventDateObj.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Contador de Dias//Event//PT',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@contadordias.app`,
        `DTSTAMP:${now}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description || `Evento criado pelo Contador de Dias para: ${title}`}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Lembrete: 1 hora antes',
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Lembrete: 1 dia antes',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');
      
      // Criar e baixar arquivo .ics
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Arquivo de calendário baixado com sucesso!'
      };
    } catch (error) {
      console.error('Erro ao criar arquivo ICS:', error);
      throw new Error('Falha ao criar arquivo de calendário');
    }
  },

  // Verificar se o navegador suporta Web Share API para calendários
  canShareCalendar() {
    return navigator.share && navigator.canShare;
  },

  // Compartilhar evento usando Web Share API (se disponível)
  async shareEvent(counterData) {
    try {
      if (!this.canShareCalendar()) {
        throw new Error('Compartilhamento não suportado neste navegador');
      }
      
      const { title, eventDate, description } = counterData;
      
      // Validar se a data existe e é válida
      if (!eventDate) {
        throw new Error('Data do evento não encontrada');
      }
      
      const eventDateObj = new Date(eventDate);
      
      // Verificar se a data é válida
      if (isNaN(eventDateObj.getTime())) {
        throw new Error('Data do evento inválida');
      }
      
      const formattedEventDate = eventDateObj.toLocaleDateString('pt-BR');
      
      await navigator.share({
        title: `Evento: ${title}`,
        text: `${description || title} - Data: ${formattedEventDate}`,
        url: window.location.href
      });
      
      return {
        success: true,
        message: 'Evento compartilhado com sucesso!'
      };
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      throw error;
    }
  }
};