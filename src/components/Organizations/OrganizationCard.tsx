import React, { useState } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { Organization } from './types';

export interface OrganizationCardProps {
  organization: Organization;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
  onView: (organization: Organization) => void;
  t: (key: string) => string;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onEdit,
  onDelete,
  onView,
  t
}) => {
  const { theme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(organization);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(organization);
    handleMenuClose();
  };

  const handleView = () => {
    onView(organization);
    handleMenuClose();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--success-color)] text-white';
      case 'inactive':
        return 'bg-[var(--light-text-muted)] dark:bg-[var(--dark-text-muted)] text-white';
      case 'prospect':
        return 'bg-[var(--primary-light)] text-white';
      default:
        return 'bg-[var(--light-text-muted)] dark:bg-[var(--dark-text-muted)] text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'inactive':
        return 'Неактивна';
      case 'prospect':
        return 'Потенциальная';
      default:
        return status;
    }
  };

  return (
    <Card className={`mb-4 rounded-xl ${theme === 'dark' ? 'bg-[var(--dark-bg-tertiary)]' : 'bg-white'} shadow-sm hover:shadow-md transition-all`}>
      <CardContent>
        <Box className="flex justify-between items-start">
          <Box>
            <Typography variant="h6" className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {organization.name}
            </Typography>
            <Typography variant="body2" className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              {organization.industry || 'Не указано'} {organization.type ? `• ${organization.type}` : ''}
            </Typography>
            <Box className="mt-2 flex items-center">
              <Chip
                label={getStatusText(organization.status)}
                size="small"
                className={`${getStatusBadgeClass(organization.status)} text-xs`}
              />
              {organization.employees && (
                <Typography variant="body2" className={`ml-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {organization.employees} {t('employees')}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              className: `${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'}`
            }}
          >
            <MenuItem onClick={handleView}>
              <VisibilityIcon fontSize="small" className="mr-2" /> {t('view')}
            </MenuItem>
            <MenuItem onClick={handleEdit}>
              <EditIcon fontSize="small" className="mr-2" /> {t('edit')}
            </MenuItem>
            <Divider className={`${theme === 'dark' ? 'bg-slate-700' : ''}`} />
            <MenuItem onClick={handleDelete} className="text-red-500">
              <DeleteIcon fontSize="small" className="mr-2" /> {t('delete')}
            </MenuItem>
          </Menu>
        </Box>
        <Box className="mt-4">
          <Typography variant="body2" className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('contact')}: </span>
            {organization.contactPerson}
          </Typography>
          <Typography variant="body2" className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mt-1`}>
            <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('organizations.phone')}: </span>
            {organization.phone}
          </Typography>
          <Typography variant="body2" className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mt-1`}>
            <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('email')}: </span>
            {organization.email}
          </Typography>
          <Typography variant="body2" className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mt-1`}>
            <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('address')}: </span>
            {organization.address}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrganizationCard; 