import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// Util simples para formatação de números
const formatNumber = (n) => new Intl.NumberFormat('pt-BR').format(n);

// Gráfico de barras em SVG (horizontal) para categorias
const CategoryBarChart = ({ data }) => {
  const entries = useMemo(() => Object.entries(data || {}).sort((a, b) => a[1] - b[1]), [data]);
  const max = entries.reduce((m, [, v]) => Math.max(m, v), 0);

  // Dimensões do gráfico
  const barHeight = 34;
  const gap = 10;
  const leftLabelWidth = 160;
  const rightValueWidth = 80;
  const chartWidth = 500; // área útil para barras
  const width = leftLabelWidth + chartWidth + rightValueWidth;
  const height = entries.length * (barHeight + gap);

  if (entries.length === 0) {
    return (
      <div className="text-gray-500">Sem categorias</div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {entries.map(([label, value], i) => {
        const y = i * (barHeight + gap);
        const w = max > 0 ? (value / max) * chartWidth : 0;
        return (
          <g key={label} transform={`translate(0, ${y})`}>
            {/* label */}
            <text x={4} y={barHeight / 2} dominantBaseline="middle" className="text-lg fill-gray-700">
              {label}
            </text>
            {/* barra */}
            <rect x={leftLabelWidth} y={4} width={Math.max(4, w)} height={barHeight - 8} rx={6} className="fill-blue-500" />
            {/* valor */}
            <text x={leftLabelWidth + chartWidth + 6} y={barHeight / 2} dominantBaseline="middle" className="text-lg fill-gray-700">
              {formatNumber(value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Gráfico de pizza (SVG) por categoria
const CategoryPieChart = ({ data }) => {
  const entries = useMemo(() => Object.entries(data || {}).sort((a, b) => a[1] - b[1]), [data]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total === 0) {
    return <div className="text-gray-500">Sem categorias</div>;
  }

  const size = 280; // tamanho do SVG
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 120;
  const innerR = 70; // donut
  const palette = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f43f5e','#a3a3a3','#0ea5e9'];

  const toXY = (r, angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  const arcPath = (startAngle, endAngle) => {
    const [x0, y0] = toXY(outerR, startAngle);
    const [x1, y1] = toXY(outerR, endAngle);
    const [xi, yi] = toXY(innerR, endAngle);
    const [xj, yj] = toXY(innerR, startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x1} ${y1} L ${xi} ${yi} A ${innerR} ${innerR} 0 ${largeArc} 0 ${xj} ${yj} Z`;
  };

  let angle = -Math.PI / 2; // começar no topo
  const segments = entries.map(([label, value], idx) => {
    const frac = value / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    return { label, value, start, end, color: palette[idx % palette.length], frac };
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-64 h-64">
        {segments.map((s) => (
          <path key={s.label} d={arcPath(s.start, s.end)} fill={s.color} opacity={0.9} />
        ))}
        {/* círculo interno para suavizar centro */}
        <circle cx={cx} cy={cy} r={innerR-1} fill="white" />
      </svg>
      <div className="text-lg">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 py-0.5">
            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: s.color }}></span>
            <span className="text-gray-700">{s.label}</span>
            <span className="ml-auto font-medium">{formatNumber(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Summary = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

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
    <div>
      <h1 className="text-2xl font-bold mb-4">Resumo</h1>

      {/* Cards de totais principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
          <div className="pl-4 border-l-4 border-slate-400 space-y-1.5">
            <p className="text-lg text-gray-700">Total de itens</p>
            <p className="text-lg font-semibold text-gray-900">{formatNumber(totals.totalItems)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
          <div className="pl-4 border-l-4 border-red-500 space-y-1.5">
            <p className="text-lg text-gray-700">Total passado</p>
            <p className="text-lg font-semibold text-gray-900">{formatNumber(totals.totalPast)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
          <div className="pl-4 border-l-4 border-blue-500 space-y-1.5">
            <p className="text-lg text-gray-700">Total futuro</p>
            <p className="text-lg font-semibold text-gray-900">{formatNumber(totals.totalFuture)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow p-6 sm:col-span-2 lg:col-span-1">
          <div className="pl-4 border-l-4 border-indigo-500 space-y-1.5">
            <p className="text-lg text-gray-700">Total recorrente</p>
            <p className="text-lg font-semibold text-gray-900">{formatNumber(totals.totalRecurring)}</p>
          </div>
        </div>
      </div>

      {/* Gráficos por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-3">Por categoria (barras)</h2>
          <CategoryBarChart data={totals.totalByCategory} />
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-3">Por categoria (pizza)</h2>
          <CategoryPieChart data={totals.totalByCategory} />
        </div>
      </div>
    </div>
  );
};

export default Summary;