import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// Util simples para formatação de números
const formatNumber = (n) => new Intl.NumberFormat('pt-BR').format(n);

// Util para formatação de datas
const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { 
  day: '2-digit', 
  month: '2-digit', 
  year: 'numeric' 
}).format(new Date(date));

// Util para calcular dias restantes
const getDaysUntil = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Componente de estatísticas rápidas
const QuickStats = ({ counters }) => {
  const now = new Date();
  
  const stats = useMemo(() => {
    let thisWeek = 0;
    let thisMonth = 0;
    let nextWeek = 0;
    let overdue = 0;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const nextWeekStart = new Date(weekEnd);
    nextWeekStart.setDate(weekEnd.getDate() + 1);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    
    counters.forEach(counter => {
      const eventDate = new Date(counter.eventDate);
      
      if (eventDate >= weekStart && eventDate <= weekEnd) thisWeek++;
      if (eventDate >= monthStart && eventDate <= monthEnd) thisMonth++;
      if (eventDate >= nextWeekStart && eventDate <= nextWeekEnd) nextWeek++;
      if (eventDate < now) overdue++;
    });
    
    return { thisWeek, thisMonth, nextWeek, overdue };
  }, [counters, now]);
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Esta Semana</p>
            <p className="text-2xl font-bold text-blue-900">{stats.thisWeek}</p>
          </div>
          <div className="p-2 bg-blue-200 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Este Mês</p>
            <p className="text-2xl font-bold text-green-900">{stats.thisMonth}</p>
          </div>
          <div className="p-2 bg-green-200 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-700">Próxima Semana</p>
            <p className="text-2xl font-bold text-purple-900">{stats.nextWeek}</p>
          </div>
          <div className="p-2 bg-purple-200 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700">Vencidos</p>
            <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
          </div>
          <div className="p-2 bg-red-200 rounded-lg">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de próximos eventos
const UpcomingEvents = ({ counters }) => {
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return counters
      .filter(counter => new Date(counter.eventDate) >= now)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, 5);
  }, [counters]);
  
  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Próximos Eventos
        </h3>
        <p className="text-gray-500 text-center py-8">Nenhum evento futuro encontrado</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Próximos Eventos
      </h3>
      <div className="space-y-3">
        {upcomingEvents.map((counter, index) => {
          const daysUntil = getDaysUntil(counter.eventDate);
          const isUrgent = daysUntil <= 7;
          
          return (
            <div key={counter._id} className={`p-4 rounded-lg border-l-4 ${
              isUrgent ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{counter.name}</h4>
                  <p className="text-sm text-gray-600">{formatDate(counter.eventDate)}</p>
                  {counter.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full mt-1">
                      {counter.category}
                    </span>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className={`text-lg font-bold ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
                    {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `${daysUntil} dias`}
                  </p>
                  {isUrgent && (
                    <span className="text-xs text-red-500 font-medium">Urgente</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// Gráfico de barras em SVG (horizontal) para categorias - Versão melhorada
const CategoryBarChart = ({ data }) => {
  const entries = useMemo(() => Object.entries(data || {}).sort((a, b) => b[1] - a[1]), [data]);
  const max = entries.reduce((m, [, v]) => Math.max(m, v), 0);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Sem dados para exibir</p>
        </div>
      </div>
    );
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e'];

  return (
    <div className="space-y-4">
      {entries.map(([label, value], i) => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        const color = colors[i % colors.length];
        
        return (
          <div key={label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{formatNumber(value)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${percentage}%`, 
                  backgroundColor: color,
                  boxShadow: `0 0 0 1px ${color}20`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Gráfico de pizza melhorado e responsivo
const CategoryPieChart = ({ data }) => {
  const entries = useMemo(() => Object.entries(data || {}).sort((a, b) => b[1] - a[1]), [data]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p>Sem dados para exibir</p>
        </div>
      </div>
    );
  }

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 110;
  const innerR = 60;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e'];

  const toXY = (r, angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  const arcPath = (startAngle, endAngle) => {
    const [x0, y0] = toXY(outerR, startAngle);
    const [x1, y1] = toXY(outerR, endAngle);
    const [xi, yi] = toXY(innerR, endAngle);
    const [xj, yj] = toXY(innerR, startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x1} ${y1} L ${xi} ${yi} A ${innerR} ${innerR} 0 ${largeArc} 0 ${xj} ${yj} Z`;
  };

  let angle = -Math.PI / 2;
  const segments = entries.map(([label, value], idx) => {
    const frac = value / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    return { label, value, start, end, color: colors[idx % colors.length], frac };
  });

  return (
    <div className="flex justify-center">
      <div className="relative">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-64 h-64 drop-shadow-sm">
          {segments.map((s, idx) => (
            <g key={s.label}>
              <path 
                d={arcPath(s.start, s.end)} 
                fill={s.color} 
                className="hover:opacity-80 transition-opacity cursor-pointer"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
              >
                <title>{s.label}: {(s.frac * 100).toFixed(1)}% ({formatNumber(s.value)} {s.value === 1 ? 'item' : 'itens'})</title>
              </path>
            </g>
          ))}
          <circle cx={cx} cy={cy} r={innerR-1} fill="white" />
          
          {/* Texto central com total */}
          <text x={cx} y={cy-8} textAnchor="middle" className="text-sm fill-gray-600 font-medium">
            Total
          </text>
          <text x={cx} y={cy+8} textAnchor="middle" className="text-xl fill-gray-900 font-bold">
            {formatNumber(total)}
          </text>
        </svg>
      </div>
    </div>
  );
};

const Summary = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/counters');
        setCounters(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Falha ao carregar contadores');
        showToast('Erro ao carregar contadores', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCounters();
  }, [showToast]);

  const totals = useMemo(() => {
    const now = new Date();
    const totalItems = counters.length;
    const totalByCategory = counters.reduce((acc, c) => {
      const cat = c.category || 'Geral';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    let totalPast = 0;
    let totalFuture = 0;
    let totalRecurring = 0;

    for (const c of counters) {
      const date = new Date(c.eventDate);
      if (!isNaN(date)) {
        if (date < now) totalPast += 1; else totalFuture += 1;
      }
      if ((c.recurrence || 'none') !== 'none') totalRecurring += 1;
    }

    return { totalItems, totalByCategory, totalPast, totalFuture, totalRecurring };
  }, [counters]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Você precisa estar logado para ver o resumo.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando resumo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header moderno */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600">
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                </svg>
                Resumo Geral
              </h1>
              <p className="text-gray-600 text-lg">
                Visão completa dos seus contadores e eventos
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <QuickStats counters={counters} />

        {/* Cards de totais principais - Layout melhorado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total de Itens</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(totals.totalItems)}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <svg className="w-6 h-6 text-slate-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Eventos Passados</p>
                <p className="text-3xl font-bold text-red-600">{formatNumber(totals.totalPast)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <svg className="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Eventos Futuros</p>
                <p className="text-3xl font-bold text-blue-600">{formatNumber(totals.totalFuture)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M8 3v4" />
                  <path d="M16 3v4" />
                  <path d="M3 9h18" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Recorrentes</p>
                <p className="text-3xl font-bold text-indigo-600">{formatNumber(totals.totalRecurring)}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <svg className="w-6 h-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10a8 8 0 0 1 13-3" />
                  <path d="M17 7V3h4" />
                  <path d="M20 14a8 8 0 0 1-13 3" />
                  <path d="M7 17v4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Layout responsivo para próximos eventos e gráficos */}
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
           {/* Próximos eventos - ocupa 1 coluna */}
           <div className="xl:col-span-1">
             <UpcomingEvents counters={counters} />
           </div>
           
           {/* Gráficos - ocupam 2 colunas */}
           <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
                 Distribuição por Categoria
               </h3>
               <CategoryBarChart data={totals.totalByCategory} />
             </div>

             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                 </svg>
                 Proporção por Categoria
               </h3>
               <CategoryPieChart data={totals.totalByCategory} />
             </div>
           </div>
         </div>

         {/* Seção de Insights e Tendências */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           {/* Insights Inteligentes */}
           <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
               </svg>
               Insights Inteligentes
             </h3>
             <div className="space-y-4">
               {(() => {
                 const insights = [];
                 
                 // Insight sobre categoria mais popular
                 const mostPopularCategory = Object.entries(totals.totalByCategory)
                   .sort(([,a], [,b]) => b - a)[0];
                 if (mostPopularCategory) {
                   insights.push({
                     icon: "📊",
                     text: `Sua categoria mais ativa é "${mostPopularCategory[0]}" com ${mostPopularCategory[1]} eventos`,
                     color: "text-blue-700"
                   });
                 }

                 // Insight sobre eventos futuros vs passados
                 const futureVsPast = totals.totalFuture / (totals.totalPast || 1);
                 if (futureVsPast > 1.5) {
                   insights.push({
                     icon: "🚀",
                     text: "Você tem muitos eventos planejados! Ótimo planejamento para o futuro.",
                     color: "text-green-700"
                   });
                 } else if (futureVsPast < 0.5) {
                   insights.push({
                     icon: "⏰",
                     text: "Considere planejar mais eventos futuros para manter-se organizado.",
                     color: "text-amber-700"
                   });
                 }

                 // Insight sobre recorrência
                 const recurrenceRate = (totals.totalRecurring / totals.totalItems) * 100;
                 if (recurrenceRate > 30) {
                   insights.push({
                     icon: "🔄",
                     text: `${recurrenceRate.toFixed(0)}% dos seus eventos são recorrentes - você tem bons hábitos!`,
                     color: "text-indigo-700"
                   });
                 }

                 // Insight sobre próximos eventos
                 const upcomingThisWeek = counters.filter(counter => {
                   const eventDate = new Date(counter.eventDate);
                   const today = new Date();
                   const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                   return eventDate >= today && eventDate <= weekFromNow;
                 }).length;

                 if (upcomingThisWeek > 0) {
                   insights.push({
                     icon: "📅",
                     text: `Você tem ${upcomingThisWeek} evento(s) chegando esta semana. Prepare-se!`,
                     color: "text-red-700"
                   });
                 }

                 return insights.slice(0, 3).map((insight, index) => (
                   <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                     <span className="text-xl">{insight.icon}</span>
                     <p className={`text-sm ${insight.color} font-medium`}>
                       {insight.text}
                     </p>
                   </div>
                 ));
               })()}
               
               {Object.keys(totals.totalByCategory).length === 0 && (
                 <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                   <span className="text-xl">💡</span>
                   <p className="text-sm text-gray-600">
                     Comece criando seus primeiros contadores para ver insights personalizados aqui!
                   </p>
                 </div>
               )}
             </div>
           </div>

           {/* Resumo Temporal */}
           <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Resumo Temporal
             </h3>
             <div className="space-y-4">
               {(() => {
                 const today = new Date();
                 const thisMonth = counters.filter(counter => {
                   const eventDate = new Date(counter.eventDate);
                   return eventDate.getMonth() === today.getMonth() && 
                          eventDate.getFullYear() === today.getFullYear();
                 }).length;

                 const nextMonth = counters.filter(counter => {
                   const eventDate = new Date(counter.eventDate);
                   const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                   return eventDate.getMonth() === nextMonthDate.getMonth() && 
                          eventDate.getFullYear() === nextMonthDate.getFullYear();
                 }).length;

                 const thisYear = counters.filter(counter => {
                   const eventDate = new Date(counter.eventDate);
                   return eventDate.getFullYear() === today.getFullYear();
                 }).length;

                 return (
                   <>
                     <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                       <span className="text-sm font-medium text-gray-700">Este mês</span>
                       <span className="text-lg font-bold text-green-700">{thisMonth}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                       <span className="text-sm font-medium text-gray-700">Próximo mês</span>
                       <span className="text-lg font-bold text-blue-700">{nextMonth}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                       <span className="text-sm font-medium text-gray-700">Este ano</span>
                       <span className="text-lg font-bold text-indigo-700">{thisYear}</span>
                     </div>
                   </>
                 );
               })()}
             </div>
           </div>
         </div>

         {/* Ações Rápidas */}
         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
             <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
             Ações Rápidas
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <button 
               onClick={() => window.location.href = '/dashboard'}
               className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors group"
             >
               <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                 </svg>
               </div>
               <div className="text-left">
                 <p className="font-medium text-gray-900">Novo Contador</p>
                 <p className="text-xs text-gray-600">Criar evento</p>
               </div>
             </button>

             <button 
               onClick={() => navigate('/relatorios')}
               className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors group"
             >
               <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
               </div>
               <div className="text-left">
                 <p className="font-medium text-gray-900">Relatórios</p>
                 <p className="text-xs text-gray-600">Ver dados</p>
               </div>
             </button>             
           </div>
         </div>
       </div>
     </div>
   );
};

export default Summary;