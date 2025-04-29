import React, { ReactNode } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  actions 
}) => {
  const { theme } = useTheme();
  
  // Классы в зависимости от темы
  const titleClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const descriptionClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  
  return (
    <Box className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <Stack direction="row" spacing={2} alignItems="center">
        {icon && (
          <Box className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h4" className={`font-bold ${titleClass}`}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" className={descriptionClass}>
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      
      {actions && (
        <Box className="flex gap-2">
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader; 