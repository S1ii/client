import React from 'react';
import { Organization } from './types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ReactDOM from 'react-dom';

interface OrganizationDetailProps {
  open: boolean;
  onClose: () => void;
  organization: Organization | null;
  onEdit: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
}

const OrganizationDetail: React.FC<OrganizationDetailProps> = ({
  open,
  onClose,
  organization,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (!organization || !open) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-600 dark:text-green-400',
          icon: 'check_circle'
        };
      case 'archived':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800/50',
          text: 'text-gray-600 dark:text-gray-400',
          icon: 'archive'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800/50',
          text: 'text-gray-600 dark:text-gray-400',
          icon: 'help'
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('organizations.statuses.active');
      case 'archived':
        return t('organizations.statuses.archived');
      default:
        return t('organizations.statuses.unknown');
    }
  };

  const handleEdit = () => {
    onEdit(organization);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && organization) {
      onDelete(organization);
    }
    onClose();
  };

  const statusInfo = getStatusBadgeClass(organization.status);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100 animate-fadeIn">
        <div className="py-5 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons mr-3 text-blue-600" style={{ fontSize: '24px' }}>business</span>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{organization.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`flex items-center ${statusInfo.bg} rounded-full px-3 py-1.5`}>
                <span className={`material-icons text-sm mr-1.5 ${statusInfo.text}`}>{statusInfo.icon}</span>
                <span className={`text-sm font-medium ${statusInfo.text}`}>{getStatusText(organization.status)}</span>
              </div>
              <div className="mx-3 text-gray-300 dark:text-gray-600">|</div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="material-icons text-sm mr-1">apartment</span>
                <span className="text-sm">{organization.type}</span>
              </div>
              <div className="mx-3 text-gray-300 dark:text-gray-600">|</div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="material-icons text-sm mr-1">category</span>
                <span className="text-sm">{organization.industry}</span>
              </div>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5">
              <span className="material-icons text-sm mr-1.5">people</span>
              <span className="text-sm font-medium">{organization.employees} {t('organizations.employees')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
              <h3 className="text-base font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="material-icons mr-2 text-blue-600">contact_phone</span>
                {t('organizations.contactInfo')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 mr-3 mt-0.5">person</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('organizations.contactPerson')}</p>
                    <p className="text-sm text-gray-800 dark:text-white">{organization.contactPerson}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 mr-3 mt-0.5">phone</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('organizations.phone')}</p>
                    <p className="text-sm text-gray-800 dark:text-white">{organization.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 mr-3 mt-0.5">email</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('email')}</p>
                    <p className="text-sm text-gray-800 dark:text-white">{organization.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
              <h3 className="text-base font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="material-icons mr-2 text-blue-600">location_on</span>
                {t('organizations.additionalInfo')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 mr-3 mt-0.5">pin_drop</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('address')}</p>
                    <p className="text-sm text-gray-800 dark:text-white">{organization.address || t('common.noData')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 mr-3 mt-0.5">category</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('industry')}</p>
                    <p className="text-sm text-gray-800 dark:text-white">{organization.industry || t('common.noData')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="material-icons text-gray-400 mr-3 mt-0.5">business</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('organizations.type')}</p>
                    <p className="text-sm text-gray-800 dark:text-white">{organization.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-4 px-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <span className="material-icons mr-1.5 text-sm">delete</span>
              {t('common.delete')}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t('organizations.close')}
          </button>
          <button
            onClick={handleEdit}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {t('common.edit')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrganizationDetail; 