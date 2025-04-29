import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  Avatar,
  Button,
  Tooltip
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import MiscellaneousServicesRoundedIcon from '@mui/icons-material/MiscellaneousServicesRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Интерфейс для элементов меню
interface MenuItem {
  name: string;
  key: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  logout?: () => void;
  user?: { name: string; role: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isAdmin = false, logout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Light/dark mode classes
  const sidebarBgClass = theme === 'dark' 
    ? 'bg-slate-900/95 backdrop-blur-md border-r border-slate-800/50' 
    : 'bg-white/95 backdrop-blur-md border-r border-slate-100/70';
  const sidebarTextClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const dividerClass = theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/70';
  const activeItemBgClass = theme === 'dark' 
    ? 'bg-indigo-600/10 text-indigo-400 font-semibold' 
    : 'bg-indigo-50 text-indigo-700 font-semibold';
  const activeItemTextClass = theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700';
  const activeItemBorderClass = theme === 'dark' ? 'border-indigo-400' : 'border-indigo-600';
  const inactiveItemClass = theme === 'dark' 
    ? 'text-slate-400 hover:text-white hover:bg-white/5' 
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60';
  const footerTextClass = theme === 'dark' ? 'text-slate-500' : 'text-slate-500';


  // Handle menu items based on user role
  useEffect(() => {
    const baseMenuItems: MenuItem[] = [
      { name: t('nav_dashboard'), key: 'nav_dashboard', path: '/dashboard', icon: <DashboardRoundedIcon color="inherit" /> },
      { name: t('nav_tasks'), key: 'nav_tasks', path: '/tasks', icon: <AssignmentRoundedIcon color="inherit" /> },
      { name: t('nav_clients'), key: 'nav_clients', path: '/clients', icon: <PeopleAltRoundedIcon color="inherit" /> },
      { name: t('nav_organizations'), key: 'nav_organizations', path: '/organizations', icon: <BusinessRoundedIcon color="inherit" /> },
      { name: t('nav_analytics'), key: 'nav_analytics', path: '/analytics', icon: <BarChartRoundedIcon color="inherit" /> },
    ];

    // If admin, add admin panel access
    if (isAdmin) {
      baseMenuItems.push({ 
        name: t('nav_admin'),
        key: 'nav_admin',
        path: '/admin', 
        icon: <MiscellaneousServicesRoundedIcon color="inherit" />,
      });
    }

    setMenuItems(baseMenuItems);
  }, [isAdmin, t]);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const sidebarContent = (
    <Box className={`h-full flex flex-col ${sidebarBgClass} ${sidebarTextClass} transition-all duration-300 max-w-[280px]`}>
      <Divider className={dividerClass} />
      
      {/* User profile section */}
      <Box className="px-4 py-4">
        <Box className="flex flex-col items-center mb-3 p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30 shadow-sm transition-all duration-300 hover:shadow-md">
          <Avatar
            className="mb-2 w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 border-4 border-white/80 dark:border-slate-900/80 shadow-lg transform transition-transform duration-300 hover:scale-105"
          >
            {user?.name ? user.name.charAt(0) : 'A'}
          </Avatar>
          <Box className="text-center">
            <Box className="font-semibold text-lg">{user?.name || 'Admin'}</Box>
            <Box className={`text-xs ${footerTextClass} mt-0.5 opacity-70`}>
              {isAdmin ? t('profile_admin') : t('profile_user')}
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Navigation menu with improved styling */}
      <List className="flex-grow px-3 space-y-1 sidebar-nav">
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              className={`
                rounded-xl transition-all duration-200 my-1 group
                ${isActive(item.path)
                  ? `${activeItemBgClass} shadow-sm`
                  : `${inactiveItemClass}`
                }
              `}
            >
              <div className={`absolute h-full w-1 left-0 rounded-full ${isActive(item.path) ? activeItemBorderClass : 'opacity-0'} transition-all duration-300`}></div>
              <ListItemIcon
                className={`transition-all duration-200 ${isActive(item.path) ? activeItemTextClass : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} group-hover:scale-110`}
                sx={{ color: 'inherit' }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  className: 'font-medium',
                }}
              />
              {isActive(item.path) && (
                <div className="absolute right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse-slow"></div>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Support and logout section */}
      <Box className="px-4 py-5 space-y-3">
                
        <Tooltip title={t('nav_settings')}>
          <Button 
            variant="outlined"
            color="inherit"
            startIcon={<SettingsRoundedIcon />}
            className={`${theme === 'dark' ? 'text-slate-400 hover:text-white border-slate-700' : 'text-slate-500 hover:text-slate-800 border-slate-200'} w-full justify-start text-sm font-normal mb-3 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50/10`}
            onClick={() => handleNavigate('/settings')}
          >
            {t('nav_settings')}
          </Button>
        </Tooltip>
        
        <Tooltip title={t('btn_logout')}>
          <Button 
            variant="outlined"
            color="inherit"
            startIcon={<LogoutRoundedIcon />}
            className={`${theme === 'dark' ? 'text-slate-400 hover:text-white border-slate-700' : 'text-slate-500 hover:text-slate-800 border-slate-200'} w-full justify-start text-sm font-normal transition-all duration-200 hover:border-red-300 hover:bg-red-50/10`}
            onClick={handleLogout}
          >
            {t('btn_logout')}
          </Button>
        </Tooltip>
      </Box>
      
      {/* Footer copyright */}
      <Box className={`p-4 text-xs ${footerTextClass} text-center opacity-60`}>
        {t('copyright')}
      </Box>
    </Box>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        className: `${sidebarBgClass} ${sidebarTextClass} shadow-xl w-[280px] transition-all duration-300`,
      }}
    >
      {sidebarContent}
    </Drawer>
  ) : (
    <Box
      component="aside"
      className={`hidden md:block fixed top-0 left-0 bottom-0 transition-all duration-300 z-30`}
    >
      {sidebarContent}
    </Box>
  );
};

export default Sidebar; 