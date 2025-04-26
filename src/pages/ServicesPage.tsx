import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Service, servicesApi } from '../services/apiService';
// import TableLoader from '../components/TableLoader';
// import ErrorMessage from '../components/ErrorMessage';
// import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '../components/ui/table';
// import { Input } from '../components/ui/input';

const ServicesPage: React.FC = () => {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const servicesData = await servicesApi.getServices();
        setServices(servicesData);
        setFilteredServices(servicesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(t('failedToFetchServices'));
        
        // Use demo data if API is unavailable
        const demoServices: Service[] = [
          {
            id: '1',
            name: 'Консультация',
            description: 'Первичная консультация с юристом',
            price: 5000,
            duration: 60,
            category: 'Юридические услуги'
          },
          {
            id: '2',
            name: 'Составление договора',
            description: 'Разработка и составление юридического договора',
            price: 15000,
            duration: 120,
            category: 'Юридические услуги'
          },
          {
            id: '3',
            name: 'Бухгалтерское сопровождение',
            description: 'Ежемесячное сопровождение бухгалтерии малого бизнеса',
            price: 25000,
            duration: 0,
            category: 'Бухгалтерия'
          },
          {
            id: '4',
            name: 'Аудит документов',
            description: 'Проверка и аудит юридических документов',
            price: 12000,
            duration: 180,
            category: 'Аудит'
          },
          {
            id: '5',
            name: 'Налоговая консультация',
            description: 'Консультация по налоговым вопросам',
            price: 8000,
            duration: 90,
            category: 'Налоги'
          }
        ];
        
        setServices(demoServices);
        setFilteredServices(demoServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [t]);

  useEffect(() => {
    let result = Array.isArray(services) ? services : [];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(service => service.category === categoryFilter);
    }
    
    setFilteredServices(result);
  }, [searchTerm, categoryFilter, services]);

  const getUniqueCategories = () => {
    if (!Array.isArray(services) || services.length === 0) {
      return ['all'];
    }
    const categories = services.map(service => service.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return t('ongoing');
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} ${t('minutes')}`;
    if (mins === 0) return `${hours} ${t('hours')}`;
    
    return `${hours} ${t('hours')} ${mins} ${t('minutes')}`;
  };

  // Временное решение для загрузки и ошибки
  if (loading) return <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
  </div>;
  
  if (error) return <div className="p-4 bg-[var(--error-light)] text-white rounded-lg">{error}</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
          {t('servicesManagement')}
        </h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <span className="material-icons mr-2">add</span>
          {t('addService')}
        </button>
      </div>

      <div className="bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] rounded-lg shadow p-4">
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">{t('services')}</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('searchServices')}
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-[var(--light-bg-secondary)] dark:bg-[var(--dark-bg-secondary)]"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border rounded bg-[var(--light-bg-secondary)] dark:bg-[var(--dark-bg-secondary)] border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]"
              >
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? t('allCategories') : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">{t('name')}</th>
                <th className="text-left py-3 px-4">{t('description')}</th>
                <th className="text-left py-3 px-4">{t('category')}</th>
                <th className="text-left py-3 px-4">{t('price')}</th>
                <th className="text-left py-3 px-4">{t('duration')}</th>
                <th className="text-right py-3 px-4">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    {t('noServicesFound')}
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">{service.name}</td>
                    <td className="py-3 px-4">{service.description}</td>
                    <td className="py-3 px-4">{service.category}</td>
                    <td className="py-3 px-4">{formatPrice(service.price)}</td>
                    <td className="py-3 px-4">{formatDuration(service.duration)}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mx-1">
                        <span className="material-icons">edit</span>
                      </button>
                      <button className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 mx-1">
                        <span className="material-icons">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage; 