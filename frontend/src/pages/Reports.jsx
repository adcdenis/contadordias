import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { calculateDetailedTime } from '../utils/timeUtils';

// As exportações usarão xlsx e jsPDF (instaladas via npm)
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('all'); // all | past | future
  const [recurrence, setRecurrence] = useState('all'); // all | weekly | monthly | yearly | none
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState([]);
  const [nowEpoch, setNowEpoch] = useState(Date.now());

  // Auto-recalcular a cada 30 segundos
  useEffect(() => {
    const id = setInterval(() => setNowEpoch(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setType('all');
    setRecurrence('all');
    setCategory('');
    setDescription('');
  };

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${base}/counters`);
        setCounters(response.data || []);
        const uniqueCategories = [...new Set((response.data || []).map((c) => c.category).filter(Boolean))];
        setCategories(uniqueCategories);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar contadores');
      } finally {
        setLoading(false);
      }
    };
    fetchCounters();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date(nowEpoch);
    return (counters || []).filter((c) => {
      const eventDate = new Date(c.eventDate);

      // Data início
      if (startDate) {
        const [y, m, d] = startDate.split('-').map(Number);
        const sd = new Date(y, m - 1, d, 0, 0, 0);
        if (eventDate < sd) return false;
      }

      // Data fim
      if (endDate) {
        const [y, m, d] = endDate.split('-').map(Number);
        const ed = new Date(y, m - 1, d, 23, 59, 59, 999);
        if (eventDate > ed) return false;
      }

      // Tipo passado/futuro
      if (type === 'past' && !(eventDate < now)) return false;
      if (type === 'future' && !(eventDate > now)) return false;

      // Recorrência
      if (recurrence !== 'all') {
        const r = c.recurrence || 'none';
        if (recurrence === 'none' && r !== 'none') return false;
        if (recurrence !== 'none' && r !== recurrence) return false;
      }

      // Categoria
      if (category && c.category !== category) return false;

      // Descrição (substring)
      if (description && !(c.description || '').toLowerCase().includes(description.toLowerCase())) return false;

      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  }, [counters, startDate, endDate, type, recurrence, category, description, nowEpoch]);

  const columns = [
    'Nome do contador',
    'Data (DD/MM/YYYY)',
    'Hora (HH:MM)',
    'Tempo decorrido ou restante',
    'Categoria',
    'Repetição',
  ];

  const rows = filtered.map((c) => {
    const d = new Date(c.eventDate);
    const formattedDate = format(d, 'dd/MM/yyyy', { locale: pt });
    const formattedTime = format(d, 'HH:mm');
    const details = calculateDetailedTime(d, new Date(nowEpoch));
    const tempo = `${details.formattedDistance}`;
    const recurrenceLabel = c.recurrence === 'weekly' ? 'Semanal' : c.recurrence === 'monthly' ? 'Mensal' : c.recurrence === 'yearly' ? 'Anual' : 'Nenhuma';
    return [c.name, formattedDate, formattedTime, tempo, c.category || '', recurrenceLabel];
  });

  const buildFileName = (ext) => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    return `Relatório de Contadores_${dd}-${mm}-${yyyy}_${hh}-${mi}.${ext}`;
  };

  const handleExportExcel = () => {
    try {
      const wsData = [columns, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
      XLSX.writeFile(wb, buildFileName('xlsx'));
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      doc.setFontSize(12);
      doc.text('Relatório de Contadores', 40, 40);
      autoTable(doc, {
        startY: 60,
        head: [columns],
        body: rows,
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [66, 133, 244] },
      });
      doc.save(buildFileName('pdf'));
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar PDF');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={clearFilters}
            className="btn inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded"
            aria-label="Limpar filtros"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 5a1 1 0 011-1h16a1 1 0 01.78 1.63L15 12v5a1 1 0 01-.55.9l-3 1.5A1 1 0 0110 18v-6L3.22 5.63A1 1 0 013 5z" />
              <path d="M17 6l4 4M21 6l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Limpar filtros
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="form-label" htmlFor="startDate">Data início</label>
            <input id="startDate" type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label" htmlFor="endDate">Data fim</label>
            <input id="endDate" type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label" htmlFor="type">Tipo</label>
            <select id="type" className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Todos</option>
              <option value="past">Passado</option>
              <option value="future">Futuro</option>
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="recurrence">Tipo de repetição</label>
            <select id="recurrence" className="form-input" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
              <option value="all">Todos</option>
              <option value="none">Nenhuma</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="category">Categoria</label>
            <select id="category" className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="description">Descrição</label>
            <input id="description" type="text" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Filtrar por texto na descrição" />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="mb-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <button
          onClick={() => setNowEpoch(Date.now())}
          className="btn inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 1112.9 5.3" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H15m0 0l2 2m-2-2l2-2" />
          </svg>
          Recalcular tempo
        </button>
        <button
          onClick={handleExportExcel}
          disabled={rows.length === 0}
          className={`btn btn-primary inline-flex items-center gap-2 ${rows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <rect x="3" y="3" width="14" height="14" rx="2" strokeWidth="2" />
            <path d="M7 7h6M7 11h6M7 15h6" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 10v8m0 0l-2-2m2 2l2-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Gerar Excel
        </button>
        <button
          onClick={handleExportPDF}
          disabled={rows.length === 0}
          className={`btn btn-primary inline-flex items-center gap-2 ${rows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
            <path d="M7 3h7l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" strokeWidth="2" strokeLinejoin="round" />
            <path d="M14 3v6h6" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 12v6m0 0l-2-2m2 2l2-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Gerar PDF
        </button>
        <span className="text-xs text-gray-500 sm:ml-2">Atualizado às {format(new Date(nowEpoch), 'HH:mm')}</span>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 overflow-x-auto">
        {loading ? (
          <p className="text-gray-500">Carregando contadores...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500">Nenhum resultado para os filtros selecionados.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 text-sm font-semibold text-gray-700 border-b">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const d = new Date(c.eventDate);
                const dt = format(d, 'dd/MM/yyyy', { locale: pt });
                const hr = format(d, 'HH:mm');
                const det = calculateDetailedTime(d, new Date(nowEpoch));
                const rec = c.recurrence === 'weekly' ? 'Semanal' : c.recurrence === 'monthly' ? 'Mensal' : c.recurrence === 'yearly' ? 'Anual' : 'Nenhuma';
                return (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border-b">{c.name}</td>
                    <td className="px-3 py-2 border-b">{dt}</td>
                    <td className="px-3 py-2 border-b">{hr}</td>
                    <td className="px-3 py-2 border-b">{det.formattedDistance}</td>
                    <td className="px-3 py-2 border-b">{c.category || ''}</td>
                    <td className="px-3 py-2 border-b">{rec}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;