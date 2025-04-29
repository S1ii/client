import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate?: string;
  status?: 'todo' | 'in_progress' | 'done';
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  id, 
  title, 
  description, 
  priority, 
  assignedTo, 
  dueDate,
  status,
  onClick
}) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition 
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusChip = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'todo':
        return <span className="text-xs bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full">Ожидает</span>;
      case 'in_progress':
        return <span className="text-xs bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full">В процессе</span>;
      case 'done':
        return <span className="text-xs bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full">Завершена</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Предотвращаем срабатывание клика при перетаскивании
    if (onClick && !transform) {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="bg-[var(--light-bg-primary)] dark:bg-[var(--dark-bg-primary)] rounded-lg shadow p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]">
          {title}
        </h3>
        <span className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} title={`Приоритет: ${priority}`}></span>
      </div>
      
      <p className="text-xs text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mb-3 line-clamp-2">
        {description}
      </p>
      
      <div className="flex justify-between items-end">
        <div className="flex flex-col text-xs space-y-1">
          <div className="flex items-center text-[var(--light-text-tertiary)] dark:text-[var(--dark-text-tertiary)]">
            <span className="material-icons text-sm mr-1">person</span>
            <span className="truncate">{assignedTo}</span>
          </div>
          
          {dueDate && (
            <div className="flex items-center text-[var(--light-text-tertiary)] dark:text-[var(--dark-text-tertiary)]">
              <span className="material-icons text-sm mr-1">event</span>
              <span>{formatDate(dueDate)}</span>
            </div>
          )}
        </div>
        
        {status && getStatusChip(status)}
      </div>
    </div>
  );
};

export default TaskCard; 