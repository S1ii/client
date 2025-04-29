import axios from 'axios';
import { Organization } from '../../components/Organizations';

// API-клиент с базовыми настройками
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Добавляем перехватчик запросов для добавления токена
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для обработки ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || 'Произошла ошибка при выполнении запроса';
    
    // Если ошибка авторизации (401) - можно перенаправить на страницу входа
    if (error.response && error.response.status === 401) {
      console.error('Ошибка авторизации. Перенаправление на страницу входа');
      // Можно добавить перенаправление на страницу входа:
      // window.location.href = '/login';
    }
    
    // Подробное логирование для отладки
    console.error('API error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method
    });
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Интерфейс для фильтров организаций
export interface OrganizationFilters {
  search?: string;
  industry?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Интерфейс для ответа с пагинацией
export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

// Получение списка организаций с фильтрацией и пагинацией
export const getOrganizations = async (filters: OrganizationFilters = {}): Promise<PaginatedResponse<Organization>> => {
  try {
    // Преобразуем frontend фильтры в параметры, которые понимает бэкенд
    let params = {};
    
    // Если есть поисковой запрос, используем соответствующий API
    if (filters.search) {
      const response = await apiClient.get(`/organizations/search/${filters.search}`);
      return response.data;
    }
    
    // Если есть фильтр по статусу
    if (filters.status && filters.status !== 'all') {
      const response = await apiClient.get(`/organizations/status/${filters.status}`);
      return response.data;
    }
    
    // Стандартный запрос на получение всех организаций
    const response = await apiClient.get('/organizations', { params });
    
    // Преобразуем ответ сервера в формат, который ожидает фронтенд
    return {
      success: response.data.success,
      count: response.data.count,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
};

// Получение одной организации по ID
export const getOrganizationById = async (id: string): Promise<Organization> => {
  try {
    const response = await apiClient.get(`/organizations/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching organization with ID ${id}:`, error);
    throw error;
  }
};

// Создание новой организации
export const createOrganization = async (organization: Omit<Organization, 'id'>): Promise<Organization> => {
  try {
    const response = await apiClient.post('/organizations', organization);
    return response.data.data;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

// Обновление существующей организации
export const updateOrganization = async (id: string, organization: Partial<Organization>): Promise<Organization> => {
  try {
    const response = await apiClient.put(`/organizations/${id}`, organization);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating organization with ID ${id}:`, error);
    throw error;
  }
};

// Удаление организации
export const deleteOrganization = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/organizations/${id}`);
  } catch (error) {
    console.error(`Error deleting organization with ID ${id}:`, error);
    throw error;
  }
};

// Получение статистики по организациям - обратите внимание, что этот API может
// быть не реализован на бэкенде, поэтому он может вернуть ошибку 404
export const getOrganizationsStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  prospect: number;
  byIndustry: { [key: string]: number };
}> => {
  try {
    const response = await apiClient.get('/organizations/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching organizations stats:', error);
    throw error;
  }
};

// Экспорт всех организаций в CSV - этот метод также может быть не реализован
// на бэкенде и требует дополнительной реализации
export const exportOrganizationsToCSV = async (filters: OrganizationFilters = {}): Promise<Blob> => {
  try {
    // Поскольку API экспорта в CSV отсутствует на бэкенде, нужно вручную создать CSV
    // из полученных данных
    const response = await getOrganizations(filters);
    if (response.data.length === 0) {
      throw new Error('No data to export');
    }
    
    // Преобразование данных в CSV формат
    const organizations = response.data;
    const headers = Object.keys(organizations[0]).join(',');
    const rows = organizations.map(org => Object.values(org).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    // Создание Blob из CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  } catch (error) {
    console.error('Error exporting organizations to CSV:', error);
    throw error;
  }
};

// Экспорт сервиса
export const organizationsService = {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationsStats,
  exportOrganizationsToCSV,
}; 