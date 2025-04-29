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
  Chip,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { adminApi, LogEntry } from '../../services/apiService';

interface SystemLogsProps {
  limit?: number;
  showFilters?: boolean;
  title?: string;
}

const SystemLogs: React.FC<SystemLogsProps> = ({
  limit = 100,
  showFilters = true,
  title = 'Системные логи'
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Состояние данных
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтрация и поиск
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Классы для темы
  const cardBgClass = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const cardTextClass = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const subTextClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-500';
  const tableBorderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  
  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, searchQuery]);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const options: any = {
        limit: logsPerPage,
        offset: (currentPage - 1) * logsPerPage
      };
      
      if (actionFilter && actionFilter !== 'all') {
        options.action = actionFilter;
      }
      
      if (searchQuery) {
        options.searchQuery = searchQuery;
      }
      
      const data = await adminApi.getLogs(actionFilter);
      setLogs(data);
      
      // В реальном приложении тут должно быть получение общего количества для пагинации
      // Здесь просто имитация
      const calculatedTotalPages = Math.ceil(data.length / logsPerPage) || 1;
      setCurrentPage(currentPage);
      setTotalPages(calculatedTotalPages);
      
    } catch (err: any) {
      console.error('Ошибка при загрузке логов:', err);
      setError('Не удалось загрузить системные логи');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };
  
  const resetFilters = () => {
    setActionFilter('all');
    setSearchQuery('');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'logout':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'create':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'update':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'view':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };
  
  // Фильтрация логов
  const filteredLogs = logs
    .filter(log => {
      // Фильтрация по действию
      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false;
      }
      
      // Поиск по тексту
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return (
          (log.userName && log.userName.toLowerCase().includes(lowerQuery)) ||
          (log.action && log.action.toLowerCase().includes(lowerQuery)) ||
          (log.details && log.details.toLowerCase().includes(lowerQuery)) ||
          (log.resourceType && log.resourceType.toLowerCase().includes(lowerQuery))
        );
      }
      
      return true;
    })
    .slice(0, limit);
  
  // Пагинация
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  
  // Обработчики пагинации
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Обработчик очистки логов
  const handleClearLogs = async () => {
    if (!window.confirm('Вы уверены, что хотите очистить все системные логи? Это действие нельзя отменить.')) {
      return;
    }
    
    try {
      await adminApi.clearLogs();
      setLogs([]);
      alert('Логи успешно очищены');
    } catch (err) {
      console.error('Error clearing logs:', err);
      alert('Не удалось очистить логи');
    }
  };
  
  if (loading && logs.length === 0) {
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
          <Button color="inherit" size="small" onClick={fetchLogs}>
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
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6" className={`${cardTextClass} font-medium`}>
          {title}
        </Typography>
        
        <Box className="flex gap-2">
          {showFilters && (
            <Tooltip title="Показать/скрыть фильтры">
              <IconButton 
                size="small" 
                onClick={resetFilters}
                className={actionFilter !== 'all' || searchQuery ? 'bg-blue-100 dark:bg-blue-900' : ''}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Обновить">
            <IconButton size="small" onClick={fetchLogs}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {showFilters && (
        <Box className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/30 rounded-md">
          <Stack spacing={2} direction="column">
            <Stack spacing={2} direction={{xs: 'column', sm: 'row'}} sx={{width: '100%'}}>
              <FormControl size="small" sx={{minWidth: '200px', flex: 1}}>
                <InputLabel id="action-filter-label">Действие</InputLabel>
                <Select
                  labelId="action-filter-label"
                  id="action-filter"
                  value={actionFilter}
                  label="Действие"
                  onChange={(e) => setActionFilter(e.target.value)}
                  className={`${theme === 'dark' ? 'bg-slate-700/50' : 'bg-white'}`}
                >
                  <MenuItem value="all">Все действия</MenuItem>
                  <MenuItem value="login">Вход</MenuItem>
                  <MenuItem value="logout">Выход</MenuItem>
                  <MenuItem value="create">Создание</MenuItem>
                  <MenuItem value="update">Изменение</MenuItem>
                  <MenuItem value="delete">Удаление</MenuItem>
                  <MenuItem value="view">Просмотр</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Поиск"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${theme === 'dark' ? 'bg-slate-700/50' : 'bg-white'}`}
                sx={{flex: 1}}
              />
            </Stack>
            
            <Button
              variant="outlined"
              startIcon={<ClearAllIcon />}
              onClick={resetFilters}
              sx={{minWidth: '120px'}}
            >
              Сбросить
            </Button>
          </Stack>
        </Box>
      )}
      
      {logs.length === 0 ? (
        <Typography className={subTextClass} align="center" p={3}>
          Нет системных логов за указанный период
        </Typography>
      ) : (
        <>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>Пользователь</TableCell>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>Действие</TableCell>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>Ресурс</TableCell>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>Время</TableCell>
                  <TableCell className={`${tableBorderClass} border-b font-medium ${cardTextClass}`}>IP-адрес</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className={`${tableBorderClass} border-b ${cardTextClass}`}>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.userName || 'Система'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {log.userId || 'н/д'}
                      </div>
                    </TableCell>
                    <TableCell className={`${tableBorderClass} border-b ${cardTextClass}`}>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      {log.details && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {log.details}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={`${tableBorderClass} border-b ${cardTextClass}`}>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {log.resourceType || 'н/д'}
                      </div>
                      {log.resourceId && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {log.resourceId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={`${tableBorderClass} border-b ${cardTextClass}`}>
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell className={`${tableBorderClass} border-b ${cardTextClass}`}>
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalPages > 1 && (
            <Box className="flex justify-center mt-4">
              <Pagination 
                count={totalPages} 
                page={currentPage} 
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

export default SystemLogs; 