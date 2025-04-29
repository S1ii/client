import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeType = 'light' | 'dark';

interface Position {
  x: number;
  y: number;
}

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
  setThemeMode: (theme: ThemeType) => void;
  transitionPosition: Position;
  setTransitionPosition: (position: Position) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeType) || 'light';
  });
  
  const [transitionPosition, setTransitionPosition] = useState<Position>({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', theme);
    
    // Применяем класс темы к корневому элементу html
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, 50); // Slight delay to allow animation to start

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const setThemeMode = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        setThemeMode, 
        transitionPosition, 
        setTransitionPosition,
        isTransitioning
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 