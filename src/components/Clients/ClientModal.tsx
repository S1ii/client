import React, { useState, useEffect } from 'react';
import {
  Dialog,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Client, ClientStatus } from './types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ReactDOM from 'react-dom';

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  client?: Client | null;
  title: string;
}

const defaultClient: Client = {
  id: '',
  name: '',
  email: '',
  phone: '',
  status: 'active' as ClientStatus,
  address: '',
  notes: ''
};

const ClientModal: React.FC<ClientModalProps> = ({
  open,
  onClose,
  onSave,
  client,
  title,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Client>(defaultClient);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (client) {
      // Убедимся, что все необходимые поля определены
      console.log('Редактирование клиента:', client);
      console.log('Текущий статус клиента:', client.status, typeof client.status);
      
      const safeStatus = (client.status === 'active' || client.status === 'inactive') 
        ? client.status 
        : 'active';
        
      console.log('Используемый статус:', safeStatus);
      
      setFormData({
        ...defaultClient,
        ...client,
        // Гарантируем, что эти поля будут строками даже если они undefined в client
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        status: safeStatus,
        address: client.address || '',
        notes: client.notes || ''
      });
    } else {
      console.log('Создание нового клиента');
      setFormData(defaultClient);
    }
    setErrors({});
  }, [client, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Clear error for this field
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    console.log('Select changed:', name, value);
    
    // Гарантируем, что status всегда имеет корректное значение
    if (name === 'status') {
      const statusValue = value === 'active' || value === 'inactive' 
        ? value as ClientStatus 
        : 'active';
        
      console.log('Применяем новый статус:', statusValue);
      
      setFormData(prev => ({
        ...prev,
        status: statusValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as keyof Client]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Проверяем на undefined перед вызовом trim()
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = t('clients.validation.nameRequired');
    }
    
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = t('clients.validation.emailRequired');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = t('clients.validation.emailInvalid');
    }
    
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = t('clients.validation.phoneRequired');
    } else if (!/^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/.test(formData.phone)) {
      newErrors.phone = t('clients.validation.phoneInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Отправка формы клиента:', formData);
      console.log('Тип статуса:', typeof formData.status, 'Значение:', formData.status);
      
      // Убедимся, что статус всегда имеет правильное значение
      const clientData = {
        ...formData,
        status: (formData.status === 'active' || formData.status === 'inactive') 
          ? formData.status 
          : 'active'
      };
      
      console.log('Подготовленные данные клиента:', clientData);
      onSave(clientData);
    }
  };

  if (!open) return null;

  // Create a portal to render the modal at the root level of the DOM
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100 animate-fadeIn">
        <div className="py-5 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            {client ? (
              <>
                <span className="material-icons mr-2 text-blue-600" style={{ fontSize: '20px' }}>edit</span>
                {title}
              </>
            ) : (
              <>
                <span className="material-icons mr-2 text-blue-600" style={{ fontSize: '20px' }}>person_add</span>
                {title}
              </>
            )}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('clients.name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2.5 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                placeholder={t('clients.titlePlaceholder')}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('clients.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="active">{t('clients.statuses.active')}</option>
                <option value="inactive">{t('clients.statuses.inactive')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2.5 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                placeholder={t('clients.emailPlaceholder')}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('clients.phone') || 'Телефон'}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-2.5 border ${errors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                placeholder={t('clients.phonePlaceholder')}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('clients.address')}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder={t('clients.addressPlaceholder')}
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('clients.notes')}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder={t('clients.notesPlaceholder')}
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {client ? t('common.saveChanges') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export { ClientModal }; 