import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  Chip,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Divider,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  DialogContentText,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTheme } from '../context/ThemeContext';
import { servicesService, Service as ServiceType, ServiceInput } from '../services/api/servicesService';
import ServiceCard from '../components/ServiceCard';

const ServicesPage: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Services state
  const [services, setServices] = useState<ServiceType[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter and sort state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'price' | 'category'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(null);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    price: '',
  });

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuServiceId, setMenuServiceId] = useState<string | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  // Form for creating/editing a service
  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: string;
    currency: string;
    duration: string;
    category: string;
  }>({
    name: '',
    description: '',
    price: '',
    currency: 'KZT',
    duration: '',
    category: '',
  });
  
  // Theme-based classes
  const cardBgClass = theme === 'dark' ? 'bg-slate-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm';
  const cardTextClass = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const subTextClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-500';
  const tableBorderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  
  // Load services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await servicesService.getServices();
        setServices(data);
        setFilteredServices(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || t('services_error_loading'));
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [t]);
  
  // Filter services when search query or tab changes
  useEffect(() => {
    let filtered = [...services];
    
    // Apply category filter based on active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(service => service.category === activeTab);
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          (service.category && service.category.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] || '';
      let bValue: string | number = b[sortField] || '';
      
      // Convert prices to numbers for proper sorting
      if (sortField === 'price') {
        aValue = Number(a.price);
        bValue = Number(b.price);
      } 
      
      if (sortDirection === 'asc') {
        return typeof aValue === 'string' 
          ? aValue.localeCompare(bValue as string) 
          : (aValue as number) - (bValue as number);
      } else {
        return typeof bValue === 'string' 
          ? bValue.localeCompare(aValue as string) 
          : (bValue as number) - (aValue as number);
      }
    });
    
    setFilteredServices(filtered);
  }, [searchQuery, services, activeTab, sortField, sortDirection]);
  
  // Unique categories for filtering
  const categories = Array.from(new Set(services.map(service => service.category).filter(Boolean))) as string[];
  
  // Dialog handlers
  const handleOpenDialog = (service?: ServiceType) => {
    // Reset form state
    setFormErrors({
      name: '',
      description: '',
      price: '',
    });
    
    if (service) {
      setCurrentService(service);
      setForm({
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        currency: service.currency || 'KZT',
        duration: service.duration?.toString() || '',
        category: service.category || '',
      });
    } else {
      setCurrentService(null);
      setForm({
        name: '',
        description: '',
        price: '',
        currency: 'KZT',
        duration: '',
        category: '',
      });
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleOpenDeleteDialog = (service: ServiceType) => {
    setCurrentService(service);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setForm(prev => ({ ...prev, [name]: value }));
      
      // Clear validation error when user types
      if (Object.keys(formErrors).includes(name)) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Menu handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, serviceId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuServiceId(serviceId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuServiceId(null);
  };

  // Form validation
  const validateForm = () => {
    const errors = {
      name: '',
      description: '',
      price: '',
    };
    let isValid = true;
    
    if (!form.name.trim()) {
      errors.name = t('form_required_field');
      isValid = false;
    }
    
    if (!form.description.trim()) {
      errors.description = t('form_required_field');
      isValid = false;
    }
    
    if (!form.price.trim()) {
      errors.price = t('form_required_field');
      isValid = false;
    } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      errors.price = t('form_invalid_price');
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Save service (create or update)
  const handleSaveService = async () => {
    if (!validateForm()) return;
    
    const serviceData: ServiceInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      currency: form.currency,
      duration: form.duration.trim() || undefined,
      category: form.category.trim() || undefined,
    };
    
    try {
      if (currentService) {
        // Update existing service
        const updatedService = await servicesService.updateService(currentService._id, serviceData);
        setServices(prev => prev.map(s => s._id === updatedService._id ? updatedService : s));
        showSnackbar(t('services_success_update'), 'success');
      } else {
        // Create new service
        const newService = await servicesService.createService(serviceData);
        setServices(prev => [...prev, newService]);
        showSnackbar(t('services_success_create'), 'success');
      }
      handleCloseDialog();
    } catch (err: any) {
      showSnackbar(err.message || t('services_error_operation'), 'error');
    }
  };
  
  // Delete service
  const handleDeleteService = async () => {
    if (!currentService) return;
    
    try {
      await servicesService.deleteService(currentService._id);
      setServices(prev => prev.filter(s => s._id !== currentService._id));
      showSnackbar(t('services_success_delete'), 'success');
      handleCloseDeleteDialog();
    } catch (err: any) {
      showSnackbar(err.message || t('services_error_operation'), 'error');
    }
  };
  
  // Toggle service active status
  const handleToggleStatus = async (id: string) => {
    try {
      const updatedService = await servicesService.toggleServiceStatus(id);
      setServices(prev => prev.map(s => s._id === id ? updatedService : s));
      showSnackbar(
        updatedService.isActive 
          ? t('service_activated_successfully') 
          : t('service_deactivated_successfully'),
        'success'
      );
      handleCloseMenu();
    } catch (err: any) {
      showSnackbar(err.message || t('services_error_operation'), 'error');
    }
  };
  
  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };
  
  // Filter dialog handlers
  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };
  
  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };
  
  // Sort dialog handlers
  const handleOpenSortDialog = () => {
    setSortDialogOpen(true);
  };
  
  const handleCloseSortDialog = () => {
    setSortDialogOpen(false);
  };
  
  // Change sort field and direction
  const handleSortChange = (field: 'name' | 'price' | 'category') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new field
      setSortField(field);
      setSortDirection('asc');
    }
    handleCloseSortDialog();
  };
  
  // Snackbar handlers
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-6">
        <Typography variant="h4" className={`font-bold ${cardTextClass}`}>
          {t('services_title')}
        </Typography>
        <Typography variant="body1" className={subTextClass}>
          {t('services_subtitle')}
        </Typography>
      </Box>
      
      {/* Action bar */}
      <Paper elevation={0} className={`${cardBgClass} mb-6 p-4 rounded-lg shadow-sm`}>
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-1/2 md:w-5/12 lg:w-1/2">
            <TextField
              placeholder={t('services_search_placeholder')}
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-gray-400" />
                  </InputAdornment>
                ),
                className: "bg-white/70 dark:bg-slate-800/70 rounded-md"
              }}
              size="small"
            />
          </div>
          <div className="w-full sm:w-1/2 md:w-7/12 lg:w-1/2 flex justify-end gap-2 flex-wrap">
            <Button
              startIcon={<FilterListIcon />}
              variant="outlined"
              onClick={handleOpenFilterDialog}
              className="bg-white/70 dark:bg-slate-800/70 border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 whitespace-nowrap"
              size="small"
            >
              {t('filter_services')}
            </Button>
            <Button
              startIcon={<SortIcon />}
              variant="outlined"
              onClick={handleOpenSortDialog}
              className="bg-white/70 dark:bg-slate-800/70 border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 whitespace-nowrap"
              size="small"
            >
              {t('sort_services')}
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 whitespace-nowrap"
              size="small"
            >
              {t('services_add_new')}
            </Button>
          </div>
        </div>
      </Paper>
      
      {/* Tabs */}
      <Box className="mb-4 bg-white/70 dark:bg-slate-800/70 rounded-lg p-1 shadow-sm">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="service category tabs"
          variant="scrollable"
          scrollButtons="auto"
          className="min-h-[48px]"
          TabIndicatorProps={{
            style: { 
              backgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
              height: '3px',
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab 
            value="all" 
            label={t('all')} 
            className="min-h-[48px] text-sm font-medium"
          />
          {categories.map(category => (
            <Tab 
              key={category} 
              value={category} 
              label={category} 
              className="min-h-[48px] text-sm font-medium"
            />
          ))}
        </Tabs>
      </Box>
      
      {/* Services list */}
      <Box className="mb-6">
        {loading ? (
          <Box className="flex justify-center items-center py-12">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper elevation={0} className={`${cardBgClass} p-6 rounded-lg text-center`}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              {t('reload')}
            </Button>
          </Paper>
        ) : filteredServices.length === 0 ? (
          <Paper elevation={0} className={`${cardBgClass} p-6 rounded-lg text-center`}>
            <Typography className={cardTextClass}>
              {searchQuery 
                ? t('no_services_found_for_query') 
                : activeTab !== 'all'
                  ? t('no_services_in_category') 
                  : t('no_services_available')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              className="mt-4"
              onClick={() => handleOpenDialog()}
            >
              {t('services_add_new')}
            </Button>
          </Paper>
        ) : (
          <div className="flex flex-wrap -mx-3">
            {filteredServices.map((service) => (
              <div className="w-full sm:w-1/2 md:w-1/3 px-3 mb-6" key={service._id}>
                <ServiceCard
                  service={service}
                  onEdit={handleOpenDialog}
                  onDelete={handleOpenDeleteDialog}
                  onMenuOpen={handleOpenMenu}
                  theme={theme}
                  t={t}
                />
              </div>
            ))}
          </div>
        )}
      </Box>
      
      {/* Create/Edit Service Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle className={`${cardBgClass} border-b ${tableBorderClass}`}>
          <Typography className="font-bold">
            {currentService ? t('services_edit') : t('services_create')}
          </Typography>
        </DialogTitle>
        <DialogContent className={cardBgClass} dividers>
          <Box className="space-y-4 py-2">
            <TextField
              label={t('services_name')}
              name="name"
              fullWidth
              required
              value={form.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              variant="outlined"
              className="bg-white/50 dark:bg-slate-800/50 rounded-md"
            />
            
            <TextField
              label={t('services_description')}
              name="description"
              fullWidth
              required
              multiline
              rows={4}
              value={form.description}
              onChange={handleInputChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
              variant="outlined"
              className="bg-white/50 dark:bg-slate-800/50 rounded-md"
            />
            
            <div className="flex flex-wrap -mx-2">
              <div className="w-2/3 sm:w-3/4 px-2">
                <TextField
                  label={t('services_price')}
                  name="price"
                  type="number"
                  fullWidth
                  value={form.price}
                  onChange={handleInputChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                  variant="outlined"
                  className="bg-white/50 dark:bg-slate-800/50 rounded-md"
                />
              </div>
              <div className="w-1/3 sm:w-1/4 px-2">
                <FormControl fullWidth variant="outlined" className="bg-white/50 dark:bg-slate-800/50 rounded-md">
                  <InputLabel id="currency-select-label">{t('services_currency')}</InputLabel>
                  <Select
                    labelId="currency-select-label"
                    id="currency-select"
                    name="currency"
                    value={form.currency}
                    label={t('services_currency')}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="KZT">KZT</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="RUB">RUB</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            
            <TextField
              label={t('services_duration')}
              name="duration"
              fullWidth
              value={form.duration}
              onChange={handleInputChange}
              placeholder="2 часа, 30 минут и т.д."
              variant="outlined"
              className="bg-white/50 dark:bg-slate-800/50 rounded-md"
            />
            
            <TextField
              label={t('services_category')}
              name="category"
              fullWidth
              value={form.category}
              onChange={handleInputChange}
              variant="outlined"
              className="bg-white/50 dark:bg-slate-800/50 rounded-md"
            />
          </Box>
        </DialogContent>
        <DialogActions className={`${cardBgClass} border-t ${tableBorderClass} p-3 flex justify-end gap-2`}>
          <Button 
            onClick={handleCloseDialog} 
            className="border border-slate-300 dark:border-slate-600"
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSaveService} 
            variant="contained" 
            color="primary"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className={`${cardBgClass} border-b ${tableBorderClass}`}>
          <Typography className="font-bold flex items-center gap-2">
            <DeleteIcon className="text-red-500" /> {t('services_delete_title')}
          </Typography>
        </DialogTitle>
        <DialogContent className={cardBgClass} dividers>
          <DialogContentText>
            {t('services_delete_confirm')} <strong>{currentService?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions className={`${cardBgClass} border-t ${tableBorderClass} p-3 flex justify-end gap-2`}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            className="border border-slate-300 dark:border-slate-600"
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleDeleteService} 
            variant="contained" 
            color="error"
            className="bg-red-600 hover:bg-red-700"
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className={`${cardBgClass} border-b ${tableBorderClass}`}>
          <Box className="flex items-center gap-2">
            <FilterListIcon className="text-blue-500" />
            <Typography className="font-bold">{t('services_filter_dialog_title')}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className={cardBgClass} dividers>
          <Typography variant="subtitle2" className="mb-3 text-slate-500">
            {t('services_filter_by_category')}
          </Typography>
          <Box className="flex flex-wrap gap-2">
            <Chip
              label={t('all')}
              clickable
              color={activeTab === 'all' ? 'primary' : 'default'}
              onClick={() => {
                setActiveTab('all');
                handleCloseFilterDialog();
              }}
              className={activeTab === 'all' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white/80 dark:bg-slate-700/80'}
            />
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                clickable
                color={activeTab === category ? 'primary' : 'default'}
                onClick={() => {
                  setActiveTab(category);
                  handleCloseFilterDialog();
                }}
                className={activeTab === category ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white/80 dark:bg-slate-700/80'}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions className={`${cardBgClass} border-t ${tableBorderClass} p-3`}>
          <Button onClick={handleCloseFilterDialog} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sort Dialog */}
      <Dialog
        open={sortDialogOpen}
        onClose={handleCloseSortDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className={`${cardBgClass} border-b ${tableBorderClass}`}>
          <Box className="flex items-center gap-2">
            <SortIcon className="text-blue-500" />
            <Typography className="font-bold">{t('services_sort_dialog_title')}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className={cardBgClass} dividers>
          <Typography variant="subtitle2" className="mb-3 text-slate-500">
            {t('services_sort_by')}
          </Typography>
          
          <List className="bg-white/50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
            <ListItem 
              disablePadding
              className={sortField === 'name' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            >
              <div onClick={() => handleSortChange('name')} className="flex items-center w-full px-4 py-2 cursor-pointer">
                <ListItemIcon>
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon className="text-blue-500" /> : <ArrowDownwardIcon className="text-blue-500" />
                  )}
                </ListItemIcon>
                <ListItemText primary={t('services_sort_name')} />
              </div>
            </ListItem>
            
            <Divider component="li" />
            
            <ListItem 
              disablePadding
              className={sortField === 'price' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            >
              <div onClick={() => handleSortChange('price')} className="flex items-center w-full px-4 py-2 cursor-pointer">
                <ListItemIcon>
                  {sortField === 'price' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon className="text-blue-500" /> : <ArrowDownwardIcon className="text-blue-500" />
                  )}
                </ListItemIcon>
                <ListItemText primary={t('services_sort_price')} />
              </div>
            </ListItem>
            
            <Divider component="li" />
            
            <ListItem 
              disablePadding
              className={sortField === 'category' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            >
              <div onClick={() => handleSortChange('category')} className="flex items-center w-full px-4 py-2 cursor-pointer">
                <ListItemIcon>
                  {sortField === 'category' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon className="text-blue-500" /> : <ArrowDownwardIcon className="text-blue-500" />
                  )}
                </ListItemIcon>
                <ListItemText primary={t('services_sort_category')} />
              </div>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions className={`${cardBgClass} border-t ${tableBorderClass} p-3`}>
          <Button onClick={handleCloseSortDialog} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Service Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          if (menuServiceId) {
            const service = services.find(s => s._id === menuServiceId);
            if (service) handleOpenDialog(service);
          }
          handleCloseMenu();
        }}>
          <EditIcon fontSize="small" className="mr-2" />
          {t('edit')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (menuServiceId) {
            const service = services.find(s => s._id === menuServiceId);
            if (service) handleToggleStatus(service._id);
          }
        }}>
          <VisibilityIcon fontSize="small" className="mr-2" />
          {menuServiceId && services.find(s => s._id === menuServiceId)?.isActive
            ? t('deactivate')
            : t('activate')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (menuServiceId) {
            const service = services.find(s => s._id === menuServiceId);
            if (service) handleOpenDeleteDialog(service);
          }
          handleCloseMenu();
        }}>
          <DeleteIcon fontSize="small" className="mr-2" />
          {t('delete')}
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicesPage; 