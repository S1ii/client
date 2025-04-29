import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Task, tasksApi } from '../services/apiService';
import { ClientModal } from '../components/Clients';
import { OrganizationModal } from '../components/Organizations';
import { useTheme } from '../context/ThemeContext';
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
} from '@mui/icons-material';

const DashboardLayoutPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState<boolean>(false);
  const [organizationModalOpen, setOrganizationModalOpen] = useState<boolean>(false);
  const { theme } = useTheme();

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

  return (
    <Box className="p-6">
      <Typography variant="h4" className="mb-8">
        Панель управления
      </Typography>
      
      <Stack 
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        className="mb-10"
      >
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]"
            onClick={handleOpenClientModal}
            sx={{
              height: '180px',
              background: theme === 'dark' 
                ? 'linear-gradient(to right, #1e293b, #334155)' 
                : 'linear-gradient(to right, #e0f2fe, #dbeafe)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <CardContent className="h-full flex flex-col justify-between p-6">
              <Box className="flex justify-between items-start">
                <Typography variant="h5" component="div" className="font-bold dark:text-white">
                  Добавить клиента
                </Typography>
                <PersonIcon sx={{ fontSize: 40 }} className="text-blue-600" />
              </Box>
              <Box className="mt-4">
                <Typography variant="body1" className="mb-2 dark:text-gray-300">
                  Создайте нового клиента в системе
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  Добавить
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]"
            onClick={handleOpenOrganizationModal}
            sx={{
              height: '180px',
              background: theme === 'dark' 
                ? 'linear-gradient(to right, #1e293b, #334155)' 
                : 'linear-gradient(to right, #e0f2fe, #dbeafe)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <CardContent className="h-full flex flex-col justify-between p-6">
              <Box className="flex justify-between items-start">
                <Typography variant="h5" component="div" className="font-bold dark:text-white">
                  Добавить организацию
                </Typography>
                <BusinessIcon sx={{ fontSize: 40 }} className="text-indigo-600" />
              </Box>
              <Box className="mt-4">
                <Typography variant="body1" className="mb-2 dark:text-gray-300">
                  Создайте новую организацию в системе
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  Добавить
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>
      
      <Card 
        className="mb-6"
        sx={{
          backgroundColor: theme === 'dark' ? 'rgb(30, 41, 59)' : 'white',
          color: theme === 'dark' ? 'white' : 'inherit',
          boxShadow: theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : undefined,
        }}
      >
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5">Задания</Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleViewAllTasks}
              sx={{
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: theme === 'dark' ? 'white' : undefined,
                '&:hover': {
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : undefined,
                }
              }}
            >
              Все задания
            </Button>
          </Box>
          
          {loading ? (
            <Typography>Загрузка...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer 
              component={Paper}
              className="overflow-x-auto"
              sx={{
                backgroundColor: theme === 'dark' ? 'rgb(30, 41, 59)' : 'white',
                color: theme === 'dark' ? 'white' : 'inherit',
              }}
            >
              <Table size="medium">
                <TableHead>
                  <TableRow
                    sx={{
                      '& .MuiTableCell-root': {
                        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined,
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                      }
                    }}
                  >
                    <TableCell>Название</TableCell>
                    <TableCell>Приоритет</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Срок</TableCell>
                    <TableCell>Назначено</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TableRow 
                        key={task.id} 
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined,
                          },
                          '& .MuiTableCell-root': {
                            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined,
                            color: theme === 'dark' ? 'white' : undefined,
                          }
                        }}
                      >
                        <TableCell>{task.title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.priority} 
                            color={getPriorityColor(task.priority) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center">
                            {getStatusIcon(task.status)}
                            <Typography variant="body2" className="ml-2">
                              {task.status === 'todo' ? 'К выполнению' : 
                               task.status === 'in_progress' ? 'В процессе' : 'Выполнено'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(task.dueDate)}</TableCell>
                        <TableCell>{task.assignedTo || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow
                      sx={{
                        '& .MuiTableCell-root': {
                          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined,
                          color: theme === 'dark' ? 'white' : undefined,
                        }
                      }}
                    >
                      <TableCell colSpan={5} align="center">
                        Нет доступных заданий
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Модальные окна */}
      <ClientModal 
        open={clientModalOpen} 
        onClose={handleCloseClientModal}
        onSave={() => {
          // Логика сохранения клиента
          handleCloseClientModal();
        }}
        title="Добавление нового клиента"
      />
      
      <OrganizationModal
        open={organizationModalOpen}
        onClose={handleCloseOrganizationModal}
        onSave={() => {
          // Логика сохранения организации
          handleCloseOrganizationModal();
        }}
        title="Добавление новой организации"
      />
    </Box>
  );
};

export default DashboardLayoutPage; 