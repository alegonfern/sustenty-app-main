import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const access = searchParams.get('access');
    const refresh = searchParams.get('refresh');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Error al autenticar con Google');
      navigate('/login');
      return;
    }

    if (access && refresh) {
      // Guardar tokens
      authService.login(access, refresh, true);
      
      // Disparar evento para que AppContext recargue los datos
      window.dispatchEvent(new Event('auth-login'));
      
      toast.success('¡Inicio de sesión con Google exitoso!');
      navigate('/app');
    } else {
      toast.error('No se recibieron los tokens de autenticación');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">
        Completando autenticación...
      </Typography>
    </Box>
  );
}
