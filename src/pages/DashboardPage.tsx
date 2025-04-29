import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { Task, tasksApi } from '../services/apiService';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Divider, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Chip, 
  ListItemSecondaryAction, 
  IconButton,
  Badge,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon, 
  Business as BusinessIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  TaskAlt as TaskAltIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import PageHeader from '../components/ui/PageHeader';

interface DashboardStats {
  activeClients: number;
  totalTasks: number;
  completedTasks: number;
  totalIncome: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  user: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  assignee?: string;
}

// Начальные значения для статистики
const initialStats: DashboardStats = {
  activeClients: 0,
  totalTasks: 0,
  completedTasks: 0,
  totalIncome: 0
};

const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('month');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/analytics/dashboard?timeframe=${timeframe}`);
        
        if (response.data.success) {
          setStats(response.data.stats || initialStats);
          setActivities(response.data.activities || []);
          setUpcomingTasks(response.data.upcomingTasks || []);
          setError(null);
        } else {
          throw new Error(response.data.message || 'Error fetching dashboard data');
        }
      } catch (err: any) {
        console.error('Dashboard API error, falling back to tasks API:', err.message);
        setError(err.message);
        
        // Try to fetch tasks using tasksApi
        try {
          const tasksData = await tasksApi.getTasks();
          
          // Convert API tasks to UpcomingTask format
          const formattedTasks = tasksData.map(task => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate || new Date().toISOString(),
            priority: task.priority as 'high' | 'medium' | 'low',
            status: mapTaskStatus(task.status),
            assignee: task.assignedTo
          }));
          
          setUpcomingTasks(formattedTasks);
          
          // Update stats based on tasks
          setStats({
            ...stats,
            totalTasks: tasksData.length,
            completedTasks: tasksData.filter(t => t.status === 'done').length
          });
        } catch (taskErr) {
          console.error('Error fetching tasks:', taskErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  // Map task status from API format to dashboard format
  const mapTaskStatus = (status: string): string => {
    switch (status) {
      case 'todo': return 'pending';
      case 'in_progress': return 'in-progress';
      case 'done': return 'completed';
      default: return status;
    }
  };

  // Для демонстрации, если API недоступен
  useEffect(() => {
    // Если данные не загрузились через 1 секунду, заполняем демо-данными
    const timer = setTimeout(() => {
      if (loading) {
        setStats({
          activeClients: 42,
          totalTasks: 78,
          completedTasks: 53,
          totalIncome: 128500
        });
        
        setActivities([
          {
            id: '1',
            type: 'client',
            title: 'Новый клиент: ООО "Технологии будущего"',
            date: '2023-05-15T10:30:00',
            user: 'Анна Смирнова'
          },
          {
            id: '2',
            type: 'task',
            title: 'Завершена задача: Презентация проекта',
            date: '2023-05-14T16:45:00',
            user: 'Иван Петров'
          },
          {
            id: '3',
            type: 'payment',
            title: 'Получен платеж: 35 000 ₽',
            date: '2023-05-14T14:20:00',
            user: 'Система'
          }
        ]);
        
        setUpcomingTasks([
          {
            id: '1',
            title: 'Подготовить отчет о продажах',
            dueDate: '2023-10-25T17:00:00',
            priority: 'high',
            status: 'pending',
            assignee: 'Александр И.'
          },
          {
            id: '2',
            title: 'Встреча с новым клиентом',
            dueDate: '2023-10-26T11:00:00',
            priority: 'medium',
            status: 'pending',
            assignee: 'Мария П.'
          },
          {
            id: '3',
            title: 'Обновить маркетинговую стратегию',
            dueDate: '2023-10-28T15:30:00',
            priority: 'low',
            status: 'pending',
            assignee: 'Иван С.'
          },
          {
            id: '4',
            title: 'Ревизия текущих проектов',
            dueDate: '2023-10-30T12:00:00',
            priority: 'medium',
            status: 'completed',
            assignee: 'Вы'
          }
        ]);
        
        setLoading(false);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'var(--error-color)';
      case 'medium':
        return 'var(--warning-color)';
      case 'low':
        return 'var(--success-color)';
      default:
        return 'var(--primary-light)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'pending':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'in-progress':
        return 'text-amber-500 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'client':
        return 'person_add';
      case 'task':
        return 'task_alt';
      case 'payment':
        return 'payments';
      default:
        return 'info';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCompletionPercentage = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  const getNameInfo = (name: string) => {
    const parts = name.split(' ');
    return {
      initials: parts.map(part => part[0]).join('')
    };
  };

  const getAvatarStyle = (status: string, name: string) => {
    return {
      backgroundColor: status === 'completed' ? 'var(--success-color)' : 'var(--primary-color)'
    };
  };

  // Filter activities based on search term and activity type
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activityTypeFilter === 'all' || activity.type === activityTypeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* PageHeader component to match Tasks and Clients pages */}
      <PageHeader
        title={t('dashboard')}
        description={t('dashboardDescription')}
        icon={<DashboardIcon />}
        actions={
          <FormControl variant="outlined" className="min-w-[120px]">
            <InputLabel id="timeframe-select-label">Период</InputLabel>
            <Select
              labelId="timeframe-select-label"
              id="timeframe-select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Период"
              size="small"
              className="bg-white dark:bg-[var(--dark-bg-secondary)]"
            >
              <MenuItem value="day">День</MenuItem>
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="year">Год</MenuItem>
            </Select>
          </FormControl>
        }
      />

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Active Clients */}
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-blue-600 dark:text-blue-400">people</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('activeClients')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{stats.activeClients}</p>
            </div>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-purple-600 dark:text-purple-400">assignment</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('totalTasks')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-green-600 dark:text-green-400">task_alt</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('completedTasks')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{stats.completedTasks}</p>
              <p className="text-xs text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                {getCompletionPercentage()}% {t('completion')}
              </p>
            </div>
          </div>
          </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-amber-600 dark:text-amber-400">payments</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('totalIncome')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{formatCurrency(stats.totalIncome)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks Section */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-sm border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="p-4 border-b border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {t('upcomingTasks')}
              </h2>
            </div>
          </div>
          <div className="p-0">
                    {loading ? (
              <div className="p-4 text-center text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                {t('loading')}...
              </div>
            ) : upcomingTasks.length > 0 ? (
              <div className="divide-y divide-[var(--light-border-color)] dark:divide-[var(--dark-border-color)]">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors flex items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                        {task.title}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                        <span className="material-icons text-xs mr-1">event</span>
                        <span>{formatDate(task.dueDate)}</span>
                        
                        {task.assignee && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="material-icons text-xs mr-1">person</span>
                            <span>{task.assignee}</span>
                          </>
                        )}
                      </div>
                                  </div>
                    <div className="flex gap-2">
                      <span 
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
                      >
                        {task.status === 'completed' ? t('completed') : 
                         task.status === 'pending' ? t('pending') : 
                         task.status === 'in-progress' ? t('inProgress') : task.status}
                      </span>
                      <div 
                        className="w-2 h-2 rounded-full my-auto"
                        style={{backgroundColor: getPriorityColor(task.priority)}}
                      ></div>
                    </div>
                  </div>
                ))}
                    </div>
                  ) : (
              <div className="p-4 text-center text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                {t('noUpcomingTasks')}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-sm border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="p-4 border-b border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {t('recentActivity')}
              </h2>
            </div>
            <div className="flex gap-2">
              <TextField
                placeholder={t('search')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                size="small"
                className="flex-1"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" className="min-w-[110px]">
                <InputLabel id="activity-type-label">{t('type')}</InputLabel>
                <Select
                  labelId="activity-type-label"
                  id="activity-type"
                  value={activityTypeFilter}
                  onChange={e => setActivityTypeFilter(e.target.value)}
                  label={t('type')}
                >
                  <MenuItem value="all">{t('all')}</MenuItem>
                  <MenuItem value="client">{t('client')}</MenuItem>
                  <MenuItem value="task">{t('task')}</MenuItem>
                  <MenuItem value="payment">{t('payment')}</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-4 text-center text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                {t('loading')}...
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="divide-y divide-[var(--light-border-color)] dark:divide-[var(--dark-border-color)]">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-start">
                      <span className="material-icons bg-gray-100 dark:bg-gray-800 text-[var(--primary-color)] rounded-full p-2 mr-3">
                        {getTypeIcon(activity.type)}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                          {activity.title}
                        </p>
                        <div className="mt-1 flex items-center text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                          <span className="material-icons text-xs mr-1">access_time</span>
                          <span>{formatDate(activity.date)}</span>
                          <span className="mx-2">•</span>
                          <span className="material-icons text-xs mr-1">person</span>
                          <span>{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
                {t('noRecentActivity')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 