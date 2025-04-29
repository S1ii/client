import React, { useState, useEffect } from 'react';
import { Organization } from './types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ReactDOM from 'react-dom';

interface OrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (organization: Organization) => void;
  organization?: Organization | null;
  title: string;
}

const defaultOrganization: Organization = {
  id: '',
  name: '',
  address: '',
  contactPerson: '',
  phone: '',
  email: '',
  status: 'active',
  type: 'ООО',
  industry: '',
  employees: 0,
};

const OrganizationModal: React.FC<OrganizationModalProps> = ({
  open,
  onClose,
  onSave,
  organization,
  title,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Organization>(defaultOrganization);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (organization) {
      // Убедимся, что статус соответствует ограничениям базы данных
      const validStatus = organization.status === 'active' || organization.status === 'archived' 
        ? organization.status 
        : 'active';
        
      setFormData({
        ...organization,
        status: validStatus
      });
    } else {
      setFormData(defaultOrganization);
    }
    setErrors({});
  }, [organization, open]);

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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Преобразование в число
    const numberValue = parseInt(value, 10);
    if (!isNaN(numberValue) || value === '') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : numberValue,
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('organizations.validation.nameRequired');
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = t('organizations.validation.contactPersonRequired');
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('organizations.validation.phoneRequired');
    } else if (!/^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/.test(formData.phone)) {
      newErrors.phone = t('organizations.validation.phoneInvalid');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('organizations.validation.emailRequired');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = t('organizations.validation.emailInvalid');
    }
    
    // Проверяем статус на соответствие ограничениям базы данных
    if (formData.status !== 'active' && formData.status !== 'archived') {
      newErrors.status = t('organizations.validation.statusInvalid');
      // Автоматически исправляем статус
      setFormData(prev => ({
        ...prev,
        status: 'active'
      }));
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!open) return null;

  // Create a portal to render the modal at the root level of the DOM
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100 animate-fadeIn">
        <div className="py-5 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            {organization ? (
              <>
                <span className="material-icons mr-2 text-blue-600" style={{ fontSize: '20px' }}>edit</span>
                {title}
              </>
            ) : (
              <>
                <span className="material-icons mr-2 text-blue-600" style={{ fontSize: '20px' }}>add_business</span>
                {title}
              </>
            )}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('organization_name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2.5 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                placeholder={t('organizations.placeholders.name')}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('organization_type')}
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="ООО">ООО</option>
                <option value="ИП">ИП</option>
                <option value="АО">АО</option>
                <option value="ЗАО">ЗАО</option>
                <option value="ПАО">ПАО</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('industry')}
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={`w-full p-2.5 border ${errors.industry ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                placeholder={t('organizations.placeholders.industry')}
              />
              {errors.industry && (
                <p className="text-red-500 text-xs mt-1">{errors.industry}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('employees')}
              </label>
              <input
                type="number"
                name="employees"
                value={formData.employees}
                onChange={handleNumberChange}
                min="0"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder={t('organizations.placeholders.employees')}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('address')}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder={t('organizations.placeholders.address')}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('contact_person')}
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={`w-full p-2.5 border ${errors.contactPerson ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                placeholder={t('organizations.placeholders.contactPerson')}
              />
              {errors.contactPerson && (
                <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full p-2.5 border ${errors.status ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer`}
              >
                <option value="active">{t('organizations.statuses.active')}</option>
                <option value="archived">{t('organizations.statuses.archived')}</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('organizations.phone')}
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-2.5 border ${errors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                placeholder={t('organizations.placeholders.phone')}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
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
                placeholder={t('organizations.placeholders.email')}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all duration-200"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
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

export default OrganizationModal; 