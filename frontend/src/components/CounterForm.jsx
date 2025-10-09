import React, { useState } from 'react';

const CounterForm = ({ counter, onSubmit, onCancel, onDelete, categories = [] }) => {
  const [name, setName] = useState(counter?.name || '');
  const [description, setDescription] = useState(counter?.description || '');
  // Inicializar data/hora em horário local (evitar deslocamento por UTC)
  const [eventDate, setEventDate] = useState(() => {
    if (!counter?.eventDate) return '';
    const d = new Date(counter.eventDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [eventTime, setEventTime] = useState(() => {
    if (!counter?.eventDate) return '00:00';
    const d = new Date(counter.eventDate);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [category, setCategory] = useState(counter?.category || 'Pessoal');
  const [recurrence, setRecurrence] = useState(counter?.recurrence || 'none');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !eventDate) {
      setError('Nome e data do evento são obrigatórios');
      return;
    }

    // Limites de caracteres
    if (name.length > 200) {
      setError('Nome deve ter no máximo 200 caracteres');
      return;
    }
    if (description.length > 1000) {
      setError('Descrição deve ter no máximo 1000 caracteres');
      return;
    }
    if (category.length > 100) {
      setError('Categoria deve ter no máximo 100 caracteres');
      return;
    }
    
    // Combinar data e hora em horário LOCAL para evitar UTC shift
    const [y, m, d] = eventDate.split('-').map(Number);
    const [hh, mm] = eventTime.split(':').map(Number);
    const combinedDateTime = new Date(y, m - 1, d, hh, mm);
    
    onSubmit({
      name,
      description,
      eventDate: combinedDateTime,
      category,
      recurrence
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="form-label" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          required
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{name.length}/200</p>
      </div>
      
      <div className="mb-4">
        <label className="form-label" htmlFor="description">
          Descrição
        </label>
        <textarea
          id="description"
          className="form-input"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{description.length}/1000</p>
      </div>
      
      <div className="mb-4">
        <label className="form-label" htmlFor="eventDate">
          Data do Evento
        </label>
        <div className="flex space-x-2">
          <input
            id="eventDate"
            type="date"
            className="form-input w-2/3"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <input
            id="eventTime"
            type="time"
            className="form-input w-1/3"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="form-label" htmlFor="category">
          Categoria
        </label>
        <input
          id="category"
          type="text"
          className="form-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="category-options"
          placeholder="Digite ou escolha uma categoria"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{category.length}/100</p>
        <datalist id="category-options">
          {Array.isArray(categories) && categories.map((c, idx) => (
            <option key={idx} value={c} />
          ))}
        </datalist>
      </div>

      <div className="mb-4">
        <label className="form-label" htmlFor="recurrence">
          Recorrência
        </label>
        <select
          id="recurrence"
          className="form-input"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
        >
          <option value="none">Nenhuma</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
        </select>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
        <div className="order-2 sm:order-1 w-full sm:w-auto">
          {onDelete && (
            <button
              type="button"
              className="btn btn-danger inline-flex items-center gap-2 w-full sm:w-auto"
              onClick={onDelete}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M9 3.75A.75.75 0 019.75 3h4.5a.75.75 0 01.75.75V5.25H18a.75.75 0 010 1.5h-.592l-.563 12.33A2.25 2.25 0 0114.6 21H9.4a2.25 2.25 0 01-2.245-1.92L6.592 6.75H6a.75.75 0 010-1.5h2.25V3.75zM8.095 6.75l.522 11.423a.75.75 0 00.748.677h5.27a.75.75 0 00.747-.677L16.905 6.75H8.095z" />
              </svg>
              Excluir
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto order-1 sm:order-2 justify-end">
          <button
            type="button"
            className="btn btn-danger inline-flex items-center gap-2 w-full sm:w-auto"
            onClick={onCancel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM9.53 8.47a.75.75 0 10-1.06 1.06L10.44 12l-1.97 1.97a.75.75 0 101.06 1.06L11.5 13.06l1.97 1.97a.75.75 0 101.06-1.06L12.56 12l1.97-1.97a.75.75 0 10-1.06-1.06L11.5 10.94 9.53 8.97z" clipRule="evenodd" />
            </svg>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary inline-flex items-center gap-2 w-full sm:w-auto"
          >
            {counter ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z" clipRule="evenodd" />
              </svg>
            )}
            {counter ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CounterForm;