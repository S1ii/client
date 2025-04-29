import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Service } from '../services/api/servicesService';

export interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  theme: string;
  t: (key: string) => string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  onMenuOpen,
  theme,
  t
}) => {
  const { _id, name, description, price, currency = 'KZT', duration, category, isActive = true } = service;
  
  const cardBgClass = theme === 'dark' ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:bg-slate-50';
  const cardTextClass = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const cardBorderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const accentTextClass = theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600';
  
  return (
    <Card 
      className={`${cardBgClass} ${cardBorderClass} border rounded-xl shadow-sm h-full transition-all duration-200 hover:shadow-md relative`}
    >
      <CardContent className="pb-4 h-full flex flex-col">
        <Box className="flex justify-between items-start mb-2">
          <Typography 
            variant="h6" 
            component="h3" 
            className={`${cardTextClass} font-semibold`}
          >
            {name}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => onMenuOpen(e, _id)}
            className={theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {category && (
          <Chip 
            label={category} 
            size="small"
            className="mb-3 max-w-fit"
            sx={{
              backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
              color: theme === 'dark' ? 'rgb(129, 140, 248)' : 'rgb(79, 70, 229)',
              fontWeight: 500,
            }}
          />
        )}
        
        <Typography 
          variant="body2" 
          className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-3 flex-grow line-clamp-3`}
        >
          {description}
        </Typography>
        
        <Box className="mt-auto pt-2">
          <Box className="flex items-baseline justify-between">
            <Typography 
              variant="h6" 
              component="span" 
              className={`${accentTextClass} font-bold`}
            >
              {typeof price === 'number' ? price.toLocaleString() : price} {currency}
            </Typography>
            
            {duration && (
              <Typography 
                variant="body2" 
                className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
              >
                {duration}
              </Typography>
            )}
          </Box>
          
          <Box className="flex mt-2 items-center">
            <Box 
              component="span" 
              className={`inline-block w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <Typography 
              variant="caption" 
              className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
            >
              {isActive ? t('status_active') : t('status_inactive')}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ServiceCard; 