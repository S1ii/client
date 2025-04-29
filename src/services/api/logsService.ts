import axios from 'axios';
import { getAuthToken } from '../authService';

export interface LogEntry {
  _id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  timestamp: string;
  details?: any;
  userId?: string;
}

// Обновляем URL на основе логов сервера
const API_URL = '/api/admin/system-logs';

// Получение токена аутентификации
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Получение системных логов
const getSystemLogs = async (
  options: {
    level?: 'info' | 'warn' | 'error' | 'debug';
    startDate?: string;
    endDate?: string;
    source?: string;
    limit?: number;
    offset?: number;
    filter?: string;
  } = {}
): Promise<LogEntry[]> => {
  try {
    const response = await axios.get(API_URL, {
      ...getAuthHeaders(),
      params: options
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching system logs:', error);
    throw error;
  }
};

// Получение статистики по логам
const getLogsStats = async (startDate?: string, endDate?: string): Promise<any> => {
  try {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axios.get(`${API_URL}/stats`, {
      ...getAuthHeaders(),
      params
    });
    
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching logs statistics:', error);
    throw error;
  }
};

// Очистка логов (только для админов)
const clearLogs = async (options: { level?: string; olderThan?: string } = {}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(API_URL, {
      ...getAuthHeaders(),
      params: options
    });
    
    return response.data;
  } catch (error) {
    console.error('Error clearing logs:', error);
    throw error;
  }
};

// Создание лога (обычно используется только внутренне)
const createLog = async (logData: Omit<LogEntry, '_id' | 'timestamp'>): Promise<LogEntry> => {
  try {
    const response = await axios.post(API_URL, logData, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    console.error('Error creating log entry:', error);
    throw error;
  }
};

export const logsService = {
  getSystemLogs,
  getLogsStats,
  clearLogs,
  createLog
};

export default logsService; 