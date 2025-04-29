import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

// Интерфейсы
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

interface SystemSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  enableRegistration: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableDarkMode: boolean;
  maintenanceMode: boolean;
}

const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  
  // Основные состояния
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    siteTitle: '',
    siteDescription: '',
    contactEmail: '',
    enableRegistration: true,
    requireEmailVerification: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableDarkMode: false,
    maintenanceMode: false
  });
  
  // Состояния загрузки и ошибок
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Состояния UI
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Состояния для выделения пользователей
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Загрузка данных при изменении активной вкладки
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  // Загрузка данных
  const fetchData = async () => {
    try {
      if (activeTab === 'users') {
        setLoadingUsers(true);
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
        setLoadingUsers(false);
      } else if (activeTab === 'settings') {
        setLoadingSettings(true);
        const response = await axios.get('/api/admin/settings');
        setSettings(response.data);
        setLoadingSettings(false);
      }
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные. Проверьте ваши права доступа.');
      setLoadingUsers(false);
      setLoadingSettings(false);
    }
  };

  // Обработка изменения роли пользователя
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      
      // Обновляем локальное состояние
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setSuccessMessage('Роль пользователя успешно изменена');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Ошибка при изменении роли:', err);
      setError('Не удалось изменить роль пользователя');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Обработка удаления пользователя
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      
      // Обновляем локальное состояние
      setUsers(users.filter(user => user.id !== userId));
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      
      setSuccessMessage('Пользователь успешно удален');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      setError('Не удалось удалить пользователя');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Массовое удаление пользователей
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      setError('Не выбрано ни одного пользователя');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (!window.confirm(`Вы уверены, что хотите удалить ${selectedUsers.length} пользователей?`)) {
      return;
    }
    
    try {
      await axios.post('/api/admin/users/bulk-delete', { userIds: selectedUsers });
      
      // Обновляем локальное состояние
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      setSelectAll(false);
      
      setSuccessMessage(`Успешно удалено ${selectedUsers.length} пользователей`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Ошибка при массовом удалении:', err);
      setError('Не удалось выполнить массовое удаление');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Изменение статуса пользователя (активация/деактивация)
  const handleToggleUserStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { status: newStatus });
      
      // Обновляем локальное состояние
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus as 'active' | 'inactive' } : user
      ));
      
      setSuccessMessage(`Статус пользователя изменен на ${newStatus === 'active' ? 'активный' : 'неактивный'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Ошибка при изменении статуса:', err);
      setError('Не удалось изменить статус пользователя');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Сохранение настроек системы
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.put('/api/admin/settings', settings);
      
      setSuccessMessage('Настройки успешно сохранены');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Ошибка при сохранении настроек:', err);
      setError('Не удалось сохранить настройки');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Обработка выбора всех пользователей
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      const filteredUserIds = filteredUsers.map(user => user.id);
      setSelectedUsers(filteredUserIds);
    }
    setSelectAll(!selectAll);
  };

  // Обработка выбора одного пользователя
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      // Проверка, если выбраны все пользователи из отфильтрованного списка
      if (selectedUsers.length + 1 === filteredUsers.length) {
        setSelectAll(true);
      }
    }
  };

  // Обработка изменения настроек
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value
    });
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('nav_admin')}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Пользователи
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Настройки системы
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Поиск пользователей..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Все роли</option>
                    <option value="admin">Администратор</option>
                    <option value="manager">Менеджер</option>
                    <option value="user">Пользователь</option>
                  </select>
                  
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Все статусы</option>
                    <option value="active">Активный</option>
                    <option value="inactive">Неактивный</option>
                  </select>
                  
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Удалить выбранных ({selectedUsers.length})
                    </button>
                  )}
                </div>
              </div>
              
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Нет пользователей, соответствующих критериям поиска
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={selectAll}
                              onChange={handleSelectAll}
                            />
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Пользователь
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Роль
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Статус
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Дата регистрации
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Последний вход
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="block w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="admin">Администратор</option>
                              <option value="manager">Менеджер</option>
                              <option value="user">Пользователь</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}
                            >
                              {user.status === 'active' ? 'Активный' : 'Неактивный'}
                            </span>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.status)}
                              className="ml-2 text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              {user.status === 'active' ? 'Деактивировать' : 'Активировать'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Никогда'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-4"
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              {loadingSettings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Название сайта
                      </label>
                      <input
                        type="text"
                        name="siteTitle"
                        id="siteTitle"
                        value={settings.siteTitle}
                        onChange={handleSettingChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Описание сайта
                      </label>
                      <input
                        type="text"
                        name="siteDescription"
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={handleSettingChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Контактный email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        id="contactEmail"
                        value={settings.contactEmail}
                        onChange={handleSettingChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Таймаут сессии (минуты)
                      </label>
                      <input
                        type="number"
                        name="sessionTimeout"
                        id="sessionTimeout"
                        min="5"
                        max="1440"
                        value={settings.sessionTimeout}
                        onChange={handleSettingChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Максимальное количество попыток входа
                      </label>
                      <input
                        type="number"
                        name="maxLoginAttempts"
                        id="maxLoginAttempts"
                        min="1"
                        max="10"
                        value={settings.maxLoginAttempts}
                        onChange={handleSettingChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="enableRegistration"
                          name="enableRegistration"
                          type="checkbox"
                          checked={settings.enableRegistration}
                          onChange={handleSettingChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="enableRegistration" className="font-medium text-gray-700 dark:text-gray-300">
                          Разрешить регистрацию новых пользователей
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="requireEmailVerification"
                          name="requireEmailVerification"
                          type="checkbox"
                          checked={settings.requireEmailVerification}
                          onChange={handleSettingChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="requireEmailVerification" className="font-medium text-gray-700 dark:text-gray-300">
                          Требовать подтверждение email
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="enableDarkMode"
                          name="enableDarkMode"
                          type="checkbox"
                          checked={settings.enableDarkMode}
                          onChange={handleSettingChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="enableDarkMode" className="font-medium text-gray-700 dark:text-gray-300">
                          Включить тёмную тему по умолчанию
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="maintenanceMode"
                          name="maintenanceMode"
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={handleSettingChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="maintenanceMode" className="font-medium text-gray-700 dark:text-gray-300">
                          Включить режим обслуживания
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Сайт будет недоступен для обычных пользователей во время обслуживания.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Сохранить настройки
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 