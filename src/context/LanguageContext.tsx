import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageType = 'ru' | 'en' | 'kz';

// Добавляем тип для вложенных переводов
type TranslationValue = string | Record<string, string | Record<string, string>>;
type TranslationsRecord = Record<string, TranslationValue>;

interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string, params?: Record<string, any>) => string;
  t2: (key: string, params?: Record<string, any>) => string;
  translations: TranslationsRecord;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as LanguageType) || 'ru';
  });
  
  const [translations, setTranslations] = useState<Record<string, TranslationsRecord>>({});

  useEffect(() => {
    // Загрузка переводов при монтировании компонента
    const loadTranslations = async () => {
      try {
        // Динамический импорт всех переводов
        const ruTranslations = await import('../locales/ru.json');
        const enTranslations = await import('../locales/en.json');
        const kzTranslations = await import('../locales/kz.json');
        
        // Обрабатываем импорты, которые могут иметь свойство default из-за способа импорта JSON
        const getRaw = (translation: any) => translation.default || translation;
        
        const translationsData = {
          ru: getRaw(ruTranslations),
          en: getRaw(enTranslations),
          kz: getRaw(kzTranslations)
        };
        
        // Проверка наличия ключевых переводов
        console.log("Translations loaded:", {
          ru_clients: translationsData.ru['clients'],
          en_clients: translationsData.en['clients'],
          ru_tasks: translationsData.ru['tasks'],
          en_tasks: translationsData.en['tasks']
        });
        
        setTranslations(translationsData);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };
    
    loadTranslations();
  }, []);

  useEffect(() => {
    // Сохраняем язык в localStorage
    localStorage.setItem('language', language);
    
    // Устанавливаем атрибут lang для html
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
  };

  // Функция перевода
  const t = (key: string, params?: Record<string, any>): string => {
    // Если переводы еще не загружены или ключа нет, возвращаем сам ключ
    if (!translations[language]) {
      console.log("Translations not loaded", key);
      return key;
    }

    // Проверяем на вложенные ключи (например, 'tasks.title')
    const parts = key.split('.');
    let text: string;
    
    if (parts.length > 1) {
      let current: any = translations[language];
      for (const part of parts) {
        if (!current || !current[part]) {
          console.log("Missing nested key", key, part);
          return key;
        }
        current = current[part];
      }
      text = typeof current === 'string' ? current : JSON.stringify(current);
    } else {
      // Для простых ключей
      const value = translations[language][key];
      if (typeof value === 'string') {
        text = value;
      } else if (value === undefined) {
        console.log("Missing key", key);
        return key;
      } else {
        // Если значение - объект, возвращаем строку с ключом
        console.log("Object value for key", key);
        return key;
      }
    }
    
    // Интерполяция параметров
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  // Добавляем простую реализацию для прямого доступа к ключам верхнего уровня
  const t2 = (key: string, params?: Record<string, any>): string => {
    if (!translations[language]) {
      return key;
    }
    
    // Простая реализация для отладки
    const value = translations[language][key];
    if (typeof value === 'string') {
      return value;
    }
    
    // Возвращаем ключ, если значение не найдено или не является строкой
    return key;
  };

  // Создаем копию translations только со строковыми значениями
  const safeTranslations: TranslationsRecord = {};
  if (translations[language]) {
    Object.entries(translations[language]).forEach(([key, value]) => {
      if (typeof value === 'string') {
        safeTranslations[key] = value;
      }
    });
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, t2, translations: safeTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
}; 