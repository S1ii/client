import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '../components/Tasks/TaskCard';
import TaskModal from '../components/Tasks/TaskModal';
import { Task, tasksApi } from '../services/apiService';

// UI компоненты будут созданы позже
// Временно используем базовые HTML элементы
// import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import TableLoader from '../components/Loaders/TableLoader';
// import ErrorMessage from '../components/ErrorMessage';
// import { v4 as uuidv4 } from 'uuid';

type TaskStatus = 'todo' | 'in_progress' | 'done';

const TasksPage: React.FC = () => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Сенсоры для DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Группировка задач по статусу
  const todoTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === 'todo') : [];
  const inProgressTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === 'in_progress') : [];
  const doneTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === 'done') : [];

  // Получение цвета для приоритета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

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

  // Фильтрация задач по поисковому запросу
  const getFilteredTasks = () => {
    if (!searchTerm) return Array.isArray(tasks) ? tasks : [];
    
    return Array.isArray(tasks) 
      ? tasks.filter(task => 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];
  };

  // Получение задач по статусу
  const getTasksByStatus = (status: TaskStatus) => {
    const filteredTasks = getFilteredTasks();
    return Array.isArray(filteredTasks) 
      ? filteredTasks.filter(task => task.status === status)
      : [];
  };

  // Обработчик начала перетаскивания
  const handleDragStart = (event: DragStartEvent) => {
    if (!Array.isArray(tasks)) return;
    
    const { active } = event;
    const activeTaskId = active.id.toString();
    const task = tasks.find(task => task.id === activeTaskId);
    
    if (task) {
      setActiveTask(task);
    }
  };

  // Обработчик перетаскивания над целью
  const handleDragOver = (event: DragOverEvent) => {
    if (!Array.isArray(tasks)) return;
    
    const { active, over } = event;
    
    if (!over || !active) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    if (activeId === overId) return;
    
    const activeTask = tasks.find(task => task.id === activeId);
    const overTask = tasks.find(task => task.id === overId);
    
    if (!activeTask || !overTask) return;
    
    // Если задача перетаскивается в другую колонку
    if (activeTask.status !== overTask.status) {
      setTasks(tasks.map(task => 
        task.id === activeId 
          ? { ...task, status: overTask.status } 
          : task
      ));
    }
  };

  // Обработчик окончания перетаскивания
  const handleDragEnd = (event: DragEndEvent) => {
    if (!Array.isArray(tasks)) return;
    
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    if (activeId === overId) return;
    
    // Найти индексы задач
    const activeIndex = tasks.findIndex(task => task.id === activeId);
    const overIndex = tasks.findIndex(task => task.id === overId);
    
    // Обновить список задач с новым порядком
    const updatedTasks = arrayMove(tasks, activeIndex, overIndex);
    setTasks(updatedTasks);
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
    setLoading(true);
    
    try {
      if (modalMode === 'create') {
        // Создание новой задачи
        const newTask = await tasksApi.createTask(taskData);
        setTasks([...tasks, newTask]);
      } else if (modalMode === 'edit' && currentTask) {
        // Обновление существующей задачи
        const updatedTask = await tasksApi.updateTask(currentTask.id, taskData);
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      }
      
      setShowModal(false);
      setCurrentTask(null);
      setError(null);
    } catch (err) {
      console.error('Error saving task:', err);
      setError(modalMode === 'create' ? t('failedToCreateTask') : t('failedToUpdateTask'));
    } finally {
      setLoading(false);
    }
  };

  // Обработчик удаления задачи
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm(t('confirmDeleteTask'))) return;
    
    setLoading(true);
    
    try {
      await tasksApi.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(t('failedToDeleteTask'));
    } finally {
      setLoading(false);
    }
  };

  // Колонки статусов
  const statusColumns: { id: TaskStatus, title: string }[] = [
    { id: 'todo', title: t('todo') },
    { id: 'in_progress', title: t('inProgress') },
    { id: 'done', title: t('done') }
  ];

  // Простые компоненты загрузки и ошибки
  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
    </div>
  );
  if (error) return (
    <div className="p-4 bg-[var(--error-light)] text-white rounded-lg">{error}</div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
          {t('taskManagement')}
        </h1>
        
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
        >
          <span className="material-icons mr-1">add</span>
          {t('addTask')}
        </button>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('searchTasks')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-[var(--light-bg-secondary)] dark:bg-[var(--dark-bg-secondary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]"
        />
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusColumns.map(column => (
            <div
              key={column.id}
              className="bg-[var(--light-bg-secondary)] dark:bg-[var(--dark-bg-secondary)] rounded-lg p-4"
            >
              <h2 className="font-medium text-lg mb-4 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {column.title} ({getTasksByStatus(column.id).length})
              </h2>
              
              <div className="min-h-[200px]">
                <SortableContext
                  items={getTasksByStatus(column.id).map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {getTasksByStatus(column.id).map(task => (
                      <div 
                        key={task.id} 
                        className="relative group"
                      >
                        <TaskCard
                          id={task.id}
                          title={task.title}
                          description={task.description}
                          priority={task.priority}
                          assignedTo={task.assignedTo}
                          dueDate={task.dueDate}
                          onClick={() => handleOpenEditModal(task)}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(task);
                            }}
                            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mr-1"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(t('confirmDeleteTask'))) {
                                handleDeleteTask(task.id);
                              }
                            }}
                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          >
                            <span className="material-icons text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>
      </DndContext>
      
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