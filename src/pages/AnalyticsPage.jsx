import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const AnalyticsPage = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  return (
    <div className="w-full max-w-6xl mx-auto py-6">
      <div className={`
        p-6 rounded-xl flex flex-col md:flex-row items-center gap-6
        ${theme === 'dark' 
          ? 'bg-slate-800/80 border border-slate-700/50' 
          : 'bg-white border border-slate-200 shadow-sm'}
        transition-all duration-200
      `}>
        <div className={`
          w-16 h-16 flex items-center justify-center rounded-full
          ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}
        `}>
          <UpdateIcon className="text-indigo-500" fontSize="large" />
        </div>
        
        <div>
          <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Доступно в следующем обновлении
          </h2>
          <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-2`}>
            Мы работаем над улучшением аналитики. Функциональность будет доступна в следующем обновлении системы.
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Ожидаемая дата выпуска: 20 декабря, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
