import axios from 'axios';

// Интерфейсы для данных
export interface SystemStats {
  users: number;
  activeUsers: number;
  tasks: number;
  completedTasks: number;
  services: number;
  departments: number;
}

export interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface UserActivity {
  userId: string;
  userName: string;
  lastLogin: string;
  actionsCount: number;
  department?: string;
  position?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

// Глобальные настройки для Axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';

// Обработка ошибок
const handleApiError = (error: any) => {
  // Логирование ошибки
  console.error('API Error:', error);
  
  // Можно добавить специальную обработку разных HTTP статусов
  if (error.response) {
    // Ошибка сервера с статус-кодом
    const status = error.response.status;
    if (status === 401) {
      // Неавторизован — можно перенаправить на страницу входа
      console.log('Unauthorized, redirecting to login...');
      // window.location.href = '/login';
    }
  }
  
  // Пробрасываем ошибку дальше для обработки в компоненте
  throw error;
};

// API для Админ-панели
export const adminApi = {
  // Получение статистики системы
  getStats: async (): Promise<SystemStats> => {
    try {
      const response = await axios.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Получение системных логов
  getLogs: async (filter: string = 'all'): Promise<LogEntry[]> => {
    try {
      const response = await axios.get(`/api/admin/logs?filter=${filter}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Получение активности пользователей
  getUserActivities: async (): Promise<UserActivity[]> => {
    try {
      const response = await axios.get('/api/admin/user-activities');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// API для работы с задачами
export const tasksApi = {
  // Получение всех задач
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await axios.get('/api/tasks');
      
      // Обработка разных форматов ответа
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Создание новой задачи
  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      const response = await axios.post('/api/tasks', taskData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Обновление задачи
  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    try {
      const response = await axios.put(`/api/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Удаление задачи
  deleteTask: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/tasks/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// API для работы с сервисами
export const servicesApi = {
  // Получение всех сервисов
  getServices: async (): Promise<Service[]> => {
    try {
      const response = await axios.get('/api/services');
      
      // Обработка разных форматов ответа
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Создание нового сервиса
  createService: async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
    try {
      const response = await axios.post('/api/services', serviceData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Обновление сервиса
  updateService: async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    try {
      const response = await axios.put(`/api/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Удаление сервиса
  deleteService: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/services/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  }
};

export default {
  admin: adminApi,
  tasks: tasksApi,
  services: servicesApi
}; 