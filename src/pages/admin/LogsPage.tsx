import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Snackbar, 
  Alert 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SystemLogs } from '../../components/admin';
import { logsService } from '../../services/api/logsService';

const LogsPage: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  const handleClearLogs = async () => {
    try {
      setLoading(true);
      await logsService.clearLogs();
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Логи успешно очищены',
        severity: 'success',
      });
      // Здесь нужно будет обновить компонент SystemLogs
      // В реальном приложении лучше использовать React.useRef для доступа к методам компонента,
      // но для упрощения просто перезагрузим страницу через 1 секунду
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Ошибка при очистке логов:', error);
      setSnackbar({
        open: true,
        message: 'Не удалось очистить логи. Пожалуйста, попробуйте позже.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Container maxWidth="lg" className="py-6">
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography 
            variant="h4" 
            className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}
          >
            Системные логи
          </Typography>
          
          <Typography 
            variant="body1" 
            className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
          >
            Просмотр и управление системными логами
          </Typography>
        </div>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Очистить логи
        </Button>
      </Box>
      
      <SystemLogs
        limit={25}
        showFilters={true}
      />
      
      {/* Диалог подтверждения очистки логов */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Очистка системных логов</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите очистить все системные логи? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleClearLogs} color="error" autoFocus disabled={loading}>
            {loading ? 'Очистка...' : 'Очистить логи'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомление */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LogsPage; 