# CRM Client

Клиентская часть приложения для управления взаимоотношениями с клиентами.

## Технологии

- React 19
- TypeScript
- Material UI 7
- React Router 7
- Recharts для визуализации данных
- Tailwind CSS
- Axios для HTTP-запросов
- DnD Kit для drag-and-drop функциональности

## Установка

```bash
npm install
```

## Конфигурация

Создайте файл `.env` в корневой папке клиента:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Запуск приложения

```bash
# Режим разработки
npm start

# Сборка для продакшн
npm run build
```

В режиме разработки приложение запустится по адресу: `http://localhost:3000`

## Основные возможности

- Авторизация и регистрация пользователей
- Управление клиентами
- Управление задачами с возможностью перетаскивания (drag-and-drop)
- Управление организациями
- Панель администратора с аналитикой и показателями эффективности
- Адаптивный дизайн для мобильных устройств и десктопа

## Структура проекта

```
client/
├── public/              # Статические файлы
├── src/                 # Исходный код
│   ├── assets/          # Изображения и другие медиа-файлы
│   ├── components/      # Переиспользуемые компоненты
│   ├── context/         # React контексты
│   ├── hooks/           # Пользовательские хуки
│   ├── layouts/         # Макеты страниц
│   ├── pages/           # Компоненты страниц
│   ├── services/        # Сервисы для работы с API
│   ├── store/           # Управление состоянием (если используется)
│   ├── types/           # TypeScript типы/интерфейсы
│   ├── utils/           # Вспомогательные функции
│   ├── App.tsx          # Корневой компонент приложения
│   └── index.tsx        # Точка входа приложения
├── .env                 # Переменные окружения
├── package.json         # Зависимости и скрипты
├── tailwind.config.js   # Конфигурация Tailwind CSS
└── tsconfig.json        # Конфигурация TypeScript
```

## Тестирование

```bash
npm test
```

## Деплой

Для деплоя приложения выполните:

```bash
npm run build
```

Результат сборки будет в папке `build/`, которую можно разместить на любом статическом хостинге (Netlify, Vercel, Firebase Hosting и т.д.).

## Взаимодействие с сервером

Приложение взаимодействует с бэкендом через RESTful API. Убедитесь, что сервер запущен и доступен по адресу, указанному в переменной окружения `REACT_APP_API_URL`.

# Services Management

The Services management functionality allows users to create, edit, view, and delete services in the system.

## Features

- **Services Page**: Displays a list of all services with filter and sort capabilities
- **Create/Edit Services**: Form to add new services or edit existing ones
- **Service Details**: View detailed information about a service
- **Service Status**: Toggle service active/inactive status
- **Delete Services**: Remove services from the system

## User Interface

The Services page provides the following UI elements:

- **Search Bar**: Search for services by name, description, or category
- **Filter Options**: Filter services by category
- **Sort Options**: Sort services by name, price, or category
- **Services Grid**: Display services in a grid layout with cards

## Service Properties

Each service includes the following information:

- **Name**: The name of the service
- **Description**: Detailed description of what the service provides
- **Price**: The cost of the service
- **Currency**: Currency used for pricing (RUB, USD, EUR, KZT)
- **Category**: Optional categorization of the service
- **Duration**: Optional indication of how long the service takes

## Localization

The Services page is fully localized in three languages:
- Russian
- English
- Kazakh

## Admin Panel Integration

Administrators have access to additional service management features through the Admin Panel:
- **Services Tab**: Dedicated tab for service management
- **Status Controls**: Enable/disable services
- **Batch Operations**: Efficient management of multiple services

## API Integration

The service functionality uses the following API endpoints:
- GET `/api/services` - List all services
- GET `/api/services/:id` - Get details for a specific service
- POST `/api/services` - Create a new service
- PUT `/api/services/:id` - Update an existing service
- DELETE `/api/services/:id` - Delete a service
- PATCH `/api/services/:id/toggle-status` - Toggle service active status 