import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import TaskModal from '../components/Tasks/TaskModal';
import { Task, tasksApi } from '../services/apiService';

const TasksPage: React.FC = () => {
  const { t } = useLanguage();
  const { showNotification } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Группировка задач по статусу
  const todoTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === 'todo') : [];
  const inProgressTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === 'in_progress') : [];
  const doneTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === 'done') : [];

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

  // Загрузка задач
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await tasksApi.getTasks();
        setTasks(tasksData);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(t('failedToFetchTasks'));
        
        // Использование демо-данных если API недоступен
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
          {
            id: '4',
            title: 'Обновить зависимости',
            description: 'Обновить NPM пакеты до последних версий',
            priority: 'low',
            status: 'done',
            dueDate: '2023-11-28',
            assignedTo: 'Сергей Николаев',
            createdAt: '2023-12-04T15:10:00Z',
            updatedAt: '2023-12-04T15:10:00Z'
          },
          {
            id: '5',
            title: 'Встреча с клиентом',
            description: 'Обсудить требования к проекту',
            priority: 'medium',
            status: 'todo',
            dueDate: '2023-12-08',
            assignedTo: 'Елена Козлова',
            createdAt: '2023-12-03T13:00:00Z',
            updatedAt: '2023-12-03T13:00:00Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [t]);

  // Фильтрация задач
  const getFilteredTasks = () => {
    let filteredTasks = Array.isArray(tasks) ? [...tasks] : [];
    
    // Фильтрация по поиску
    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Фильтрация по статусу
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
    }
    
    // Фильтрация по приоритету
    if (filterPriority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
    }
    
    // Сортировка
    switch (sortBy) {
      case 'newest':
        filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filteredTasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'dueDate':
        filteredTasks.sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime());
        break;
      case 'priority':
        const priorityValues = { high: 3, medium: 2, low: 1 };
        filteredTasks.sort((a, b) => (priorityValues[b.priority as keyof typeof priorityValues] || 0) - 
                                    (priorityValues[a.priority as keyof typeof priorityValues] || 0));
        break;
      default:
        break;
    }
    
    return filteredTasks;
  };

  // Открыть модальное окно для создания задачи
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentTask(null);
    setShowModal(true);
  };

  // Открыть модальное окно для редактирования задачи
  const handleOpenEditModal = (task: Task) => {
    setModalMode('edit');
    setCurrentTask(task);
    setShowModal(true);
  };

  // Закрыть модальное окно
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentTask(null);
  };

  // Обработка сохранения задачи
  const handleSaveTask = async (taskData: any) => {
    try {
      let response: Task | null = null;
      
      if (modalMode === 'create') {
        // Создание новой задачи
        response = await tasksApi.createTask(taskData);
        
        if (response) {
          setTasks([...tasks, response]);
          showNotification('Задача успешно создана', 'success');
        }
      } else {
        // Обновление существующей задачи
        if (currentTask) {
          response = await tasksApi.updateTask(currentTask.id, {
            ...currentTask,
            ...taskData
          });
          
          if (response) {
            setTasks(tasks.map(task => 
              task.id === response!.id ? response! : task
            ));
            showNotification('Задача успешно обновлена', 'success');
          }
        }
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Error saving task:', err);
      showNotification('Ошибка при сохранении задачи', 'error');
    }
  };

  // Обработчик удаления задачи
  const handleDeleteTask = async (id: string) => {
    if (window.confirm(t('tasks.confirmDelete'))) {
      try {
        await tasksApi.deleteTask(id);
        setTasks(tasks.filter(task => task.id !== id));
        showNotification('Задача успешно удалена', 'success');
      } catch (err) {
        console.error('Error deleting task:', err);
        showNotification('Ошибка при удалении задачи', 'error');
      }
    }
  };

  // Получение информации о статусе (иконка и классы)
  const getStatusIconAndClass = (status: string) => {
    switch (status) {
      case 'todo':
        return {
          icon: 'pending',
          bgClass: 'bg-blue-100 dark:bg-blue-900/30',
          textClass: 'text-blue-600 dark:text-blue-400',
          label: 'К выполнению'
        };
      case 'in_progress':
        return {
          icon: 'hourglass_empty',
          bgClass: 'bg-amber-100 dark:bg-amber-900/30',
          textClass: 'text-amber-600 dark:text-amber-400',
          label: 'В процессе'
        };
      case 'done':
        return {
          icon: 'check_circle',
          bgClass: 'bg-green-100 dark:bg-green-900/30',
          textClass: 'text-green-600 dark:text-green-400',
          label: 'Выполнено'
        };
      default:
        return {
          icon: 'help',
          bgClass: 'bg-gray-100 dark:bg-gray-800/50',
          textClass: 'text-gray-600 dark:text-gray-400',
          label: 'Неизвестно'
        };
    }
  };

  // Получение текста приоритета
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Не указан';
    }
  };

  // Получение информации о приоритете (иконка и классы)
  const getPriorityIconAndClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: 'priority_high',
          bgClass: 'bg-red-100 dark:bg-red-900/30',
          textClass: 'text-red-600 dark:text-red-400',
        };
      case 'medium':
        return {
          icon: 'remove',
          bgClass: 'bg-amber-100 dark:bg-amber-900/30',
          textClass: 'text-amber-600 dark:text-amber-400',
        };
      case 'low':
        return {
          icon: 'arrow_downward',
          bgClass: 'bg-green-100 dark:bg-green-900/30',
          textClass: 'text-green-600 dark:text-green-400',
        };
      default:
        return {
          icon: 'help',
          bgClass: 'bg-gray-100 dark:bg-gray-800/50',
          textClass: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  // Простые компоненты загрузки и ошибки
  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 bg-[var(--error-light)] text-white rounded-lg">{error}</div>
  );

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <span className="material-icons text-[var(--primary-color)] mr-3 text-3xl">assignment</span>
          <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('taskManagement')}
          </h1>
        </div>
        
        <div className="mt-3 sm:mt-0">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-5 py-2.5 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] shadow-sm transition-all duration-200 transform hover:-translate-y-1"
          >
            <span className="material-icons mr-2 text-sm">add</span>
            {t('tasks.addTask')}
          </button>
        </div>
      </div>
      
      {/* Статистика задач */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4 icon-circle">
              <span className="material-icons text-blue-600 dark:text-blue-400">pending</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('tasks.statuses.pending')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{todoTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-3 mr-4 icon-circle">
              <span className="material-icons text-amber-600 dark:text-amber-400">hourglass_empty</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('tasks.statuses.inProgress')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{inProgressTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4 icon-circle">
              <span className="material-icons text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('tasks.statuses.completed')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{doneTasks.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Фильтры и поиск */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl mb-6 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                <span className="material-icons text-current text-xl">search</span>
              </span>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] bg-white dark:bg-[var(--dark-bg-primary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
                placeholder={t('tasks.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] bg-white dark:bg-[var(--dark-bg-primary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
              >
                <option value="all">{t('tasks.statuses.all')}</option>
                <option value="todo">{t('tasks.statuses.pending')}</option>
                <option value="in_progress">{t('tasks.statuses.inProgress')}</option>
                <option value="done">{t('tasks.statuses.completed')}</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] bg-white dark:bg-[var(--dark-bg-primary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
              >
                <option value="all">{t('tasks.priorities.all')}</option>
                <option value="high">{t('tasks.priorities.high')}</option>
                <option value="medium">{t('tasks.priorities.medium')}</option>
                <option value="low">{t('tasks.priorities.low')}</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] bg-white dark:bg-[var(--dark-bg-primary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
              >
                <option value="newest">{t('tasks.sorting.newest')}</option>
                <option value="oldest">{t('tasks.sorting.oldest')}</option>
                <option value="dueDate">{t('tasks.sorting.dueDate')}</option>
                <option value="priority">{t('tasks.sorting.priority')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Таблица задач */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl overflow-hidden border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-[var(--light-border-color)] dark:divide-[var(--dark-border-color)]">
              <thead className="bg-gray-50 dark:bg-gray-800/40">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('tasks.title')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('tasks.status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('tasks.priority')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('tasks.assignedTo')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('tasks.dueDate')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[var(--dark-bg-secondary)] divide-y divide-[var(--light-border-color)] dark:divide-[var(--dark-border-color)]">
                {filteredTasks.map((task) => {
                  const statusInfo = getStatusIconAndClass(task.status);
                  const priorityInfo = getPriorityIconAndClass(task.priority);
                  
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleOpenEditModal(task)}>
                        <div className="text-sm font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{task.title}</div>
                        <div className="text-xs text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] line-clamp-1">{task.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}>
                          <span className="material-icons text-current mr-1" style={{ fontSize: '14px' }}>{statusInfo.icon}</span>
                          {statusInfo.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.bgClass} ${priorityInfo.textClass}`}>
                          <span className="material-icons text-current mr-1" style={{ fontSize: '14px' }}>{priorityInfo.icon}</span>
                          {getPriorityText(task.priority)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{task.assignedTo || t('tasks.notAssigned')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{formatDate(task.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleOpenEditModal(task)} 
                          className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] mr-3 transition-colors"
                        >
                          <span className="material-icons" style={{ fontSize: '18px' }}>edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)} 
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-icons text-4xl text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mb-2">assignment</span>
            <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mb-4">{t('tasks.noTasks')}</p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white rounded-lg shadow-sm transition-all duration-200"
            >
              <span className="material-icons mr-1 text-sm">add</span>
              {t('tasks.addTask')}
            </button>
          </div>
        )}
      </div>
      
      {/* Модальное окно для создания/редактирования задачи */}
      <TaskModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={currentTask as any}
        mode={modalMode}
      />
    </div>
  );
};

export default TasksPage; 