import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { adminApi, SystemStats, UserActivity, User } from '../services/apiService';
import { UsersTable, UserModal } from '../components/admin';

// Interface for UsersTable props
interface UserTableProps {
  onEdit: (user: User) => void;
  searchQuery: string;
  page: number;
  onPageChange: (newPage: number) => void;
  loading?: boolean; 
}

const AdminPanel: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Состояния данных
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Состояние загрузки
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Фильтры и пагинация
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Состояние для модального окна редактирования пользователя
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка активности пользователей
        setLoadingActivities(true);
        const activitiesData = await adminApi.getUserActivities();
        setUserActivities(activitiesData);
        
        // Загрузка списка пользователей
        const usersData = await adminApi.getUsers();
        setUsers(usersData);
        
        setLoadingActivities(false);
      } catch (err) {
        setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
        setLoadingActivities(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Обработчики
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Сбросить пагинацию при поиске
  };
  
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setModalTitle('Редактирование пользователя');
    setIsModalOpen(true);
  };
  
  const handleAddUser = () => {
    setUserToEdit(null);
    setModalTitle('Добавление пользователя');
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  const handleSaveUser = async (userData: User & { password?: string }) => {
    try {
      let updatedUser: User;
      
      if (userData.id) {
        // Обновление существующего пользователя
        const { password, ...userDataWithoutPassword } = userData;
        updatedUser = await adminApi.updateUser(userData.id, userDataWithoutPassword);
        
        // Обновляем локальное состояние
        setUsers(prev => prev.map(user => user.id === userData.id ? updatedUser : user));
        
        setSuccessMessage('Пользователь успешно обновлен');
      } else {
        // Создание нового пользователя, убедимся что пароль передается
        if (!userData.password) {
          setError('Пароль обязателен для создания пользователя');
          return;
        }
        
        // Передаем все данные, включая пароль
        updatedUser = await adminApi.createUser(userData);
        
        // Добавляем нового пользователя в список
        setUsers(prev => [...prev, updatedUser]);
        
        setSuccessMessage('Пользователь успешно создан. Пароль установлен.');
      }
      
      handleCloseModal();
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Ошибка при сохранении пользователя');
      
      // Скрываем сообщение об ошибке через 3 секунды
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  const handleDeleteUser = async (userId: string, userName: string) => {
    // Подтверждение удаления
    if (!window.confirm(`Вы действительно хотите удалить пользователя "${userName}"?`)) {
      return;
    }
    
    try {
      await adminApi.deleteUser(userId);
      
      // Удаляем пользователя из локального состояния
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      setSuccessMessage('Пользователь успешно удален');
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Ошибка при удалении пользователя');
      
      // Скрываем сообщение об ошибке через 3 секунды
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const getRoleIconAndClass = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: 'admin_panel_settings',
          bgClass: 'bg-purple-100 dark:bg-purple-900/30',
          textClass: 'text-purple-600 dark:text-purple-400',
          label: 'Администратор'
        };
      default:
        return {
          icon: 'person',
          bgClass: 'bg-gray-100 dark:bg-gray-800/50',
          textClass: 'text-gray-600 dark:text-gray-400',
          label: 'Пользователь'
        };
    }
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    // Фильтр по поисковому запросу
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Фильтр по роли
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Сортировка пользователей
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'email') {
      return sortOrder === 'asc' 
        ? a.email.localeCompare(b.email) 
        : b.email.localeCompare(a.email);
    } else if (sortBy === 'role') {
      return sortOrder === 'asc' 
        ? a.role.localeCompare(b.role) 
        : b.role.localeCompare(a.role);
    }
    return 0;
  });
  
  return (
    <div className="space-y-6 fade-in">
      {/* Сообщения об успехе/ошибке */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <span className="material-icons mr-2">check_circle</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <span className="material-icons mr-2">error</span>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <span className="material-icons text-[var(--primary-color)] mr-3 text-3xl">admin_panel_settings</span>
          <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('nav_admin')}
          </h1>
        </div>
        
        <div className="mt-3 sm:mt-0">
          <button
            onClick={handleAddUser}
            className="inline-flex items-center px-5 py-2.5 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] shadow-sm transition-all duration-200 transform hover:-translate-y-1"
          >
            <span className="material-icons mr-2 text-sm">add</span>
            Добавить пользователя
          </button>
        </div>
      </div>
      
      {/* Статистика пользователей */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-blue-600 dark:text-blue-400">group</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">Всего пользователей</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-purple-600 dark:text-purple-400">admin_panel_settings</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">Администраторы</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {users.filter(user => user.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Фильтры и поиск */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-sm p-4 mb-6 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-gray-400 text-lg">search</span>
              </span>
          <input
            type="text"
                className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--dark-bg-secondary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" 
                placeholder="Поиск пользователей..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
          </div>
          
          <div>
            <select 
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--dark-bg-secondary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="user">Пользователи</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Таблица пользователей */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-sm overflow-hidden border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>Имя</span>
                    {sortBy === 'name' && (
                      <span className="material-icons text-[var(--primary-color)] ml-1 text-sm">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    <span>Email</span>
                    {sortBy === 'email' && (
                      <span className="material-icons text-[var(--primary-color)] ml-1 text-sm">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">
                    <span>Роль</span>
                    {sortBy === 'role' && (
                      <span className="material-icons text-[var(--primary-color)] ml-1 text-sm">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Последний вход
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user) => {
                  const roleData = getRoleIconAndClass(user.role);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] flex items-center justify-center font-medium uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleData.bgClass} ${roleData.textClass}`}>
                          <span className="material-icons text-xs mr-1">{roleData.icon}</span>
                          {roleData.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Нет данных'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] mr-3"
                          title="Редактировать"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="text-red-500 hover:text-red-700"
                          title="Удалить"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                    {loadingActivities ? (
                      <div className="flex justify-center items-center">
                        <span className="material-icons animate-spin mr-2">refresh</span>
                        Загрузка...
                      </div>
                    ) : (
                      "Пользователи не найдены"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Модальное окно для редактирования/добавления пользователя */}
      <UserModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={userToEdit}
        title={modalTitle}
      />
    </div>
  );
};

export default AdminPanel; 