import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { OrganizationModal, OrganizationDetail, Organization } from '../components/Organizations';
import { organizationsService } from '../services/api/organizationsService';
import { OrganizationFilters } from '../services/api/organizationsService';
import AddIcon from '@mui/icons-material/Add';

const OrganizationsPage: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Загрузка организаций через API
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const filters: OrganizationFilters = {
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        };

        const response = await organizationsService.getOrganizations(filters);
        
        if (response.success) {
          setOrganizations(response.data);
          // Бэкенд не поддерживает пагинацию, поэтому расчитываем totalPages самостоятельно 
          // исходя из количества элементов (10 на страницу)
          const itemsPerPage = 10;
          const calculatedTotalPages = Math.ceil(response.count / itemsPerPage);
          setTotalPages(calculatedTotalPages || 1);
          setError(null);
        } else {
          throw new Error('Ошибка получения данных от сервера');
        }
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при загрузке организаций');
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [searchTerm, statusFilter, currentPage]);

  // Получение уникальных отраслей для фильтра
  const industries = organizations
    .map(org => org.industry)
    .filter((industry, index, self) => self.indexOf(industry) === index);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleCreateOrganization = () => {
    setSelectedOrganization(null);
    setModalTitle(t('organizations.createOrganization'));
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setModalTitle(t('organizations.editOrganization'));
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleViewOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsDetailOpen(true);
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    if (window.confirm(t('organizations.confirmDelete'))) {
      try {
        await organizationsService.deleteOrganization(organization.id);
        setOrganizations(organizations.filter(org => org.id !== organization.id));
        showNotification('Организация успешно удалена', 'success');
      } catch (err: any) {
        setError(err.message || t('organizations.deleteError'));
        showNotification('Ошибка при удалении организации', 'error');
      }
    }
  };

  const handleSaveOrganization = async (organization: Organization) => {
    try {
      if (isEditMode) {
        const updatedOrganization = await organizationsService.updateOrganization(organization.id, organization);
        setOrganizations(organizations.map(org => 
          org.id === updatedOrganization.id ? updatedOrganization : org
        ));
        showNotification('Организация успешно обновлена', 'success');
      } else {
        const newOrganization = await organizationsService.createOrganization(organization);
        setOrganizations([...organizations, newOrganization]);
        showNotification('Организация успешно добавлена', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || t('organizations.deleteError'));
      showNotification('Ошибка при сохранении организации', 'error');
    }
  };

  const getStatusIconAndClass = (status: string) => {
    if (status === 'active') {
      return {
        icon: 'check_circle',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-600 dark:text-green-400',
        label: t('organizations.statuses.active')
      };
    } else if (status === 'archived') {
      return {
        icon: 'archive',
        bgClass: 'bg-gray-100 dark:bg-gray-800/50',
        textClass: 'text-gray-600 dark:text-gray-400',
        label: t('organizations.statuses.archived')
      };
    } else {
      // Для других значений (на случай ошибки) используем нейтральное отображение
      return {
        icon: 'help',
        bgClass: 'bg-gray-100 dark:bg-gray-800/50',
        textClass: 'text-gray-600 dark:text-gray-400',
        label: t('organizations.statuses.unknown')
      };
    }
  };

  // Фильтрация организаций
  const filteredOrganizations = organizations.filter(organization => {
    // Фильтр по поисковому запросу
    const matchesSearch = organization.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (organization.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (organization.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    // Фильтр по статусу
    const matchesStatus = statusFilter === 'all' || organization.status === statusFilter;
    
    // Фильтр по отрасли
    const matchesIndustry = industryFilter === 'all' || organization.industry === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  // Сортировка организаций
  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    }
    if (sortBy === 'employees') {
      return sortOrder === 'asc' 
        ? (a.employees || 0) - (b.employees || 0) 
        : (b.employees || 0) - (a.employees || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <span className="material-icons text-[var(--primary-color)] mr-3 text-3xl">business</span>
          <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t('nav_organizations')}
          </h1>
        </div>
        
        <div className="mt-3 sm:mt-0">
          <button
            onClick={handleCreateOrganization}
            className="inline-flex items-center px-5 py-2.5 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] shadow-sm transition-all duration-200 transform hover:-translate-y-1"
          >
            <span className="material-icons mr-2 text-sm">add</span>
            {t('organizations.addOrganization')}
          </button>
        </div>
      </div>
      
      {/* Статистика организаций */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-blue-600 dark:text-blue-400">business</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('organizations.totalOrganizations')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{organizations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('organizations.activeOrganizations')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {organizations.filter(org => org.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Поисковые фильтры */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 p-4 bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-sm border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-icons text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">search</span>
          </span>
          <input
            type="text"
            placeholder={t('organizations.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] rounded-lg text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
        </div>
        
        <div className="flex space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] rounded-lg text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          >
            <option value="all">{t('organizations.statuses.all')}</option>
            <option value="active">{t('organizations.statuses.active')}</option>
            <option value="archived">{t('organizations.statuses.archived')}</option>
          </select>
          
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] rounded-lg text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          >
            <option value="all">{t('organizations.industries.all')}</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 shadow-sm">
          <div className="flex items-center">
            <span className="material-icons text-rose-500 mr-3">error</span>
            <p className="text-rose-700 dark:text-rose-300">{t('organizations.connectionError')}: {error}</p>
          </div>
        </div>
      )}
      
      {/* Таблица организаций */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-sm border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] overflow-hidden">
        {!error && organizations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--light-border-color)] dark:divide-[var(--dark-border-color)]">
              <thead className="bg-[var(--light-bg-tertiary)] dark:bg-[var(--dark-bg-tertiary)]">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-4 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      {t('organizations.name')}
                      {sortBy === 'name' && (
                        <span className="material-icons ml-1 text-sm">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('organizations.type')}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('organizations.industry')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('employees')}
                  >
                    <div className="flex items-center">
                      {t('organizations.employees')}
                      {sortBy === 'employees' && (
                        <span className="material-icons ml-1 text-sm">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('organizations.status')}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('organizations.contacts')}
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] divide-y divide-[var(--light-border-color)] dark:divide-[var(--dark-border-color)]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col justify-center items-center">
                        <div className="relative w-16 h-16 mb-4">
                          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-r-[var(--primary-color)] border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s', animationDelay: '0.15s' }}></div>
                          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-r-transparent border-b-[var(--primary-color)] border-l-transparent animate-spin" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>
                        </div>
                        <p className="text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] font-medium">{t('organizations.loadingOrganizations')}</p>
                        <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] text-sm mt-1">{t('common.loading_message')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedOrganizations.map((organization) => {
                    const statusInfo = getStatusIconAndClass(organization.status);
                    
                    return (
                      <tr key={organization.id} className="hover:bg-[var(--light-bg-secondary)] dark:hover:bg-[var(--dark-bg-secondary)]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center rounded-full">
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                                {organization.name.split(' ')[0][0]}{organization.name.split(' ').length > 1 ? organization.name.split(' ')[1][0] : ''}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                                <a 
                                  href="#" 
                                  className="hover:text-[var(--primary-color)] hover:underline"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleViewOrganization(organization);
                                  }}
                                >
                                  {organization.name}
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{organization.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{organization.industry}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{organization.employees}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex items-center rounded-full px-2.5 py-1 ${statusInfo.bgClass}`}>
                              <span className={`material-icons text-sm mr-1 ${statusInfo.textClass}`}>{statusInfo.icon}</span>
                              <span className={`text-xs font-medium ${statusInfo.textClass}`}>{statusInfo.label}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] flex items-center">
                            <span className="material-icons text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mr-1 text-sm">person</span>
                            {organization.contactPerson}
                          </div>
                          <div className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] flex items-center mt-1">
                            <span className="material-icons text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mr-1 text-sm">phone</span>
                            {organization.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleViewOrganization(organization)}
                            className="inline-flex items-center justify-center p-2 text-[var(--primary-color)] hover:text-white bg-[var(--primary-color)]/10 hover:bg-[var(--primary-color)] rounded-full mr-2 transition-colors"
                            title={t('common.view')}
                          >
                            <span className="material-icons text-sm">visibility</span>
                          </button>
                          <button 
                            onClick={() => handleEditOrganization(organization)}
                            className="inline-flex items-center justify-center p-2 text-[var(--secondary-color)] hover:text-white bg-[var(--secondary-color)]/10 hover:bg-[var(--secondary-color)] rounded-full mr-2 transition-colors"
                            title={t('common.edit')}
                          >
                            <span className="material-icons text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteOrganization(organization)}
                            className="inline-flex items-center justify-center p-2 text-red-500 hover:text-white bg-red-100 hover:bg-red-500 rounded-full transition-colors"
                            title={t('common.delete')}
                          >
                            <span className="material-icons text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && organizations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
              <span className="material-icons text-4xl text-gray-400 dark:text-gray-500">business</span>
            </div>
            <h3 className="text-lg font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] mb-2">{t('organizations.noOrganizations')}</h3>
            <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] text-center max-w-md mb-6">
              {t('organizations.noOrganizationsDescription')}
            </p>
            <button
              onClick={handleCreateOrganization}
              className="inline-flex items-center px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white rounded-lg shadow-sm transition-all duration-200"
            >
              <span className="material-icons mr-2 text-sm">add</span>
              {t('organizations.addOrganization')}
            </button>
          </div>
        )}
        
        {/* Пагинация */}
        {!loading && !error && sortedOrganizations.length > 0 && totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
            <div className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">
              {t('organizations.itemsShowing', { count: Math.min(10, sortedOrganizations.length), total: organizations.length })}
            </div>
            <div className="flex-1 flex justify-center sm:justify-end">
              <nav className="flex items-center">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="mr-2 p-2 rounded-md border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] disabled:opacity-50"
                >
                  <span className="material-icons text-sm">chevron_left</span>
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`mx-1 w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === index + 1 
                        ? 'bg-[var(--primary-color)] text-white' 
                        : 'border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="ml-2 p-2 rounded-md border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] disabled:opacity-50"
                >
                  <span className="material-icons text-sm">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
      
      {/* Модальное окно добавления/редактирования */}
      {isModalOpen && (
        <OrganizationModal
          open={isModalOpen}
          title={modalTitle}
          organization={selectedOrganization}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOrganization}
        />
      )}
      
      {/* Модальное окно просмотра */}
      {isDetailOpen && selectedOrganization && (
        <OrganizationDetail
          open={isDetailOpen}
          organization={selectedOrganization}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            handleEditOrganization(selectedOrganization);
          }}
          onDelete={() => {
            setIsDetailOpen(false);
            handleDeleteOrganization(selectedOrganization);
          }}
        />
      )}
    </div>
  );
};

export default OrganizationsPage; 