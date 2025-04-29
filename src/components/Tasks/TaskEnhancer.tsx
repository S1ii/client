import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './TaskCardStyle.css';

/**
 * Компонент для улучшения функциональности страницы задач
 * Автоматически применяет темную тему к компонентам задач и исправляет обновление списка
 */
const TaskEnhancer: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Применяем классы темы к контейнеру задач
    const taskContainer = document.querySelector('.MuiCard-root');
    if (taskContainer) {
      taskContainer.classList.add('task-container');
      
      if (theme === 'dark') {
        taskContainer.classList.add('dark');
        taskContainer.classList.remove('light');
      } else {
        taskContainer.classList.add('light');
        taskContainer.classList.remove('dark');
      }
    }

    // Исправление для заголовка
    const taskTitle = document.querySelector('.MuiTypography-h6');
    if (taskTitle && theme === 'dark') {
      taskTitle.classList.add('task-title', 'dark');
    }

    // Исправление для чипов
    const taskChips = document.querySelectorAll('.MuiChip-root');
    taskChips.forEach((chip, index) => {
      if (theme === 'dark') {
        if (index === 0) {
          chip.classList.add('chip-pending', 'dark');
          chip.classList.remove('light');
        }
        if (index === 1) {
          chip.classList.add('chip-inprogress', 'dark');
          chip.classList.remove('light');
        }
        if (index === 2) {
          chip.classList.add('chip-completed', 'dark');
          chip.classList.remove('light');
        }
      } else {
        if (index === 0) {
          chip.classList.add('chip-pending', 'light');
          chip.classList.remove('dark');
        }
        if (index === 1) {
          chip.classList.add('chip-inprogress', 'light');
          chip.classList.remove('dark');
        }
        if (index === 2) {
          chip.classList.add('chip-completed', 'light');
          chip.classList.remove('dark');
        }
      }
    });

    // Исправление для разделителя
    const taskDivider = document.querySelector('.MuiDivider-root');
    if (taskDivider && theme === 'dark') {
      taskDivider.classList.add('task-divider', 'dark');
    }

    // Исправление для элементов фильтрации и сортировки
    const formControls = document.querySelectorAll('.MuiFormControl-root');
    formControls.forEach(control => {
      if (theme === 'dark') {
        control.classList.add('dark');
      } else {
        control.classList.remove('dark');
      }
    });

    // Исправление для текстового поля поиска
    const textFields = document.querySelectorAll('.MuiTextField-root');
    textFields.forEach(field => {
      if (theme === 'dark') {
        field.classList.add('dark');
      } else {
        field.classList.remove('dark');
      }
    });

    // Исправление для выпадающих меню
    const observer = new MutationObserver((mutations) => {
      // Наблюдаем за DOM, чтобы найти открывающиеся меню
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const menuPapers = document.querySelectorAll('.MuiMenu-paper');
              menuPapers.forEach(paper => {
                if (theme === 'dark') {
                  paper.classList.add('dark');
                  
                  // Применяем темные стили к пунктам меню внутри
                  const menuItems = paper.querySelectorAll('.MuiMenuItem-root');
                  menuItems.forEach(item => {
                    item.classList.add('dark');
                  });
                }
              });
            }
          });
        }
      });
    });

    // Наблюдаем за изменениями в body, чтобы отловить создание меню
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Исправление проблемы с обновлением списка задач
    // Добавим обработчик для наблюдения за изменениями в DOM
    const taskObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Когда добавляются новые узлы, применяем анимацию
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && 
                (node as Element).classList.contains('space-y-3') &&
                (node as Element).children.length > 0) {
              const lastChild = (node as Element).children[(node as Element).children.length - 1];
              if (lastChild) {
                lastChild.classList.add('new-task');
              }
            }
          });
        }
      });
    });

    const taskList = document.querySelector('.space-y-3');
    if (taskList) {
      taskObserver.observe(taskList, { childList: true, subtree: true });
    }

    // Очистка при размонтировании
    return () => {
      observer.disconnect();
      taskObserver.disconnect();
    };
  }, [theme]);

  // Не рендерим ничего в DOM
  return null;
};

export default TaskEnhancer; 