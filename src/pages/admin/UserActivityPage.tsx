import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { Card, Button, Input } from '../../components/ui';
import { UserActivity } from '../../components/admin';
import { adminApi, User } from '../../services/apiService';

const UserActivityPage: React.FC = () => {
  const { t } = useLanguage();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [searchUserId, setSearchUserId] = useState(userId || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchUserId.trim()) {
      setErrorMessage('Пожалуйста, введите ID пользователя');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      
      const user = await adminApi.getUserById(searchUserId);
      setUserDetails(user);
      
      if (searchUserId !== userId) {
        navigate(`/admin/user-activity/${searchUserId}`);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setErrorMessage('Пользователь не найден');
      setUserDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUserId(e.target.value);
    setErrorMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          История активности пользователя
        </h1>
        
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="ID пользователя"
                value={searchUserId}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errorMessage}
                placeholder="Введите ID пользователя"
                disabled={loading}
              />
            </div>
            <div>
              <Button
                onClick={handleSearch}
                isLoading={loading}
                disabled={loading}
                className="w-full md:w-auto"
              >
                Найти
              </Button>
            </div>
          </div>
          
          {userDetails && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-white">Информация о пользователе</h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Имя:</p>
                  <p className="text-gray-800 dark:text-white">{userDetails.name || 'Н/Д'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email:</p>
                  <p className="text-gray-800 dark:text-white">{userDetails.email || 'Н/Д'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Роль:</p>
                  <p className="text-gray-800 dark:text-white">{userDetails.role || 'Н/Д'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Последний вход:</p>
                  <p className="text-gray-800 dark:text-white">
                    {userDetails.lastLogin 
                      ? new Date(userDetails.lastLogin).toLocaleString('ru-RU')
                      : 'Никогда'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {userId && (
          <UserActivity userId={userId} limit={100} />
        )}
        
        {!userId && !userDetails && (
          <div className="bg-blue-50 border border-blue-400 text-blue-700 p-4 rounded-lg dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200">
            <p>Введите ID пользователя, чтобы просмотреть историю его активности.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserActivityPage; 