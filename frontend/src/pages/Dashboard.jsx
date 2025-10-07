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
  const [selectedCategory, setSelectedCategory] = useState('');
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
          className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-1.5 px-3 rounded-md shadow-sm transition-all duration-300"
        >
          Novo Contador
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-md shadow-sm transition-all duration-300"
          >
            Criar seu primeiro contador
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