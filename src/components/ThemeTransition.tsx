import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeTransitionProps {
  children: React.ReactNode;
}

const ThemeTransition: React.FC<ThemeTransitionProps> = ({ children }) => {
  const { theme, transitionPosition, isTransitioning } = useTheme();
  const circleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (circleRef.current && isTransitioning) {
      // Set the position of the circle to start from the position in context
      circleRef.current.style.left = `${transitionPosition.x}px`;
      circleRef.current.style.top = `${transitionPosition.y}px`;
    }
  }, [isTransitioning, transitionPosition]);

  return (
    <div className="theme-transition-container">
      {children}
      {isTransitioning && (
        <div 
          ref={circleRef}
          className={`theme-transition-circle ${theme}`}
        />
      )}
    </div>
  );
};

export default ThemeTransition; 