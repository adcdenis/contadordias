import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState(null);

  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/users`);
        setUsers(response.data);
      } catch (err) {
        setError('Erro ao carregar usuários');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const openConfirmDelete = (user) => {
    if (user.role === 'admin') return;
    setConfirmDeleteUser(user);
  };

  const openConfirmRoleChange = (user) => {
    // proteção para não permitir alterar a própria função
    if (currentUser && user._id === currentUser._id) return;
    const targetRole = user.role === 'admin' ? 'user' : 'admin';
    setConfirmRoleChange({ user, targetRole });
  };

  const confirmDelete = async () => {
    if (!confirmDeleteUser) return;
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL || '/api'}/users/${confirmDeleteUser._id}`);
      setUsers(users.filter(u => u._id !== confirmDeleteUser._id));
      setConfirmDeleteUser(null);
      const removed = (res && res.data && typeof res.data.countersRemoved === 'number') ? res.data.countersRemoved : 0;
      showToast(`Usuário excluído com sucesso. Contadores removidos: ${removed}`);
    } catch (err) {
      setError('Erro ao excluir usuário');
      console.error(err);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteUser(null);
  };

  const cancelRoleChange = () => {
    setConfirmRoleChange(null);
  };

  const openEditPassword = (id) => {
    setEditingUserId(id);
    setNewPassword('');
    setError('');
  };

  const cancelEditPassword = () => {
    setEditingUserId(null);
    setNewPassword('');
  };

  const handleUpdatePassword = async (id) => {
    try {
      if (!newPassword || newPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      setSaving(true);
      await axios.put(`${import.meta.env.VITE_API_URL || '/api'}/users/${id}`, {
        password: newPassword
      });
      cancelEditPassword();
      showToast('Senha atualizada com sucesso');
    } catch (err) {
      setError('Erro ao atualizar senha');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const confirmRoleUpdate = async () => {
    if (!confirmRoleChange) return;
    try {
      const { user, targetRole } = confirmRoleChange;
      await axios.put(`${import.meta.env.VITE_API_URL || '/api'}/users/${user._id}/role`, { role: targetRole });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: targetRole } : u));
      setConfirmRoleChange(null);
      showToast('Função atualizada com sucesso');
    } catch (err) {
      setError('Erro ao atualizar função');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-500">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Carregando usuários...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Painel de Administração</h1>
        <p className="text-gray-600 text-sm sm:text-base">Gerencie usuários e permissões do sistema</p>
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
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gerenciar Usuários</h2>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? 'Carregando...' : `${users.length} usuário(s) cadastrado(s)`}
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                Total: {users.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-gray-500 text-center">
                Nenhum usuário encontrado.
              </p>
              <p className="text-gray-400 text-sm text-center mt-2">
                Os usuários aparecerão aqui quando se cadastrarem no sistema.
              </p>
            </div>
          ) : (
            <div className="min-w-full">
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200">
                  {users.map(user => (
                    <React.Fragment key={user._id}>
                      <div className="p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-base truncate">{user.name}</h4>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                            <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Usuário'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            <span className="block">Cadastrado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button
                              onClick={() => openEditPassword(user._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
                              title="Editar senha"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                <path d="M16.862 3.487a2.25 2.25 0 013.182 3.182l-9.193 9.193a2.25 2.25 0 01-.948.564l-3.307.943a.75.75 0 01-.925-.925l.943-3.307a2.25 2.25 0 01.564-.948l9.193-9.193z" />
                                <path d="M19.5 10.125L13.875 4.5" />
                              </svg>
                              Senha
                            </button>
                            <button
                              onClick={() => openConfirmRoleChange(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors duration-200"
                              disabled={currentUser && user._id === currentUser._id}
                              title={currentUser && user._id === currentUser._id ? "Não é possível alterar sua própria função" : (user.role === 'admin' ? "Rebaixar para Usuário" : "Promover a Admin")}
                            >
                              {user.role === 'admin' ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v12.19l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                  </svg>
                                  Rebaixar
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75V7.31l-3.22 3.22a.75.75 0 11-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 11-1.06 1.06L12.75 7.31v12.19a.75.75 0 01-.75.75z" clipRule="evenodd" />
                                  </svg>
                                  Promover
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openConfirmDelete(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200"
                              disabled={user.role === 'admin'}
                              title={user.role === 'admin' ? "Não é possível excluir um administrador" : "Excluir usuário"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                <path d="M9 3.75A.75.75 0 019.75 3h4.5a.75.75 0 01.75.75V5.25H18a.75.75 0 010 1.5h-.592l-.563 12.33A2.25 2.25 0 0114.6 21H9.4a2.25 2.25 0 01-2.245-1.92L6.592 6.75H6a.75.75 0 010-1.5h2.25V3.75zM8.095 6.75l.522 11.423a.75.75 0 00.748.677h5.27a.75.75 0 00.747-.677L16.905 6.75H8.095z" />
                              </svg>
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                      {editingUserId === user._id && (
                        <div className="bg-gray-50 p-4 border-t border-gray-200">
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Nova senha</label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                              placeholder="Digite a nova senha"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdatePassword(user._id)}
                                className="flex-1 btn btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                                disabled={saving}
                              >
                                {saving ? (
                                  'Salvando...'
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth="2">
                                      <path d="M5 13l4 4L19 7" />
                                    </svg>
                                    Salvar
                                  </>
                                )}
                              </button>
                              <button
                                onClick={cancelEditPassword}
                                className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-800 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                                disabled={saving}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM9.53 8.47a.75.75 0 10-1.06 1.06L10.44 12l-1.97 1.97a.75.75 0 101.06 1.06L11.5 13.06l1.97 1.97a.75.75 0 101.06-1.06L12.56 12l1.97-1.97a.75.75 0 10-1.06-1.06L11.5 10.94 9.53 8.97z" clipRule="evenodd" />
                                </svg>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Função
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Registro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <React.Fragment key={user._id}>
                      <tr className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditPassword(user._id)}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors duration-200"
                              title="Editar senha"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M16.862 3.487a2.25 2.25 0 013.182 3.182l-9.193 9.193a2.25 2.25 0 01-.948.564l-3.307.943a.75.75 0 01-.925-.925l.943-3.307a2.25 2.25 0 01.564-.948l9.193-9.193z" />
                                <path d="M19.5 10.125L13.875 4.5" />
                              </svg>
                              Editar Senha
                            </button>
                            <button
                              onClick={() => openConfirmRoleChange(user)}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                              disabled={currentUser && user._id === currentUser._id}
                              title={currentUser && user._id === currentUser._id ? "Não é possível alterar sua própria função" : (user.role === 'admin' ? "Rebaixar para Usuário" : "Promover a Admin")}
                            >
                              {user.role === 'admin' ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v12.19l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                  </svg>
                                  Rebaixar
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75V7.31l-3.22 3.22a.75.75 0 11-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 11-1.06 1.06L12.75 7.31v12.19a.75.75 0 01-.75.75z" clipRule="evenodd" />
                                  </svg>
                                  Promover
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openConfirmDelete(user)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors duration-200"
                              disabled={user.role === 'admin'}
                              title={user.role === 'admin' ? "Não é possível excluir um administrador" : "Excluir usuário"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M9 3.75A.75.75 0 019.75 3h4.5a.75.75 0 01.75.75V5.25H18a.75.75 0 010 1.5h-.592l-.563 12.33A2.25 2.25 0 0114.6 21H9.4a2.25 2.25 0 01-2.245-1.92L6.592 6.75H6a.75.75 0 010-1.5h2.25V3.75zM8.095 6.75l.522 11.423a.75.75 0 00.748.677h5.27a.75.75 0 00.747-.677L16.905 6.75H8.095z" />
                              </svg>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editingUserId === user._id && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nova senha</label>
                                <input
                                  type="password"
                                  className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                  placeholder="Digite a nova senha"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdatePassword(user._id)}
                                  className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                                  disabled={saving}
                                >
                                  {saving ? (
                                    'Salvando...'
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth="2">
                                        <path d="M5 13l4 4L19 7" />
                                      </svg>
                                      Salvar
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={cancelEditPassword}
                                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                                  disabled={saving}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM9.53 8.47a.75.75 0 10-1.06 1.06L10.44 12l-1.97 1.97a.75.75 0 101.06 1.06L11.5 13.06l1.97 1.97a.75.75 0 101.06-1.06L12.56 12l1.97-1.97a.75.75 0 10-1.06-1.06L11.5 10.94 9.53 8.97z" clipRule="evenodd" />
                                  </svg>
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar exclusão</h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir o usuário <span className="font-medium text-gray-900">{confirmDeleteUser.name}</span>? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={cancelDelete} 
                  className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-800 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM9.53 8.47a.75.75 0 10-1.06 1.06L10.44 12l-1.97 1.97a.75.75 0 101.06 1.06L11.5 13.06l1.97 1.97a.75.75 0 101.06-1.06L12.56 12l1.97-1.97a.75.75 0 10-1.06-1.06L11.5 10.94 9.53 8.97z" clipRule="evenodd" />
                  </svg>
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 btn bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M9 3.75A.75.75 0 019.75 3h4.5a.75.75 0 01.75.75V5.25H18a.75.75 0 010 1.5h-.592l-.563 12.33A2.25 2.25 0 0114.6 21H9.4a2.25 2.25 0 01-2.245-1.92L6.592 6.75H6a.75.75 0 010-1.5h2.25V3.75zM8.095 6.75l.522 11.423a.75.75 0 00.748.677h5.27a.75.75 0 00.747-.677L16.905 6.75H8.095z" />
                  </svg>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Mudança de Função */}
      {confirmRoleChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar mudança de função</h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja {confirmRoleChange.targetRole === 'admin' ? 'promover' : 'rebaixar'} o usuário <span className="font-medium text-gray-900">{confirmRoleChange.user.name}</span> para <span className="font-medium text-gray-900">{confirmRoleChange.targetRole === 'admin' ? 'Administrador' : 'Usuário'}</span>?
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={cancelRoleChange} 
                  className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmRoleUpdate} 
                  className="flex-1 btn btn-primary px-4 py-2.5 rounded-lg transition-colors duration-200"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;