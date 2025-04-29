import axios from 'axios';
import { getAuthToken } from '../authService';

export interface Activity {
  _id: string;
  userId: string;
  type: string;
  action: string;
  target?: string;
  targetId?: string;
  timestamp: string;
  details?: any;
}

// Обновляем URL на основе логов сервера
const API_URL = '/api/admin/stats/activity';

// Получение токена аутентификации
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Получение списка активностей пользователя
const getUserActivity = async (limit?: number, offset?: number): Promise<Activity[]> => {
  try {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await axios.get(`${API_URL}/user`, {
      ...getAuthHeaders(),
      params
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

// Получение активности по конкретному объекту
const getObjectActivity = async (objectType: string, objectId: string): Promise<Activity[]> => {
  try {
    const response = await axios.get(`${API_URL}/object`, {
      ...getAuthHeaders(),
      params: {
        type: objectType,
        id: objectId
      }
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching activity for ${objectType} ${objectId}:`, error);
    throw error;
  }
};

// Получение статистики активности
const getActivityStats = async (startDate?: string, endDate?: string): Promise<any> => {
  try {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axios.get(`/api/admin/stats`, {
      ...getAuthHeaders(),
      params
    });
    
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    throw error;
  }
};

export const activityService = {
  getUserActivity,
  getObjectActivity,
  getActivityStats
};

export default activityService; 