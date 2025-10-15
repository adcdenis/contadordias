import React, { useMemo, useState } from 'react';

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
  const [categoryInput, setCategoryInput] = useState(counter?.category || 'Pessoal');
  const [catOpen, setCatOpen] = useState(false);
  const [recurrence, setRecurrence] = useState(counter?.recurrence || 'none');
  const [error, setError] = useState('');

  const normalizeCategory = (value) => value.trim().replace(/\s+/g, ' ');

  const filteredCategories = useMemo(() => {
    const q = categoryInput.trim().toLowerCase();
    const unique = Array.isArray(categories) ? [...new Set(categories.filter(Boolean))] : [];
    if (!q) return unique;
    return unique.filter((c) => c.toLowerCase().includes(q));
  }, [categories, categoryInput]);

  const selectCategory = (c) => {
    setCategory(c);
    setCategoryInput(c);
    setCatOpen(false);
  };

  const createCategoryFromInput = () => {
    const normalized = normalizeCategory(categoryInput || '');
    setCategory(normalized);
    setCategoryInput(normalized);
    setCatOpen(false);
  };

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
    const finalCategory = normalizeCategory(categoryInput || category || '');
    if (finalCategory.length > 100) {
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
      category: finalCategory,
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
        <div className="relative">
          <input
            id="category"
            type="text"
            className="form-input pr-20"
            value={categoryInput}
            onChange={(e) => { setCategoryInput(e.target.value); setCatOpen(true); }}
            onFocus={() => setCatOpen(true)}
            onBlur={() => setTimeout(() => setCatOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                createCategoryFromInput();
              } else if (e.key === 'Escape') {
                setCatOpen(false);
              }
            }}
            placeholder="Digite ou escolha uma categoria"
            maxLength={100}
            aria-expanded={catOpen}
            aria-haspopup="listbox"
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-2">
            {categoryInput && (
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 px-2 py-1"
                aria-label="Limpar categoria"
                onClick={() => { setCategoryInput(''); setCategory(''); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 px-2 py-1"
              onClick={() => setCatOpen((v) => !v)}
              aria-label="Alternar sugestões"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.5 9a.75.75 0 011.06 0L12 12.44l3.44-3.44a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4A.75.75 0 017.5 9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {catOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 max-h-48 overflow-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((c, idx) => (
                  <button
                    key={`${c}-${idx}`}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    onMouseDown={() => selectCategory(c)}
                  >
                    {c}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">Nenhuma sugestão</div>
              )}
              <div className="border-t border-gray-100" />
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50"
                onMouseDown={createCategoryFromInput}
              >
                Criar nova categoria: "{normalizeCategory(categoryInput || '')}"
              </button>
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.isArray(categories) && categories.slice(0, 8).map((c, idx) => (
            <button
              key={`chip-${c}-${idx}`}
              type="button"
              className={`px-2 py-1 rounded-md text-xs ${categoryInput === c ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => selectCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{(categoryInput || '').length}/100</p>
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
      
      <div className="flex flex-row justify-between items-center flex-wrap gap-2">
        <div className="w-auto">
          <button
            type="button"
            className="btn btn-danger inline-flex items-center gap-2 text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2"
            onClick={onCancel}
            aria-label="Cancelar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM9.53 8.47a.75.75 0 10-1.06 1.06L10.44 12l-1.97 1.97a.75.75 0 101.06 1.06L11.5 13.06l1.97 1.97a.75.75 0 101.06-1.06L12.56 12l1.97-1.97a.75.75 0 10-1.06-1.06L11.5 10.94 9.53 8.97z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Cancelar</span>
          </button>
          
        </div>
        <div className="flex gap-2 w-auto justify-end">          
          <button
            type="submit"
            className="btn btn-primary inline-flex items-center gap-2 text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2"
            aria-label={counter ? 'Gravar' : 'Criar'}
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
            <span className="hidden sm:inline">{counter ? 'Gravar' : 'Criar'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default CounterForm;