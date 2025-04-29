import React, { useState, useEffect } from 'react';
import { User } from '../../services/apiService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ReactDOM from 'react-dom';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: User & { password?: string }) => void;
  user?: User | null;
  title: string;
}

const UserModal: React.FC<UserModalProps> = ({
  open,
  onClose,
  onSave,
  user,
  title
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Состояние формы
  const [formData, setFormData] = useState<User & { password?: string }>({
    id: '',
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    lastLogin: '',
    createdAt: '',
    password: ''
  });
  
  // Состояние ошибок валидации
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Инициализация формы при открытии модального окна
  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: '' });
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        lastLogin: '',
        createdAt: new Date().toISOString(),
        password: ''
      });
    }
    
    setErrors({});
  }, [user, open]);
  
  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Имя пользователя обязательно';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    // Валидация пароля только для новых пользователей
    if (!user && !formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (!user && formData.password && formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  // Получение инициалов пользователя для аватара
  const getInitials = () => {
    if (!formData.name) return '';
    
    const nameParts = formData.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return formData.name.substring(0, 2).toUpperCase();
  };
  
  if (!open) return null;
  
  // Создаем портал для рендера модального окна на верхнем уровне DOM
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] transition-all duration-300">
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-xl w-full max-w-3xl border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] overflow-hidden transform transition-all scale-100 animate-fadeIn">
        <div className="py-5 px-6 border-b border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[var(--dark-bg-secondary)] dark:to-[var(--dark-bg-tertiary)]">
          <h2 className="text-xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] flex items-center">
            {user ? (
              <>
                <span className="material-icons mr-2 text-[var(--primary-color)]" style={{ fontSize: '20px' }}>edit</span>
                {title}
              </>
            ) : (
              <>
                <span className="material-icons mr-2 text-[var(--primary-color)]" style={{ fontSize: '20px' }}>person_add</span>
                {title}
              </>
            )}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="py-6 px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] flex items-center justify-center font-bold text-2xl">
                {getInitials() || (
                  <span className="material-icons" style={{ fontSize: '36px' }}>person</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mb-1.5">
                {t('name')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-[var(--primary-color)] text-opacity-70">person</span>
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2.5 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-[var(--dark-bg-secondary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200`}
                  placeholder="Введите имя пользователя"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mb-1.5">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-[var(--primary-color)] text-opacity-70">email</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-[var(--dark-bg-secondary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>
            
            {!user && (
              <div>
                <label className="block text-sm font-medium text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mb-1.5">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons text-[var(--primary-color)] text-opacity-70">lock</span>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-[var(--dark-bg-secondary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200`}
                    placeholder="Минимум 6 символов"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className={user ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mb-1.5">
                Роль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-[var(--primary-color)] text-opacity-70">admin_panel_settings</span>
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--dark-bg-secondary)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
                >
                  <option value="admin">Администратор</option>
                  <option value="user">Пользователь</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--dark-bg-tertiary)] font-medium transition-all duration-200"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UserModal; 