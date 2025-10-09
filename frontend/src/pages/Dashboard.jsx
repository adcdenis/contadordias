import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CounterCard from '../components/CounterCard';
import CounterForm from '../components/CounterForm';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      return localStorage.getItem('dashboardSelectedCategory') || '';
    } catch {
      return '';
    }
  });
  const [categories, setCategories] = useState([]);
  

  // Buscar contadores (sem alterar loading para evitar "refresh" visual em polling)
  const fetchCounters = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/counters`);
      setCounters(response.data);
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(response.data.map(counter => counter.category))];
      setCategories(uniqueCategories);
      
      setError('');
    } catch (err) {
      setError('Erro ao carregar contadores');
      console.error(err);
    }
  };

  useEffect(() => {
    // Aguarda o usuário estar disponível (login concluído)
    if (!user) return;
    let cancelled = false;

    // Carregamento inicial com indicador visual
    const loadInitial = async () => {
      setLoading(true);
      await fetchCounters();
      if (!cancelled) setLoading(false);
    };
    loadInitial();
    
    // Atualizar contadores a cada minuto (sem alterar loading)
    const interval = setInterval(() => {
      fetchCounters();
    }, 60000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  // Persistir categoria selecionada ao alterar
  useEffect(() => {
    try {
      localStorage.setItem('dashboardSelectedCategory', selectedCategory);
    } catch {}
  }, [selectedCategory]);

  // Sincronizar categoria salva após carregar categorias e limpar se não existir
  useEffect(() => {
    if (categories.length === 0) return;
    try {
      const saved = localStorage.getItem('dashboardSelectedCategory') || '';
      if (saved && categories.includes(saved)) {
        setSelectedCategory(saved);
        return;
      }
    } catch {}
    if (selectedCategory && !categories.includes(selectedCategory)) {
      setSelectedCategory('');
    }
  }, [categories]);

  // Adicionar novo contador
  const handleAddCounter = async (counterData) => {
    try {
    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/counters`, counterData);
      fetchCounters();
      setShowForm(false);
      showToast('Contador criado com sucesso');
    } catch (err) {
      setError('Erro ao adicionar contador');
      console.error(err);
    }
  };

  // Excluir contador
  const handleDeleteCounter = async (id) => {
    try {
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/counters/${id}`);
      fetchCounters();
      showToast('Contador excluído com sucesso');
    } catch (err) {
      setError('Erro ao excluir contador');
      console.error(err);
    }
  };


  // Filtrar contadores
  const filteredCounters = counters.filter(counter => {
    const matchesSearch = counter.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? counter.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Ordenar por nome do contador (ordem alfabética)
  const sortedCounters = [...filteredCounters].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-md shadow">
        <h1 className="text-2xl font-bold text-white">Meus Contadores</h1>
        <button
          onClick={() => setShowForm(true)}
          aria-label="Novo Contador"
          className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-1 px-2 sm:py-1.5 sm:px-3 rounded-md shadow-sm transition-all duration-300 inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Novo Contador</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 flex items-center">
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="form-input w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              aria-label="Limpar busca"
              title="Limpar busca"
              onClick={() => setSearchTerm('')}
              className="ml-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <div className="w-full md:w-1/4">
          <select
            className="form-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Novo Contador</h2>
            <p className="text-gray-600 mb-3 text-sm">Digite ou escolha uma categoria. Você pode criar uma nova se não existir.</p>
            <CounterForm 
              onSubmit={handleAddCounter} 
              onCancel={() => setShowForm(false)} 
              categories={categories}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando contadores...</p>
        </div>
      ) : sortedCounters.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-md shadow-sm">
          <p className="text-gray-500">Nenhum contador encontrado.</p>
          <button
            onClick={() => setShowForm(true)}
            aria-label="Criar contador"
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 sm:py-1.5 sm:px-3 rounded-md shadow-sm transition-all duration-300 inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z" clipRule="evenodd" />
            </svg>
            <span className="sm:hidden">Criar</span>
            <span className="hidden sm:inline">Criar seu primeiro contador</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCounters.map(counter => (
            <CounterCard
              key={counter._id}
              counter={counter}
              onDelete={handleDeleteCounter}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;