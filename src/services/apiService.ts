import axios from 'axios';

// Интерфейсы для данных
export interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  totalTasks: number;
  totalOrganizations: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  services: number;
  activeUsers: number;
}

export interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface UserActivity {
  userId: string;
  userName: string;
  lastLogin: string;
  role: string;
  actionsCount: number;
  lastActionAt: string;
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

export interface SystemSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  enableRegistration: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableDarkMode: boolean;
  maintenanceMode: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
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
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Получение системных логов
  getLogs: async (filter: string = 'all'): Promise<LogEntry[]> => {
    try {
      const response = await axios.get(`/api/admin/system-logs?filter=${filter}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Получение активности пользователей
  getUserActivities: async (): Promise<UserActivity[]> => {
    try {
      const response = await axios.get('/api/admin/user-activities');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Получение всех пользователей
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get('/api/admin/users');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Получение данных пользователя по ID
  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Создание пользователя
  createUser: async (userData: Partial<User> & { password?: string }): Promise<User> => {
    try {
      // Убедимся, что пароль передается
      if (!userData.password) {
        throw new Error('Password is required to create a user');
      }
      
      const response = await axios.post('/api/admin/users', userData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Обновление пользователя
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await axios.put(`/api/admin/users/${id}`, userData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Удаление пользователя
  deleteUser: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/admin/users/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Получение настроек
  getSettings: async (): Promise<SystemSettings> => {
    try {
      const response = await axios.get('/api/admin/settings');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Обновление настроек
  updateSettings: async (settings: SystemSettings): Promise<void> => {
    try {
      await axios.put('/api/admin/settings', settings);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Получение активности пользователя по ID
  getUserActivity: async (userId: string) => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}/activity`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Получение активности системы
  getSystemActivity: async () => {
    try {
      const response = await axios.get('/api/admin/activity');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Получение производительности пользователей
  getUserPerformance: async () => {
    try {
      const response = await axios.get('/api/admin/users/performance');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Очистка логов
  clearLogs: async (): Promise<void> => {
    try {
      await axios.delete('/api/admin/system-logs');
    } catch (error) {
      handleApiError(error);
    }
  },

  // Productivity metrics
  getProductivityMetrics: async (): Promise<any[]> => {
    try {
      const response = await axios.get('/api/admin/analytics/productivity');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Service utilization metrics
  getServiceUtilization: async (): Promise<any[]> => {
    try {
      const response = await axios.get('/api/admin/analytics/services');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Fix for task refresh issue - make sure task status is consistent
const normalizeTaskStatus = (status: string): 'todo' | 'in_progress' | 'done' => {
  // Convert different status formats to consistent format
  const statusMap: Record<string, 'todo' | 'in_progress' | 'done'> = {
    'pending': 'todo',
    'in-progress': 'in_progress',
    'inprogress': 'in_progress',
    'in progress': 'in_progress',
    'completed': 'done',
    'complete': 'done',
    'finished': 'done'
  };
  
  return statusMap[status.toLowerCase()] || status as 'todo' | 'in_progress' | 'done';
};

// Mapping of client status to server status
const clientToServerStatus = (status: 'todo' | 'in_progress' | 'done'): string => {
  const statusMap: Record<string, string> = {
    'todo': 'pending',
    'in_progress': 'in-progress',
    'done': 'completed'
  };
  return statusMap[status] || 'pending';
};

// Mapping of server status to client status
const serverToClientStatus = (status: string): 'todo' | 'in_progress' | 'done' => {
  const statusMap: Record<string, 'todo' | 'in_progress' | 'done'> = {
    'pending': 'todo',
    'in-progress': 'in_progress',
    'completed': 'done'
  };
  return statusMap[status] || 'todo';
};

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add interceptor to include token with requests
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

// Task API Service
export const tasksApi = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await apiClient.get('/tasks');
      
      // Transform server response to match client Task interface
      if (response.data && response.data.data) {
        const tasks = response.data.data.map((task: any) => ({
          id: task.id.toString(),
          title: task.title,
          description: task.description || '',
          status: serverToClientStatus(task.status),
          priority: task.priority || 'medium',
          assignedTo: task.assignedTo || '',
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }));
        return tasks;
      }
      return [];
    } catch (error) {
      console.error('Error fetching tasks from server:', error);
      // Fallback to localStorage when server is not available
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        try {
          return JSON.parse(storedTasks);
        } catch (error) {
          console.error('Error parsing stored tasks:', error);
          return [];
        }
      }
      return [];
    }
  },
  
  // Create a new task
  createTask: async (taskData: any): Promise<Task> => {
    try {
      // Normalize status for consistency
      taskData.status = normalizeTaskStatus(taskData.status);
      
      // Convert client status to server status
      const serverTaskData = {
        ...taskData,
        status: clientToServerStatus(taskData.status)
      };
      
      // Send request to server
      const response = await apiClient.post('/tasks', serverTaskData);
      
      if (response.data && response.data.data) {
        // Transform server response to match client Task interface
        const newTask: Task = {
          id: response.data.data.id.toString(),
          title: response.data.data.title,
          description: response.data.data.description || '',
          status: normalizeTaskStatus(response.data.data.status),
          priority: response.data.data.priority || 'medium',
          assignedTo: response.data.data.assignedTo || '',
          dueDate: response.data.data.dueDate,
          createdAt: response.data.data.createdAt,
          updatedAt: response.data.data.updatedAt
        };
        return newTask;
      }
      
      throw new Error('Failed to create task on server');
    } catch (error) {
      console.error('Error creating task on server:', error);
      
      // Fallback to localStorage when server is not available
      // Create a new task with ID and timestamps
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      try {
        // Save to localStorage for persistence between refreshes
        const storedTasks = localStorage.getItem('tasks');
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error storing task in localStorage:', error);
      }
      
      return newTask;
    }
  },
  
  // Update an existing task
  updateTask: async (id: string, taskData: any): Promise<Task> => {
    try {
      // Normalize status for consistency
      taskData.status = normalizeTaskStatus(taskData.status);
      
      // Convert client status to server status
      const serverTaskData = {
        ...taskData,
        status: clientToServerStatus(taskData.status)
      };
      
      // Send request to server
      const response = await apiClient.put(`/tasks/${id}`, serverTaskData);
      
      if (response.data && response.data.data) {
        // Transform server response to match client Task interface
        const updatedTask: Task = {
          id: response.data.data.id.toString(),
          title: response.data.data.title,
          description: response.data.data.description || '',
          status: normalizeTaskStatus(response.data.data.status),
          priority: response.data.data.priority || 'medium',
          assignedTo: response.data.data.assignedTo || '',
          dueDate: response.data.data.dueDate,
          createdAt: response.data.data.createdAt,
          updatedAt: response.data.data.updatedAt
        };
        return updatedTask;
      }
      
      throw new Error('Failed to update task on server');
    } catch (error) {
      console.error('Error updating task on server:', error);
      
      // Fallback to localStorage when server is not available
      try {
        const storedTasks = localStorage.getItem('tasks');
        if (!storedTasks) {
          throw new Error('No tasks found in localStorage');
        }
        
        const tasks = JSON.parse(storedTasks);
        
        const updatedTasks = tasks.map((task: Task) => {
          if (task.id === id) {
            return {
              ...task,
              ...taskData,
              updatedAt: new Date().toISOString()
            };
          }
          return task;
        });
        
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        // Return the updated task
        const updatedTask = updatedTasks.find((task: Task) => task.id === id);
        if (!updatedTask) {
          throw new Error('Task not found in localStorage');
        }
        
        return updatedTask;
      } catch (error) {
        console.error('Error updating task in localStorage:', error);
        throw error;
      }
    }
  },
  
  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    try {
      // Send request to server
      await apiClient.delete(`/tasks/${id}`);
      
      // Server successfully deleted the task
      console.log(`Task ${id} deleted on server`);
    } catch (error) {
      console.error('Error deleting task on server:', error);
      
      // Fallback to localStorage when server is not available
      try {
        // Get existing tasks
        const storedTasks = localStorage.getItem('tasks');
        if (!storedTasks) {
          return; // No tasks to delete
        }
        
        const tasks = JSON.parse(storedTasks);
        
        // Check if tasks array is valid
        if (!Array.isArray(tasks)) {
          console.error('Invalid tasks format in localStorage');
          return;
        }
        
        // Filter out the task to delete
        const updatedTasks = tasks.filter((task: Task) => task.id !== id);
        
        // Store the updated tasks array
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        console.log(`Task ${id} deleted from localStorage. Remaining tasks: ${updatedTasks.length}`);
      } catch (error) {
        console.error('Error deleting task from localStorage:', error);
        throw error;
      }
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