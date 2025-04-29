import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, setTransitionPosition } = useTheme();
  const { t } = useLanguage();

  const handleToggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Get the click position
    const x = e.clientX;
    const y = e.clientY;
    
    // Set the position in the theme context
    setTransitionPosition({ x, y });
    
    // Toggle the theme
    toggleTheme();
  };

  return (
    <Tooltip title={t('toggle_theme')}>
      <IconButton
        onClick={handleToggleTheme}
        color="inherit"
        className={`
          p-2 rounded-full transition-all duration-200
          ${theme === 'dark' 
            ? 'hover:bg-white/10' 
            : 'hover:bg-slate-100 border border-slate-200 bg-slate-50/50'}
        `}
        sx={{
          boxShadow: theme === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
          color: theme === 'dark' ? '#f1f5f9' : '#334155'
        }}
      >
        {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon className="text-slate-800" />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 