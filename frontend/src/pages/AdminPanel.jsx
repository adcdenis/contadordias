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
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users`);
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
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/${confirmDeleteUser._id}`);
      setUsers(users.filter(u => u._id !== confirmDeleteUser._id));
      setConfirmDeleteUser(null);
      showToast('Usuário excluído com sucesso');
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
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/${id}`, {
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
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/${user._id}/role`, { role: targetRole });
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
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold">Gerenciar Usuários</h2>
          <p className="mt-1 text-sm text-gray-600">
            Total de usuários: {users.length}
          </p>
        </div>
        
        <div className="border-t border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Registro
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <React.Fragment key={user._id}>
                <tr>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <button
                      onClick={() => openEditPassword(user._id)}
                      className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-4 inline-flex items-center gap-1"
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
                      className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-4 inline-flex items-center gap-1"
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
                      className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                      disabled={user.role === 'admin'}
                      title={user.role === 'admin' ? "Não é possível excluir um administrador" : "Excluir usuário"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M9 3.75A.75.75 0 019.75 3h4.5a.75.75 0 01.75.75V5.25H18a.75.75 0 010 1.5h-.592l-.563 12.33A2.25 2.25 0 0114.6 21H9.4a2.25 2.25 0 01-2.245-1.92L6.592 6.75H6a.75.75 0 010-1.5h2.25V3.75zM8.095 6.75l.522 11.423a.75.75 0 00.748.677h5.27a.75.75 0 00.747-.677L16.905 6.75H8.095z" />
                      </svg>
                      Excluir
                    </button>
                  </td>
                </tr>
                {editingUserId === user._id && (
                  <tr className="bg-gray-50">
                    <td colSpan="5" className="px-3 py-2 sm:px-6 sm:py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="password"
                          className="form-input w-full sm:max-w-sm"
                          placeholder="Nova senha"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          onClick={() => handleUpdatePassword(user._id)}
                          className="btn btn-primary inline-flex items-center gap-2"
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
                          className="btn btn-danger inline-flex items-center gap-2"
                          disabled={saving}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM9.53 8.47a.75.75 0 10-1.06 1.06L10.44 12l-1.97 1.97a.75.75 0 101.06 1.06L11.5 13.06l1.97 1.97a.75.75 0 101.06-1.06L12.56 12l1.97-1.97a.75.75 0 10-1.06-1.06L11.5 10.94 9.53 8.97z" clipRule="evenodd" />
                          </svg>
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-3">Confirmar exclusão</h3>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir o usuário <span className="font-medium">{confirmDeleteUser.name}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelDelete} className="btn inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM9.53 8.47a.75.75 0 10-1.06 1.06L10.44 12l-1.97 1.97a.75.75 0 101.06 1.06L11.5 13.06l1.97 1.97a.75.75 0 101.06-1.06L12.56 12l1.97-1.97a.75.75 0 10-1.06-1.06L11.5 10.94 9.53 8.97z" clipRule="evenodd" />
                </svg>
                Cancelar
              </button>
              <button onClick={confirmDelete} className="btn btn-danger inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M9 3.75A.75.75 0 019.75 3h4.5a.75.75 0 01.75.75V5.25H18a.75.75 0 010 1.5h-.592l-.563 12.33A2.25 2.25 0 0114.6 21H9.4a2.25 2.25 0 01-2.245-1.92L6.592 6.75H6a.75.75 0 010-1.5h2.25V3.75zM8.095 6.75l.522 11.423a.75.75 0 00.748.677h5.27a.75.75 0 00.747-.677L16.905 6.75H8.095z" />
                </svg>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRoleChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-3">Confirmar mudança de função</h3>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja {confirmRoleChange.targetRole === 'admin' ? 'promover' : 'rebaixar'} o usuário <span className="font-medium">{confirmRoleChange.user.name}</span> para <span className="font-medium">{confirmRoleChange.targetRole === 'admin' ? 'Administrador' : 'Usuário'}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelRoleChange} className="btn">Cancelar</button>
              <button onClick={confirmRoleUpdate} className="btn btn-primary">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;