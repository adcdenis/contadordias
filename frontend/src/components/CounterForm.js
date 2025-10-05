import React, { useState } from 'react';

const CounterForm = ({ counter, onSubmit, onCancel }) => {
  const [name, setName] = useState(counter?.name || '');
  const [description, setDescription] = useState(counter?.description || '');
  const [eventDate, setEventDate] = useState(
    counter?.eventDate 
      ? new Date(counter.eventDate).toISOString().split('T')[0]
      : ''
  );
  const [eventTime, setEventTime] = useState(
    counter?.eventDate 
      ? new Date(counter.eventDate).toISOString().split('T')[1].substring(0, 5)
      : '00:00'
  );
  const [category, setCategory] = useState(counter?.category || 'Pessoal');
  const [tags, setTags] = useState(counter?.tags?.join(', ') || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !eventDate) {
      setError('Nome e data do evento são obrigatórios');
      return;
    }
    
    const formattedTags = tags
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
    
    // Combinar data e hora
    const combinedDateTime = new Date(`${eventDate}T${eventTime}`);
    
    onSubmit({
      name,
      description,
      eventDate: combinedDateTime,
      category,
      tags: formattedTags,
      isFavorite: counter?.isFavorite || false
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
          required
        />
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
        />
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
        <select
          id="category"
          className="form-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Pessoal">Pessoal</option>
          <option value="Trabalho">Trabalho</option>
          <option value="Estudo">Estudo</option>
          <option value="Feriado">Feriado</option>
          <option value="Aniversário">Aniversário</option>
          <option value="Outro">Outro</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="form-label" htmlFor="tags">
          Tags (separadas por vírgula)
        </label>
        <input
          id="tags"
          type="text"
          className="form-input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ex: importante, trabalho, urgente"
        />
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