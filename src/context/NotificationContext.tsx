import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  showNotification: (message: string, severity?: NotificationSeverity) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<NotificationSeverity>('success');

  const showNotification = (message: string, severity: NotificationSeverity = 'success') => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '0.5rem',
            ...(severity === 'success' && {
              backgroundColor: 'var(--success-color, #10b981)',
              color: 'white'
            }),
            ...(severity === 'error' && {
              backgroundColor: 'var(--error-color, #ef4444)',
              color: 'white'
            }),
            ...(severity === 'warning' && {
              backgroundColor: 'var(--warning-color, #f59e0b)',
              color: 'white'
            }),
            ...(severity === 'info' && {
              backgroundColor: 'var(--primary-color, #3b82f6)',
              color: 'white'
            }),
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white',
              opacity: 0.7,
              '&:hover': {
                opacity: 1
              }
            }
          }}
          className="font-medium"
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}; 