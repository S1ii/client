import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { useLanguage, LanguageType } from './LanguageContext';

interface Settings {
  fontSize: number;
  animations: boolean;
  compactMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  fontSize: 14,
  animations: true,
  compactMode: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { setThemeMode } = useTheme();
  const { setLanguage } = useLanguage();
  
  const [settings, setSettings] = useState<Settings>(() => {
    // Загружаем настройки из localStorage при инициализации
    const savedSettings = localStorage.getItem('app-settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Применяем настройки к интерфейсу
  const applySettings = (currentSettings: Settings) => {
    // Устанавливаем размер шрифта для всего приложения
    document.documentElement.style.fontSize = `${currentSettings.fontSize}px`;
    
    // Применяем настройки анимаций
    if (currentSettings.animations) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
    
    // Применяем компактный режим
    if (currentSettings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  };

  // Сохраняем настройки в localStorage при их изменении и применяем их
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  // Применяем настройки при монтировании компонента
  useEffect(() => {
    applySettings(settings);
  }, []);

  // Функция для обновления настроек
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Функция для сброса настроек
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider; 