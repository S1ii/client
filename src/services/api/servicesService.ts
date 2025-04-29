import axios from 'axios';
import { getAuthToken } from '../authService';

export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  duration?: number | string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceInput {
  name: string;
  description: string;
  price: number | string;
  currency: string;
  duration?: string;
  category?: string;
}

const API_URL = '/api/services';

// Получение токена аутентификации
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const getServices = async (): Promise<Service[]> => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

const getServiceById = async (id: string): Promise<Service> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    throw error;
  }
};

const createService = async (serviceData: ServiceInput): Promise<Service> => {
  try {
    const response = await axios.post(API_URL, serviceData, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

const updateService = async (id: string, serviceData: Partial<ServiceInput>): Promise<Service> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, serviceData, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    console.error(`Error updating service with id ${id}:`, error);
    throw error;
  }
};

const deleteService = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  } catch (error) {
    console.error(`Error deleting service with id ${id}:`, error);
    throw error;
  }
};

const toggleServiceStatus = async (id: string): Promise<Service> => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/toggle-status`, {}, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    console.error(`Error toggling status for service with id ${id}:`, error);
    throw error;
  }
};

export const servicesService = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus
};

export default servicesService; 