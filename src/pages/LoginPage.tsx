import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  Container 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface LoginPageProps {
  login: (email: string, password: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ login }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // После успешного входа перенаправляем на страницу с организациями
      navigate('/organizations');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при входе. Пожалуйста, проверьте учетные данные.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
            color: theme === 'dark' ? 'white' : 'black'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Вход в систему
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                className: theme === 'dark' ? 'text-white' : '',
              }}
              InputLabelProps={{
                className: theme === 'dark' ? 'text-gray-300' : '',
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                className: theme === 'dark' ? 'text-white' : '',
              }}
              InputLabelProps={{
                className: theme === 'dark' ? 'text-gray-300' : '',
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              className="bg-[var(--primary-color)] hover:bg-[var(--primary-dark)]"
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>        
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 