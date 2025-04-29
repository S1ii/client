import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Pagination,
  Chip
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { activityService, Activity } from '../../services/api/activityService';

interface ActivityListProps {
  limit?: number;
  showPagination?: boolean;
  title?: string;
  objectType?: string;
  objectId?: string;
}

const ActivityList: React.FC<ActivityListProps> = ({
  limit = 10,
  showPagination = true,
  title = 'Последняя активность',
  objectType,
  objectId
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const cardBgClass = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const cardTextClass = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const subTextClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-500';
  const tableBorderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  
  useEffect(() => {
    fetchActivities();
  }, [page, objectType, objectId]);
  
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Activity[];
      const offset = (page - 1) * limit;
      
      if (objectType && objectId) {
        data = await activityService.getObjectActivity(objectType, objectId);
      } else {
        data = await activityService.getUserActivity(limit, offset);
      }
      
      setActivities(data);
      
      // В реальном приложении тут должно быть получение общего количества для пагинации
      // Здесь просто имитация
      setTotalPages(Math.ceil(data.length / limit) || 1);
      
    } catch (err: any) {
      console.error('Ошибка при загрузке активности:', err);
      setError('Не удалось загрузить данные о пользовательской активности');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getActivityType = (activity: Activity) => {
    switch (activity.type) {
      case 'login':
        return 'Вход в систему';
      case 'logout':
        return 'Выход из системы';
      case 'create':
        return 'Создание';
      case 'update':
        return 'Обновление';
      case 'delete':
        return 'Удаление';
      case 'view':
        return 'Просмотр';
      default:
        return activity.type;
    }
  };
  
  const getActivityTarget = (activity: Activity) => {
    if (!activity.target) return '';
    
    switch (activity.target) {
      case 'user':
        return 'Пользователь';
      case 'service':
        return 'Услуга';
      case 'client':
        return 'Клиент';
      case 'task':
        return 'Задача';
      case 'settings':
        return 'Настройки';
      case 'organization':
        return 'Организация';
      default:
        return activity.target;
    }
  };
  
  const getActivityChipColor = (activity: Activity) => {
    switch (activity.type) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
        return 'error';
      case 'login':
      case 'logout':
        return 'default';
      case 'view':
        return 'primary';
      default:
        return 'default';
    }
  };
  
  if (loading && activities.length === 0) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert 
        severity="error" 
        className="mb-4"
        action={
          <Button color="inherit" size="small" onClick={fetchActivities}>
            Повторить
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }
  
  return (
    <Paper className={`${cardBgClass} rounded-lg shadow-sm p-4 mb-6`} elevation={0}>
      <Typography variant="h6" className={`${cardTextClass} font-medium mb-4`}>
        {title}
      </Typography>
      
      {activities.length === 0 ? (
        <Typography className={subTextClass} align="center" p={3}>
          Нет данных об активности
        </Typography>
      ) : (
        <>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>Действие</TableCell>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>Объект</TableCell>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>Детали</TableCell>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity._id}>
                    <TableCell className={`${tableBorderClass} border-b ${cardTextClass}`}>
                      <Chip 
                        label={getActivityType(activity)} 
                        size="small"
                        color={getActivityChipColor(activity) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell className={`${tableBorderClass} border-b ${cardTextClass}`}>
                      {getActivityTarget(activity)}
                    </TableCell>
                    <TableCell className={`${tableBorderClass} border-b ${cardTextClass}`}>
                      {activity.action}
                    </TableCell>
                    <TableCell className={`${tableBorderClass} border-b ${subTextClass}`}>
                      {formatDate(activity.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {showPagination && totalPages > 1 && (
            <Box className="flex justify-center mt-4">
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ActivityList; 