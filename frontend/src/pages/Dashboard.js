import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CounterCard from '../components/CounterCard';
import CounterForm from '../components/CounterForm';

const Dashboard = () => {
  const { user } = useAuth();

  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  

  // Buscar contadores
  const fetchCounters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters`);
      setCounters(response.data);
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(response.data.map(counter => counter.category))];
      setCategories(uniqueCategories);
      
      setError('');
    } catch (err) {
      setError('Erro ao carregar contadores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Aguarda o usuário estar disponível (login concluído)
    if (!user) return;
    
    fetchCounters();
    
    // Atualizar contadores a cada minuto
    const interval = setInterval(() => {
      fetchCounters();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Adicionar novo contador
  const handleAddCounter = async (counterData) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters`, counterData);
      fetchCounters();
      setShowForm(false);
    } catch (err) {
      setError('Erro ao adicionar contador');
      console.error(err);
    }
  };

  // Excluir contador
  const handleDeleteCounter = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters/${id}`);
      fetchCounters();
    } catch (err) {
      setError('Erro ao excluir contador');
      console.error(err);
    }
  };

  // Alternar favorito
  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      const counter = counters.find(c => c._id === id);
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/counters/${id}`, {
        ...counter,
        isFavorite: !isFavorite
      });
      fetchCounters();
    } catch (err) {
      setError('Erro ao atualizar contador');
      console.error(err);
    }
  };

  // Filtrar contadores
  const filteredCounters = counters.filter(counter => {
    const matchesSearch = counter.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? counter.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Meus Contadores</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-lg shadow transition-all duration-300"
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
      ) : filteredCounters.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-gray-500">Nenhum contador encontrado.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow transition-all duration-300"
          >
            Criar seu primeiro contador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCounters.map(counter => (
            <CounterCard
              key={counter._id}
              counter={counter}
              onDelete={handleDeleteCounter}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;