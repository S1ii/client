// Organization interface for all organization-related components
export interface Organization {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'archived';
  user_id?: string; // ID пользователя, создавшего организацию
  createdAt?: string; // Дата создания
  updatedAt?: string; // Дата обновления
  
  // Следующие поля могут отсутствовать в базе данных и нужны только для UI
  // Их стоит добавить в модель базы данных, если они действительно нужны
  type?: string;
  industry?: string;
  employees?: number;
} 