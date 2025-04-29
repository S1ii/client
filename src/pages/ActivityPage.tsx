import React from 'react';
import { Typography, Container } from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import ActivityList from '../components/analytics/ActivityList';

const ActivityPage: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Container maxWidth="lg" className="py-6">
      <Typography 
        variant="h4" 
        className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}
      >
        Активность пользователя
      </Typography>
      
      <Typography 
        variant="body1" 
        className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-6`}
      >
        История ваших действий в системе
      </Typography>
      
      <ActivityList
        limit={20}
        showPagination={true}
        title="Ваша активность"
      />
    </Container>
  );
};

export default ActivityPage; 