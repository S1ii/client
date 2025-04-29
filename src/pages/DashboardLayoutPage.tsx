import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Task, tasksApi } from '../services/apiService';
import { ClientModal, Client } from '../components/Clients';
import { OrganizationModal, Organization } from '../components/Organizations';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon, 
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  AssignmentLate as InProgressIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import axios from 'axios';

const DashboardLayoutPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState<boolean>(false);
  const [organizationModalOpen, setOrganizationModalOpen] = useState<boolean>(false);
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await tasksApi.getTasks();
        setTasks(tasksData);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Не удалось загрузить задачи');
        
        // Demo data if API unavailable
        setTasks([
          {
            id: '1',
            title: 'Создать презентацию',
            description: 'Подготовить презентацию для клиента по проекту',
            priority: 'high',
            status: 'todo',
            dueDate: '2023-12-15',
            assignedTo: 'Алексей Смирнов',
            createdAt: '2023-12-01T10:00:00Z',
            updatedAt: '2023-12-01T10:00:00Z'
          },
          {
            id: '2',
            title: 'Изучить документацию',
            description: 'Изучить новую версию API',
            priority: 'medium',
            status: 'in_progress',
            dueDate: '2023-12-10',
            assignedTo: 'Мария Иванова',
            createdAt: '2023-12-02T11:30:00Z',
            updatedAt: '2023-12-02T11:30:00Z'
          },
          {
            id: '3',
            title: 'Исправить баги',
            description: 'Исправить ошибки в модуле оплаты',
            priority: 'high',
            status: 'done',
            dueDate: '2023-12-05',
            assignedTo: 'Дмитрий Петров',
            createdAt: '2023-12-01T09:15:00Z',
            updatedAt: '2023-12-03T14:20:00Z'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Форматирование даты
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircleIcon className="text-green-500" />;
      case 'in_progress':
        return <InProgressIcon className="text-yellow-500" />;
      case 'todo':
      default:
        return <PendingIcon className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
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
      console.log('Сохранение клиента:', client);
      
      // Убедимся, что client.status всегда имеет валидное значение
      const clientToSave = {
        ...client,
        status: client.status === 'active' || client.status === 'inactive' ? client.status : 'active'
      };
      
      const response = await axios.post('/api/clients', clientToSave);
      
      if (response.data.success) {
        console.log('Клиент создан:', response.data.data);
        handleCloseClientModal();
        showNotification('Клиент успешно добавлен', 'success');
      }
    } catch (err: any) {
      console.error('Error saving client:', err);
      showNotification('Ошибка при добавлении клиента', 'error');
    }
  };

  // Обработчик сохранения организации
  const handleSaveOrganization = async (organization: Organization) => {
    try {
      const response = await axios.post('/api/organizations', organization);
      
      if (response.data.success) {
        console.log('Организация создана:', response.data.data);
        handleCloseOrganizationModal();
        showNotification('Организация успешно добавлена', 'success');
      }
    } catch (err: any) {
      console.error('Error saving organization:', err);
      showNotification('Ошибка при добавлении организации', 'error');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Заголовок страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <span className="material-icons text-[var(--primary-color)] mr-3 text-3xl">dashboard</span>
          <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            Панель управления
          </h1>
        </div>
      </div>
      
      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-blue-600 dark:text-blue-400">assignment</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">Всего задач</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">Выполнено</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {tasks.filter(task => task.status === 'done').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-yellow-600 dark:text-yellow-400">pending_actions</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">В процессе</p>
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
              <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mr-4">
                <span className="material-icons text-indigo-600 dark:text-indigo-400">person_add</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                Добавить клиента
              </h3>
            </div>
          </div>
          <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mb-4">
            Создайте новую запись клиента в системе
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
              Добавить
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToClients();
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Все клиенты
            </button>
          </div>
        </div>
        
        <div 
          className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-5 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          onClick={handleOpenOrganizationModal}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4">
                <span className="material-icons text-blue-600 dark:text-blue-400">business</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                Добавить организацию
              </h3>
            </div>
          </div>
          <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mb-4">
            Создайте новую запись организации в системе
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
              Добавить
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToOrganizations();
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Все организации
            </button>
          </div>
        </div>
      </div>
      
      {/* Недавние задачи */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-5 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-teal-100 dark:bg-teal-900/30 rounded-full p-2 mr-3">
              <span className="material-icons text-teal-600 dark:text-teal-400">assignment</span>
            </div>
            <h3 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
              Недавние задачи
            </h3>
          </div>
          <button
            onClick={handleViewAllTasks}
            className="text-[var(--primary-color)] hover:underline text-sm font-medium"
          >
            Все задачи
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">Загрузка...</p>
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
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">Название</th>
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">Приоритет</th>
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">Статус</th>
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">Срок</th>
                  <th className="text-left py-3 px-4 text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] font-medium text-sm">Исполнитель</th>
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
                          {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {task.status === 'done' ? (
                            <span className="material-icons text-green-600 dark:text-green-400 mr-1.5 text-sm">check_circle</span>
                          ) : task.status === 'in_progress' ? (
                            <span className="material-icons text-yellow-600 dark:text-yellow-400 mr-1.5 text-sm">pending_actions</span>
                          ) : (
                            <span className="material-icons text-blue-600 dark:text-blue-400 mr-1.5 text-sm">schedule</span>
                          )}
                          <span className="text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                            {task.status === 'done' ? 'Выполнено' : task.status === 'in_progress' ? 'В процессе' : 'К выполнению'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{formatDate(task.dueDate)}</td>
                      <td className="py-3 px-4 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{task.assignedTo || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                      Нет доступных задач
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Модальные окна */}
      <ClientModal 
        open={clientModalOpen} 
        onClose={handleCloseClientModal}
        onSave={handleSaveClient}
        title="Добавление нового клиента"
      />
      
      <OrganizationModal
        open={organizationModalOpen}
        onClose={handleCloseOrganizationModal}
        onSave={handleSaveOrganization}
        title="Добавление новой организации"
      />
    </div>
  );
};

export default DashboardLayoutPage; 