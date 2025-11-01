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
        const base = import.meta.env.VITE_API_URL || '/api';
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600">
            <rect x="4.5" y="16" width="3" height="3" rx="0" />
            <rect x="10.5" y="6" width="3" height="11" rx="0" />
            <rect x="16" y="12" width="3" height="5" rx="0" />
          </svg>
          Relatórios
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">Gere relatórios detalhados dos seus contadores</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r mb-6 shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-0">Filtros</h2>
          <button
            type="button"
            onClick={clearFilters}
            className="btn inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium w-full sm:w-auto"
            aria-label="Limpar filtros"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 5a1 1 0 011-1h16a1 1 0 01.78 1.63L15 12v5a1 1 0 01-.55.9l-3 1.5A1 1 0 0110 18v-6L3.22 5.63A1 1 0 013 5z" />
              <path d="M17 6l4 4M21 6l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Limpar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="form-label text-sm font-medium text-gray-700" htmlFor="startDate">Data início</label>
            <input 
              id="startDate" 
              type="date" 
              className="form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="form-label text-sm font-medium text-gray-700" htmlFor="endDate">Data fim</label>
            <input 
              id="endDate" 
              type="date" 
              className="form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="form-label text-sm font-medium text-gray-700" htmlFor="type">Tipo</label>
            <select 
              id="type" 
              className="form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
              value={type} 
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="past">Passado</option>
              <option value="future">Futuro</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="form-label text-sm font-medium text-gray-700" htmlFor="recurrence">Tipo de repetição</label>
            <select 
              id="recurrence" 
              className="form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
              value={recurrence} 
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="none">Nenhuma</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="form-label text-sm font-medium text-gray-700" htmlFor="category">Categoria</label>
            <select 
              id="category" 
              className="form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="form-label text-sm font-medium text-gray-700" htmlFor="description">Descrição</label>
            <input 
              id="description" 
              type="text" 
              className="form-input w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Filtrar por texto na descrição" 
            />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                onClick={() => setNowEpoch(Date.now())}
                className="btn inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 1112.9 5.3" />
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H15m0 0l2 2m-2-2l2-2" />
                </svg>
                <span className="hidden sm:inline">Recalcular tempo</span>
                <span className="sm:hidden">Recalcular</span>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExportExcel}
                  disabled={rows.length === 0}
                  className={`btn btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${rows.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                    <rect x="3" y="3" width="14" height="14" rx="2" strokeWidth="2" />
                    <path d="M7 7h6M7 11h6M7 15h6" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19 10v8m0 0l-2-2m2 2l2-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden sm:inline">Gerar Excel</span>
                  <span className="sm:hidden">Excel</span>
                </button>
                
                <button
                  onClick={handleExportPDF}
                  disabled={rows.length === 0}
                  className={`btn btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${rows.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                    <path d="M7 3h7l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M14 3v6h6" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M12 12v6m0 0l-2-2m2 2l2-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden sm:inline">Gerar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center sm:justify-end">
              <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                Atualizado às {format(new Date(nowEpoch), 'HH:mm')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Preview dos Dados</h3>
          <p className="text-sm text-gray-600 mt-1">
            {loading ? 'Carregando...' : `${filtered.length} contador(es) encontrado(s)`}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-gray-500">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Carregando contadores...</span>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-center">
                Nenhum resultado para os filtros selecionados.
              </p>
              <p className="text-gray-400 text-sm text-center mt-2">
                Tente ajustar os filtros ou limpar todos os filtros.
              </p>
            </div>
          ) : (
            <div className="min-w-full">
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-200">
                  {filtered.map((c) => {
                    const d = new Date(c.eventDate);
                    const dt = format(d, 'dd/MM/yyyy', { locale: pt });
                    const hr = format(d, 'HH:mm');
                    const det = calculateDetailedTime(d, new Date(nowEpoch));
                    const rec = c.recurrence === 'weekly' ? 'Semanal' : c.recurrence === 'monthly' ? 'Mensal' : c.recurrence === 'yearly' ? 'Anual' : 'Nenhuma';
                    return (
                      <div key={c._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-base">{c.name}</h4>
                            {c.category && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                                {c.category}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 block">Data</span>
                              <span className="font-medium">{dt}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Hora</span>
                              <span className="font-medium">{hr}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500 block">Tempo</span>
                              <span className="font-medium text-blue-600">{det.formattedDistance}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Repetição</span>
                              <span className="font-medium">{rec}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((c) => {
                      const d = new Date(c.eventDate);
                      const dt = format(d, 'dd/MM/yyyy', { locale: pt });
                      const hr = format(d, 'HH:mm');
                      const det = calculateDetailedTime(d, new Date(nowEpoch));
                      const rec = c.recurrence === 'weekly' ? 'Semanal' : c.recurrence === 'monthly' ? 'Mensal' : c.recurrence === 'yearly' ? 'Anual' : 'Nenhuma';
                      return (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{c.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hr}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-blue-600">{det.formattedDistance}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {c.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {c.category}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;