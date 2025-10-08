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
                      className="text-blue-600 hover:text-blue-900 mr-2 sm:mr-4"
                      title="Editar senha"
                    >
                      Editar Senha
                    </button>
                    <button
                      onClick={() => openConfirmRoleChange(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-4"
                      disabled={currentUser && user._id === currentUser._id}
                      title={currentUser && user._id === currentUser._id ? "Não é possível alterar sua própria função" : (user.role === 'admin' ? "Rebaixar para Usuário" : "Promover a Admin")}
                    >
                      {user.role === 'admin' ? 'Rebaixar' : 'Promover'}
                    </button>
                    <button
                      onClick={() => openConfirmDelete(user)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.role === 'admin'}
                      title={user.role === 'admin' ? "Não é possível excluir um administrador" : "Excluir usuário"}
                    >
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
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={cancelEditPassword}
                          className="btn"
                          disabled={saving}
                        >
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
              <button onClick={cancelDelete} className="btn">Cancelar</button>
              <button onClick={confirmDelete} className="btn btn-danger">Excluir</button>
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