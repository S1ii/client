import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { ClientModal, Client } from '../components/Clients';
import { ClientResponse, ClientStatus } from '../components/Clients/types';

const ClientsPage: React.FC = () => {
  const { t, t2, language, translations } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  // DEBUG: Проверка переводов
  useEffect(() => {
    console.log("CLIENT PAGE TRANSLATIONS:", {
      language,
      clientsKey: t('clients'),
      clientsT2: t2('clients'),
      clientsAddKey: t('clients.addClient'),
      rawClientKey: translations['clients']
    });
  }, [language, t, t2, translations]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{success: boolean; data: Client[]; message?: string}>('/api/clients');
        
        if (response.data.success) {
          setClients(response.data.data);
          setError(null);
        } else {
          setError(response.data.message || 'Unknown error');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Check if we need to open the add/edit form
  useEffect(() => {
    if (window.location.pathname === '/clients/new') {
      handleAddClient();
    } else if (id) {
      // If this is an edit URL, fetch the client and open edit modal
      const fetchClient = async () => {
        try {
          const response = await axios.get<ClientResponse>(`/api/clients/${id}`);
          if (response.data.success) {
            if (window.location.pathname.includes('/edit')) {
              handleEditClient(response.data.data);
            }
          }
        } catch (err: any) {
          // Handle error
        }
      };
      
      fetchClient();
    }
  }, [id]);

  // Handle add client
  const handleAddClient = () => {
    setCurrentClient(null);
    setModalTitle(t('clients.addClient'));
    setIsModalOpen(true);
  };

  // Handle edit client
  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setModalTitle(t('clients.editClient'));
    setIsModalOpen(true);
  };

  // Функция для удаления клиента
  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm(t('clients.confirmDelete'))) {
      try {
        const response = await axios.delete<{success: boolean; message?: string}>(`/api/clients/${clientId}`);
        
        if (response.data.success) {
          // Удаляем клиента из локального состояния
          setClients(prev => prev.filter(client => client.id !== clientId));
        }
      } catch (err: any) {
        console.error('Error deleting client:', err);
        alert(t('clients.deleteError'));
      }
    }
  };

  // Handle save client
  const handleSaveClient = async (client: Client) => {
    try {
      console.log('Сохранение клиента:', client);
      // Убедимся, что client.status всегда имеет валидное значение
      const clientToSave = {
        ...client,
        status: client.status === 'active' || client.status === 'inactive' ? client.status : 'active'
      };
      
      let response: { data: ClientResponse };
      
      if (clientToSave.id) {
        // Update existing client
        response = await axios.put<ClientResponse>(`/api/clients/${clientToSave.id}`, clientToSave);
        if (response.data.success) {
          console.log('Клиент обновлен:', response.data.data);
          console.log('Принудительно используем отправленный статус:', clientToSave.status);
          
          // ВАЖНО: Используем отправленный статус вместо полученного (который может быть некорректным)
          const updatedClient = {
            ...response.data.data,
            status: clientToSave.status
          };
          
          // Обновляем список клиентов
          setClients(prev => prev.map(c => c.id === clientToSave.id ? updatedClient : c));
        }
      } else {
        // Create new client
        response = await axios.post<ClientResponse>('/api/clients', clientToSave);
        if (response.data.success) {
          console.log('Клиент создан:', response.data.data);
          
          // Используем отправленный статус
          const newClient = {
            ...response.data.data,
            status: clientToSave.status
          };
          
          // Добавляем нового клиента в список
          setClients(prev => [...prev, newClient]);
        }
      }
      
      setIsModalOpen(false);
      navigate('/clients');
    } catch (err: any) {
      // Handle error
      console.error('Error saving client:', err);
    }
  };

  // Фильтрация клиентов
  const filteredClients = clients.filter(client => {
    // Фильтр по поисковому запросу
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтр по статусу
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Сортировка клиентов
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusIconAndClass = (status: string) => {
    // Логирование для отладки
    console.log('Текущий статус клиента:', status, typeof status);
    
    // Убедимся, что статус всегда имеет валидное значение
    const safeStatus = status === 'active' || status === 'inactive' ? status : 'active';
    
    if (safeStatus === 'active') {
      return {
        icon: 'check_circle',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-600 dark:text-green-400',
        label: t('clients.statuses.active')
      };
    } else {
      return {
        icon: 'cancel',
        bgClass: 'bg-gray-100 dark:bg-gray-800/50',
        textClass: 'text-gray-600 dark:text-gray-400',
        label: t('clients.statuses.inactive')
      };
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <span className="material-icons text-[var(--primary-color)] mr-3 text-3xl">people</span>
          <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
            {t2('clients')}
          </h1>
        </div>
        
        <div className="mt-3 sm:mt-0">
          <button
            onClick={handleAddClient}
            className="inline-flex items-center px-5 py-2.5 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] shadow-sm transition-all duration-200 transform hover:-translate-y-1"
          >
            <span className="material-icons mr-2 text-sm">add</span>
            {t('clients.addClient')}
          </button>
        </div>
      </div>
      
      {/* Статистика клиентов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-blue-600 dark:text-blue-400">group</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('totalClients')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--dark-bg-secondary)] shadow-sm rounded-xl p-4 border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4">
              <span className="material-icons text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">{t('activeClients')}</p>
              <p className="text-2xl font-semibold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                {clients.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Фильтры и поиск */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 p-4 bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-sm border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)]">
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-icons text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]">search</span>
          </span>
          <input
            type="text"
            placeholder={t('clients.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] rounded-lg text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] rounded-lg text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          >
            <option value="all">{t('clients.statuses.all')}</option>
            <option value="active">{t('clients.statuses.active')}</option>
            <option value="inactive">{t('clients.statuses.inactive')}</option>
          </select>
        </div>
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 shadow-sm">
          <div className="flex items-center">
            <span className="material-icons text-rose-500 mr-3">error</span>
            <p className="text-rose-700 dark:text-rose-300">{t('clients.connectionError')}: {error}</p>
          </div>
        </div>
      )}
      
      {/* Таблица клиентов */}
      <div className="bg-white dark:bg-[var(--dark-bg-secondary)] rounded-xl shadow-sm border border-[var(--light-border-color)] dark:border-[var(--dark-border-color)] overflow-hidden">
        {!error && clients.length > 0 && (
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
                      <span>{t('clients.name')}</span>
                      {sortBy === 'name' && (
                        <span className="material-icons ml-1 text-sm">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider"
                  >
                    {t('clients.contacts')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider"
                  >
                    {t('clients.status')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-medium text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] uppercase tracking-wider"
                  >
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] divide-y divide-[var(--light-border-color)] dark:divide-[var(--dark-border-color)]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col justify-center items-center">
                        <div className="relative w-16 h-16 mb-4">
                          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-r-[var(--primary-color)] border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s', animationDelay: '0.15s' }}></div>
                          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-r-transparent border-b-[var(--primary-color)] border-l-transparent animate-spin" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>
                        </div>
                        <p className="text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] font-medium">{t('clients.loadingClients')}</p>
                        <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] text-sm mt-1">{t('common.loading_message')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedClients.map(client => (
                    <tr key={client.id} className="hover:bg-[var(--light-bg-secondary)] dark:hover:bg-[var(--dark-bg-secondary)]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center rounded-full">
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                              {client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
                              {client.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] flex items-center">
                          <span className="material-icons text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mr-1 text-sm">email</span>
                          {client.email}
                        </div>
                        <div className="text-sm text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] flex items-center mt-1">
                          <span className="material-icons text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mr-1 text-sm">phone</span>
                          {client.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const statusInfo = getStatusIconAndClass(client.status);
                          return (
                            <div className="flex items-center">
                              <div className={`flex items-center rounded-full px-2.5 py-1 ${statusInfo.bgClass}`}>
                                <span className={`material-icons text-sm mr-1 ${statusInfo.textClass}`}>{statusInfo.icon}</span>
                                <span className={`text-xs font-medium ${statusInfo.textClass}`}>{statusInfo.label}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="inline-flex items-center justify-center p-2 text-[var(--primary-color)] hover:text-white bg-[var(--primary-color)]/10 hover:bg-[var(--primary-color)] rounded-full mr-2 transition-colors"
                          title={t('common.view')}
                        >
                          <span className="material-icons text-sm">visibility</span>
                        </button>
                        <button 
                          onClick={() => handleEditClient(client)}
                          className="inline-flex items-center justify-center p-2 text-[var(--secondary-color)] hover:text-white bg-[var(--secondary-color)]/10 hover:bg-[var(--secondary-color)] rounded-full mr-2 transition-colors"
                          title={t('common.edit')}
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="inline-flex items-center justify-center p-2 text-red-500 hover:text-white bg-red-100 hover:bg-red-500 rounded-full transition-colors"
                          title={t('common.delete')}
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && !error && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
              <span className="material-icons text-4xl text-gray-400 dark:text-gray-500">people</span>
            </div>
            <h3 className="text-lg font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] mb-2">{t('clients.noClients')}</h3>
            <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] text-center max-w-md mb-6">
              {t('clients.noClientsDescription')}
            </p>
            <button
              onClick={handleAddClient}
              className="inline-flex items-center px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white rounded-lg shadow-sm transition-all duration-200"
            >
              <span className="material-icons mr-2 text-sm">add</span>
              {t('clients.addClient')}
            </button>
          </div>
        )}
      </div>
      
      {/* Client Modal */}
      <ClientModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          navigate('/clients');
        }}
        onSave={handleSaveClient}
        client={currentClient}
        title={modalTitle}
      />
    </div>
  );
};

export default ClientsPage; 