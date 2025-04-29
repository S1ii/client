import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  isAuthenticated: boolean;
  user: { name: string; role: string } | null;
  logout: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, user, logout, children }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  // Light/dark mode classes
  const headerBgClass = theme === 'dark' 
    ? 'bg-slate-900/90 backdrop-blur-md border-b border-slate-800/50' 
    : 'bg-white/90 backdrop-blur-md border-b border-slate-100/70';
  const headerTextClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const logoClass = theme === 'dark' ? 'bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent';
  const menuItemHoverClass = theme === 'dark' ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50';

  // Background color for AppBar
  const appBarBgColor = theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';

  return (
    <AppBar 
      position="sticky" 
      className={`${headerBgClass} ${headerTextClass} shadow-none transition-all duration-300 z-20 w-full`}
      sx={{ 
        "--AppBar-background": "transparent",
        boxShadow: 'none',
        backgroundImage: 'none',
        backgroundColor: 'transparent'
      }}
    >
      <Toolbar className="flex justify-between w-full px-4 max-w-7xl mx-auto">
        <Box className="flex items-center">
          {/* Mobile menu button */}
          {children}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            className={`${logoClass} no-underline font-bold flex items-center gap-2 transition-all duration-300 hover:opacity-90`}
          >
            <span className="hidden md:block">{t('app_name')}</span>
          </Typography>
        </Box>

        
          {isAuthenticated ? (
            <Box className="flex items-center gap-2">
              <ThemeToggle />
              
              <Box className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/30 py-1.5 px-4 rounded-full transition-all duration-200">
                <Typography variant="body2" className="font-medium text-slate-800 dark:text-slate-100">
                  {user?.name}
                </Typography>
              </Box>
              <Tooltip title={t('profile')}>
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                  className={`ml-1 p-1 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'} rounded-full transition-all duration-200 hover:shadow-md`}
                >
                  <Avatar className={`
                    bg-gradient-to-br from-indigo-500 to-blue-600
                    shadow-md border-2 ${theme === 'dark' ? 'border-slate-800' : 'border-white'}
                    transition-transform duration-200 hover:scale-105
                  `}>
                    {user?.name.charAt(0) || <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  className: `${theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800'} rounded-xl overflow-hidden shadow-lg animate-scaleIn`,
                  sx: {
                    overflow: 'visible',
                    mt: 1.5,
                    minWidth: 220,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: theme === 'dark' ? 'rgb(30, 41, 59)' : 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  }
                }}
              >
                <Box className="p-4 mb-1 border-b border-slate-700/20 dark:border-slate-700/50">
                  <Avatar className={`
                    mx-auto mb-2 w-16 h-16
                    bg-gradient-to-br from-indigo-500 to-blue-600
                    shadow-md border-4 ${theme === 'dark' ? 'border-slate-800/70' : 'border-white'}
                  `}>
                    {user?.name.charAt(0) || <AccountCircleIcon />}
                  </Avatar>
                  <Typography variant="subtitle1" className="font-semibold text-center">
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} block text-center`}>
                    {user?.role === 'admin' ? t('profile_admin') : t('profile_user')}
                  </Typography>
                </Box>
                <MenuItem 
                  onClick={handleClose} 
                  component={Link} 
                  to="/dashboard"
                  className={`${menuItemHoverClass} px-4 py-2 transition-all duration-150 my-0.5 mx-1 rounded-lg`}
                >
                  <DashboardIcon fontSize="small" className="mr-2 text-blue-400" />
                  {t('nav_dashboard')}
                </MenuItem>
                <MenuItem 
                  onClick={handleClose} 
                  component={Link} 
                  to="/settings"
                  className={`${menuItemHoverClass} px-4 py-2 transition-all duration-150 my-0.5 mx-1 rounded-lg`}
                >
                  <SettingsIcon fontSize="small" className="mr-2 text-teal-400" />
                  {t('nav_settings')}
                </MenuItem>
                <Box className="px-2 pb-2 pt-1 mt-1 border-t border-slate-700/20 dark:border-slate-700/50">
                  <Button 
                    onClick={handleLogout} 
                    variant="outlined"
                    color="error"
                    startIcon={<ExitToAppIcon />}
                    fullWidth
                    className="mt-1 rounded-lg"
                    size="small"
                  >
                    {t('btn_logout')}
                  </Button>
                </Box>
              </Menu>
            </Box>
          ) : (
            <Box className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="primary"
                className="rounded-full px-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-md transition-all duration-200"
              >
                {t('btn_login')}
              </Button>
            </Box>
          )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 