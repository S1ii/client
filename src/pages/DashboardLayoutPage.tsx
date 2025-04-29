import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Task, tasksApi } from '../services/apiService';
import { ClientModal, Client } from '../components/Clients';
import { OrganizationModal, Organization } from '../components/Organizations';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

const DashboardLayoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showNotification } = useNotification();
  
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [organizationModalOpen, setOrganizationModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tasksApi.getTasks();
      const sortedTasks = response.sort((a: Task, b: Task) => {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
      setTasks(sortedTasks.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(t('failedToFetchTasks'));
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Форматирование даты для отображения
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      
      // Один день в миллисекундах
      const oneDay = 24 * 60 * 60 * 1000;
      
      // Если дата сегодня
      if (date.toDateString() === today.toDateString()) {
        return t('today');
      }
      
      // Если дата на этой неделе
      const daysDiff = Math.round(Math.abs((today.getTime() - date.getTime()) / oneDay));
      if (daysDiff < 7) {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
        return date.toLocaleDateString('ru-RU', options);
      }
      
      // Если дата в этом месяце
      if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      }
      
      // Во всех других случаях
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleOpenClientModal = () => {
    setClientModalOpen(true);
  };

  const handleOpenOrganizationModal = () => {
    setOrganizationModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setClientModalOpen(false);
  };

  const handleCloseOrganizationModal = () => {
    setOrganizationModalOpen(false);
  };

  const handleViewAllTasks = () => {
    navigate('/tasks');
  };

  const handleNavigateToClients = () => {
    navigate('/clients');
  };

  const handleNavigateToOrganizations = () => {
    navigate('/organizations');
  };

  // Обработчик сохранения клиента
  const handleSaveClient = async (client: Client) => {
    try {
      // Здесь будет вызов API для сохранения клиента
      const response = await axios.post('/api/clients', client);
      
      if (response.status === 201) {
        handleCloseClientModal();
        // Показываем уведомление об успешном создании клиента
        showNotification(t('clients.addClient') + ' ' + t('common.save'), 'success');
      }
    } catch (err: any) {
      console.error('Error saving client:', err);
      showNotification(t('clients.connectionError'), 'error');
    }
  };

  // Обработчик сохранения организации
  const handleSaveOrganization = async (organization: Organization) => {
    try {
      // Здесь будет вызов API для сохранения организации
      const response = await axios.post('/api/organizations', organization);
      
      if (response.status === 201) {
        handleCloseOrganizationModal();
        // Показываем уведомление об успешном создании организации
        showNotification(t('organizations.createOrganization') + ' ' + t('common.save'), 'success');
      }
    } catch (err: any) {
      console.error('Error saving organization:', err);
      showNotification(t('organizations.connectionError'), 'error');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Заголовок страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <span className="material-icons text-[var(--primary-color)] mr-3 text-3xl">dashboard</span>
          <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('dashboard')}
          </h1>
        </div>
      </div>
      
      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4 icon-circle">
              <span className="material-icons text-blue-600 dark:text-blue-400">assignment</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('totalTasks')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4 icon-circle">
              <span className="material-icons text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('done')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {tasks.filter(task => task.status === 'done').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3 mr-4 icon-circle">
              <span className="material-icons text-yellow-600 dark:text-yellow-400">pending_actions</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('inProgress')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {tasks.filter(task => task.status === 'in_progress' || task.status === 'todo').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Блоки быстрого доступа */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div 
          className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-5 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          onClick={handleOpenClientModal}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mr-4 icon-circle">
                <span className="material-icons text-indigo-600 dark:text-indigo-400">person_add</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {t('clients.addClient')}
              </h3>
            </div>
          </div>
          <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mb-4">
            {t('clients.noClientsDescription')}
          </p>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenClientModal();
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
            >
              <span className="material-icons mr-2 text-sm">add</span>
              {t('common.add')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToClients();
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('seeAll')}
            </button>
          </div>
        </div>
        
        <div 
          className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-5 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          onClick={handleOpenOrganizationModal}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4 icon-circle">
                <span className="material-icons text-blue-600 dark:text-blue-400">business</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {t('organizations.addOrganization')}
              </h3>
            </div>
          </div>
          <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mb-4">
            {t('organizations.noOrganizationsDescription')}
          </p>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenOrganizationModal();
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
            >
              <span className="material-icons mr-2 text-sm">add</span>
              {t('common.add')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToOrganizations();
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('seeAll')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Недавние задачи */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-5 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-teal-100 dark:bg-teal-900/30 rounded-full p-2 mr-3 icon-circle">
              <span className="material-icons text-teal-600 dark:text-teal-400">assignment</span>
            </div>
            <h3 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
              {t('recentActivity')}
            </h3>
          </div>
          <button
            onClick={handleViewAllTasks}
            className="text-[var(--primary-color)] hover:underline text-sm font-medium"
          >
            {t('seeAll')}
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">{t('tasks.title')}</th>
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">{t('tasks.priority')}</th>
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">{t('tasks.status')}</th>
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">{t('tasks.dueDate')}</th>
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">{t('tasks.assignedTo')}</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <tr key={task.id} className="border-b border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                      <td className="py-3 px-4 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{task.title}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                          {task.priority === 'high' ? t('high') : task.priority === 'medium' ? t('medium') : t('low')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'done' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : task.status === 'in_progress'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          {task.status === 'done' ? t('done') : task.status === 'in_progress' ? t('inProgress') : t('todo')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{formatDate(task.dueDate)}</td>
                      <td className="py-3 px-4 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{task.assignedTo || t('tasks.notAssigned')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                      {t('tasks.noTasks')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <ClientModal
        open={clientModalOpen}
        onClose={handleCloseClientModal}
        onSave={handleSaveClient}
        title={t('clients.addClient')}
      />
      
      <OrganizationModal
        open={organizationModalOpen}
        onClose={handleCloseOrganizationModal}
        onSave={handleSaveOrganization}
        title={t('organizations.addOrganization')}
      />
    </div>
  );
};

export default DashboardLayoutPage; 