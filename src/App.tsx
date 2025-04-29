import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardLayoutPage from './pages/DashboardLayoutPage';
import ClientsPage from './pages/ClientsPage';
import TasksPage from './pages/TasksPage';
import OrganizationsPage from './pages/OrganizationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPanel from './pages/AdminPanel';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import ThemeTransition from './components/ThemeTransition';
import axios from 'axios';

// API базовый URL
axios.defaults.baseURL = 'http://localhost:5000';

// Настраиваем axios для отправки JWT токена с каждым запросом
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Устанавливаем перехватчик axios для добавления токена ко всем запросам
  useEffect(() => {
    // Добавляем глобальный перехватчик запросов
    const interceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Adding token to request:', config.url);
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Очистка перехватчика при размонтировании компонента
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Устанавливаем токен в заголовки по умолчанию для всех запросов
        try {
          // Проверяем валидность токена через API
          const response = await axios.get('/api/auth/me');
          
          if (response.data.success) {
            // Если токен валидный, устанавливаем данные пользователя
            setUser(response.data.data);
            setIsAuthenticated(true);
          } else {
            // Если токен недействителен, удаляем его
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // В случае ошибки (например, истекший токен) удаляем данные
          console.error('Auth verification error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      // В любом случае завершаем загрузку
      setLoading(false);
    };

    verifyAuth();
  }, []);

  // Функция для входа в систему
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Сохранение в localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Обновление состояния
        setIsAuthenticated(true);
        setUser(user);
      } else {
        throw new Error(response.data.message || 'Ошибка входа в систему');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Функция для выхода из системы
  const logout = async () => {
    try {
      // Вызываем API для выхода
      await axios.get('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Удаляем данные из localStorage независимо от результата запроса
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Проверка прав администратора
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-r-[var(--primary-color)] border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s', animationDelay: '0.15s' }}></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-r-transparent border-b-[var(--primary-color)] border-l-transparent animate-spin" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>
        </div>
        <h2 className="text-xl font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] mb-2">Загрузка приложения</h2>
        <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">Пожалуйста, подождите...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <NotificationProvider>
            <ThemeTransition>
              <Router>
                <MainLayout
                  isAuthenticated={isAuthenticated}
                  user={user}
                  logout={logout}
                >
                  <Routes>
                    {/* Публичные маршруты */}
                    <Route
                      path="/login"
                      element={
                        isAuthenticated ? (
                          <Navigate to="/dashboard" replace />
                        ) : (
                          <LoginPage login={login} />
                        )
                      }
                    />

                    {/* Защищенные маршруты */}
                    <Route
                      path="/dashboard"
                      element={
                        isAuthenticated ? (
                          <DashboardLayoutPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />
                    
                    <Route
                      path="/clients"
                      element={
                        isAuthenticated ? (
                          <ClientsPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />
                    
                    {/* New Client Form Route */}
                    <Route
                      path="/clients/new"
                      element={
                        isAuthenticated ? (
                          <ClientsPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />

                    {/* Client Detail Route */}
                    <Route
                      path="/clients/:id"
                      element={
                        isAuthenticated ? (
                          <ClientsPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />

                    {/* Client Edit Route */}
                    <Route
                      path="/clients/:id/edit"
                      element={
                        isAuthenticated ? (
                          <ClientsPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />
                    
                    <Route
                      path="/tasks"
                      element={
                        isAuthenticated ? (
                          <TasksPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />
                    
                    
                    <Route
                      path="/organizations"
                      element={
                        isAuthenticated ? (
                          <OrganizationsPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />
                    
                    <Route
                      path="/analytics"
                      element={
                        isAuthenticated ? (
                          <AnalyticsPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />
                    
                    {/* Маршрут для администратора */}
                    <Route
                      path="/admin"
                      element={
                        isAuthenticated && isAdmin ? (
                          <AdminPanel />
                        ) : (
                          <Navigate to="/dashboard" replace />
                        )
                      }
                    />
                    
                    {/* Страница настроек */}
                    <Route
                      path="/settings"
                      element={
                        isAuthenticated ? (
                          <SettingsPage />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    />
                    
                    {/* Редирект на дашборд при переходе на главную */}
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    
                    {/* Перенаправление для не найденных маршрутов */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </Router>
            </ThemeTransition>
          </NotificationProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App; 