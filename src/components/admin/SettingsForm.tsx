import React, { useState, useEffect } from 'react';
import { SystemSettings, adminApi } from '../../services/apiService';
import { useLanguage } from '../../context/LanguageContext';

const SettingsForm: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SystemSettings>({
    siteTitle: '',
    siteDescription: '',
    contactEmail: '',
    enableRegistration: true,
    requireEmailVerification: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableDarkMode: false,
    maintenanceMode: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Загрузка настроек
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getSettings();
        setSettings(data);
        setError(null);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Не удалось загрузить настройки системы');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseInt(value, 10) 
          : value
    });
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await adminApi.updateSettings(settings);
      setSuccessMessage('Настройки успешно сохранены');
      setTimeout(() => setSuccessMessage(null), 5000);
      setError(null);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Не удалось сохранить настройки');
      setSuccessMessage(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Настройки системы</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Общие настройки</h3>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Название сайта
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="siteTitle"
                    id="siteTitle"
                    value={settings.siteTitle}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Описание сайта
                </label>
                <div className="mt-1">
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    rows={3}
                    value={settings.siteDescription}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Контактный email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="contactEmail"
                    id="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Настройки безопасности</h3>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <div className="flex items-center">
                  <input
                    id="enableRegistration"
                    name="enableRegistration"
                    type="checkbox"
                    checked={settings.enableRegistration}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600"
                  />
                  <label htmlFor="enableRegistration" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Разрешить регистрацию
                  </label>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <div className="flex items-center">
                  <input
                    id="requireEmailVerification"
                    name="requireEmailVerification"
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600"
                  />
                  <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Требовать подтверждение email
                  </label>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Таймаут сессии (минуты)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="sessionTimeout"
                    id="sessionTimeout"
                    min="5"
                    max="1440"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Максимальное число попыток входа
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    id="maxLoginAttempts"
                    min="1"
                    max="10"
                    value={settings.maxLoginAttempts}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Настройки отображения</h3>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <div className="flex items-center">
                  <input
                    id="enableDarkMode"
                    name="enableDarkMode"
                    type="checkbox"
                    checked={settings.enableDarkMode}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600"
                  />
                  <label htmlFor="enableDarkMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Тёмная тема по умолчанию
                  </label>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <div className="flex items-center">
                  <input
                    id="maintenanceMode"
                    name="maintenanceMode"
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Режим обслуживания
                  </label>
                </div>
                {settings.maintenanceMode && (
                  <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    Внимание: Когда включен режим обслуживания, сайт будет недоступен для обычных пользователей.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm; 