import axios from 'axios';

// Константы
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

// API-клиент с базовыми настройками
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Интерфейс пользователя
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Интерфейс ответа авторизации
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Регистрация нового пользователя
export const register = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name,
      email,
      password
    });

    // Сохраняем токен и данные пользователя
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

    return response.data.user;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error;
  }
};

// Вход пользователя
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password
    });

    // Сохраняем токен и данные пользователя
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

    return response.data.user;
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error;
  }
};

// Выход пользователя
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Получение текущего пользователя из localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Получение токена из localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Проверка, аутентифицирован ли пользователь
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(TOKEN_KEY) !== null;
};

// Получение текущего пользователя с сервера
export const fetchCurrentUser = async (): Promise<User> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Токен не найден');
    }

    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    throw error;
  }
};

// Экспорт объекта сервиса
export const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getAuthToken,
  isAuthenticated,
  fetchCurrentUser
}; 