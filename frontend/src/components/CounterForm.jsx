import React, { useState } from 'react';

const CounterForm = ({ counter, onSubmit, onCancel, categories = [] }) => {
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
      isFavorite: counter?.isFavorite || false,
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
      
      
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="btn btn-danger"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {counter ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default CounterForm;