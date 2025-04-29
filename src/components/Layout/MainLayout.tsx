import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface MainLayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  user: { name: string; role: string } | null;
  logout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  isAuthenticated,
  user,
  logout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if the viewport width is for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px is the 'sm' breakpoint in Tailwind
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Light/dark mode classes
  const bgClass = theme === 'dark' 
    ? 'bg-slate-900' 
    : 'bg-slate-50';
  
  const textClass = theme === 'dark' ? 'text-slate-50' : 'text-slate-900';

  return (
    <Box className={`flex h-screen ${bgClass} ${textClass}`}>
      {/* Статический фон вместо анимированного */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full"></div>
      </div>

      {isAuthenticated && (
        <>
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isAdmin={isAdmin}
            logout={logout}
            user={user}
          />
          
          <Box className="flex flex-col flex-1 overflow-hidden relative z-10 md:ml-[280px]">
            <Header
              isAuthenticated={isAuthenticated}
              user={user}
              logout={logout}
            >
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleSidebarToggle}
                  className="mr-2 p-2 hover:bg-white/10 rounded-xl"
                >
                  <MenuIcon className={theme === 'dark' ? 'text-slate-50' : 'text-slate-900'} />
                </IconButton>
              )}
            </Header>
            
            <Box className="flex-1 p-4 md:p-6 overflow-auto">
              <div className="w-full max-w-6xl mx-auto">
                {children}
              </div>
            </Box>
          </Box>
        </>
      )}

      {!isAuthenticated && (
        <Box className="flex-1 relative overflow-hidden">
          {/* Упрощенный статический фон */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-10 right-10 bg-gradient-to-bl from-indigo-600/10 to-transparent h-[35vh] w-[30vw] rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 bg-gradient-to-tr from-purple-600/10 to-transparent h-[45vh] w-[40vw] rounded-full"></div>
            <div className="absolute bottom-40 right-20 bg-gradient-to-tl from-blue-600/10 to-transparent h-[40vh] w-[35vw] rounded-full"></div>
          </div>
          
          {/* Content wrapper */}
          <div className="relative z-10 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6">
              {children}
            </div>
          </div>
        </Box>
      )}
    </Box>
  );
};

export default MainLayout; 