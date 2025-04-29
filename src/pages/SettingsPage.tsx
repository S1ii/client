import React from 'react';
import { 
  Typography, 
  Slider, 
  Switch,
  Button, 
  Divider
} from '@mui/material';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <span className="material-icons text-[var(--primary-color)] mr-3 text-3xl">settings</span>
          <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('settings')}
          </h1>
        </div>
      </div>

      {/* Статистика настроек */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4 icon-circle">
              <span className="material-icons text-blue-600 dark:text-blue-400">palette</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('currentTheme')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {theme === 'dark' ? t('darkTheme') : t('lightTheme')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4 icon-circle">
              <span className="material-icons text-green-600 dark:text-green-400">language</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('currentLanguage')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {language === 'ru' ? 'Русский' : language === 'en' ? 'English' : 'Қазақша'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Настройки темы и режима отображения */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-6 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] mb-6">
        <div className="flex items-center mb-4">
          <span className="material-icons text-[var(--primary-color)] mr-3">palette</span>
          <h2 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('appearance')}
          </h2>
        </div>
        <Divider className="mb-4" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-[var(--primary-color)] mr-3">dark_mode</span>
              <span className="text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {t('darkTheme')}
              </span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onChange={toggleTheme}
              color="primary"
            />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-[var(--primary-color)] mr-3">density_small</span>
              <span className="text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {t('compactMode')}
              </span>
            </div>
            <Switch
              checked={settings.compactMode}
              onChange={(e) => updateSettings({ compactMode: e.target.checked })}
              color="primary"
            />
          </div>
        </div>
      </div>
      
      {/* Настройки шрифта */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-6 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] mb-6">
        <div className="flex items-center mb-4">
          <span className="material-icons text-[var(--primary-color)] mr-3">format_size</span>
          <h2 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('fontSize')}
          </h2>
        </div>
        <Divider className="mb-4" />
        
        <div className="px-3 py-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
          <Typography className="mb-2 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {settings.fontSize}px
          </Typography>
          <Slider
            value={settings.fontSize}
            min={12}
            max={20}
            step={1}
            marks={[
              { value: 12, label: '12px' },
              { value: 14, label: '14px' },
              { value: 16, label: '16px' },
              { value: 18, label: '18px' },
              { value: 20, label: '20px' }
            ]}
            onChange={(_, value) => updateSettings({ fontSize: value as number })}
            color="primary"
          />
        </div>
      </div>
      
      {/* Настройки анимаций */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-6 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] mb-6">
        <div className="flex items-center mb-4">
          <span className="material-icons text-[var(--primary-color)] mr-3">animation</span>
          <h2 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('animations')}
          </h2>
        </div>
        <Divider className="mb-4" />
        
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
          <div className="flex items-center">
            <span className="material-icons text-[var(--primary-color)] mr-3">auto_awesome</span>
            <span className="text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
              {t('useAnimations')}
            </span>
          </div>
          <Switch
            checked={settings.animations}
            onChange={(e) => updateSettings({ animations: e.target.checked })}
            color="primary"
          />
        </div>
      </div>
      
      {/* Настройки языка */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-6 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] mb-6">
        <div className="flex items-center mb-4">
          <span className="material-icons text-[var(--primary-color)] mr-3">language</span>
          <h2 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('interfaceLanguage')}
          </h2>
        </div>
        <Divider className="mb-4" />
        
        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
          <button 
            className={`px-6 py-2.5 rounded-lg transition-all ${
              language === 'ru' 
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-white dark:bg-slate-700 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] border border-gray-200 dark:border-slate-600'
            }`}
            onClick={() => setLanguage('ru')}
          >
            Русский
          </button>
          <button 
            className={`px-6 py-2.5 rounded-lg transition-all ${
              language === 'en' 
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-white dark:bg-slate-700 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] border border-gray-200 dark:border-slate-600'
            }`}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          {language === 'kz' && (
            <button 
              className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-lg"
              onClick={() => setLanguage('kz')}
            >
              Қазақша
            </button>
          )}
        </div>
      </div>

      {/* Кнопка сброса настроек */}
      <div className="flex justify-end">
        <Button 
          variant="outlined" 
          color="error" 
          onClick={resetSettings}
          className="px-6 py-2.5 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
          startIcon={<span className="material-icons">restart_alt</span>}
        >
          {t('resetAllSettings')}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage; 