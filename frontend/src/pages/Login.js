import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  Tooltip,
} from '@mui/material';
import { Visibility, VisibilityOff, LightMode, DarkMode } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import { ThemeContext } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const loginMutation = useMutation(api.login, {
    onSuccess: (response) => {
      const { access, refresh } = response.data;
      authService.login(access, refresh, rememberMe);
      // Disparar evento para que AppContext recargue los datos
      window.dispatchEvent(new Event('auth-login'));
      toast.success('¡Inicio de sesión exitoso!');
      // Redirigir usando navigate para mantener el SPA
      navigate('/app', { replace: true });
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast.error(
        error.response?.data?.detail ||
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleGoogleLogin = () => {
    // Para OAuth no usamos /api/v1/, va directo al dominio
    const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace('/api/v1', '');
    window.location.href = `${BASE_URL}/accounts/google/login/?process=login`;
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'background.default',
      overflow: 'auto'
    }}>
      {/* Theme Toggle Button */}
      <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 10,
            color: 'text.secondary',
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'primary.main',
            }
          }}
        >
          {mode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
      </Tooltip>

      {/* Background decoration */}
      <Box
        sx={{
          position: 'fixed',
          filter: 'blur(18px)',
          zIndex: 0,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 0.08,
          pointerEvents: 'none'
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 405 809" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <path
            d="M-358.39 358.707L-293.914 294.23L-293.846 294.163H-172.545L-220.81 342.428L-233.272 354.889L-282.697 404.314L-276.575 410.453L0.316589 687.328L283.33 404.314L233.888 354.889L230.407 351.391L173.178 294.163H294.48L294.547 294.23L345.082 344.765L404.631 404.314L0.316589 808.629L-403.998 404.314L-358.39 358.707ZM0.316589 0L233.938 233.622H112.637L0.316589 121.301L-112.004 233.622H-233.305L0.316589 0Z"
            fill="#1976d2"
          />
        </svg>
      </Box>

      <Box
        sx={{
          maxWidth: 475,
          width: '100%',
          margin: 2.5,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 14px 0 rgba(0,0,0,0.1)',
            p: { xs: 2, sm: 3, md: 4, xl: 5 },
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack 
                direction="row" 
                sx={{ 
                  alignItems: 'baseline', 
                  justifyContent: 'space-between', 
                  mb: { xs: -0.5, sm: 0.5 } 
                }}
              >
                <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
                  Iniciar Sesión
                </Typography>
                <Typography
                  component={Link}
                  to="/register"
                  variant="body1"
                  sx={{ textDecoration: 'none', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                >
                  ¿No tienes cuenta?
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="username-login">Nombre de usuario</InputLabel>
                      <Controller
                        name="username"
                        control={control}
                        rules={{ required: 'El nombre de usuario es requerido' }}
                        render={({ field }) => (
                          <OutlinedInput
                            {...field}
                            id="username-login"
                            type="text"
                            placeholder="Ingresa tu nombre de usuario"
                            fullWidth
                            error={Boolean(errors.username)}
                          />
                        )}
                      />
                    </Stack>
                    {errors.username && (
                      <FormHelperText error id="username-login-helper">
                        {errors.username.message}
                      </FormHelperText>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="password-login">Contraseña</InputLabel>
                      <Controller
                        name="password"
                        control={control}
                        rules={{ 
                          required: 'La contraseña es requerida',
                          minLength: {
                            value: 6,
                            message: 'La contraseña debe tener al menos 6 caracteres'
                          }
                        }}
                        render={({ field }) => (
                          <OutlinedInput
                            {...field}
                            fullWidth
                            error={Boolean(errors.password)}
                            id="password-login"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  edge="end"
                                  size="large"
                                >
                                  {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>
                            }
                            placeholder="Ingresa tu contraseña"
                          />
                        )}
                      />
                    </Stack>
                    {errors.password && (
                      <FormHelperText error id="password-login-helper">
                        {errors.password.message}
                      </FormHelperText>
                    )}
                  </Grid>

                  <Grid item xs={12} sx={{ mt: -1 }}>
                    <Stack 
                      direction="row" 
                      sx={{ 
                        gap: 2, 
                        alignItems: 'baseline', 
                        justifyContent: 'space-between' 
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                            name="rememberMe"
                            color="primary"
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">Mantenerme conectado</Typography>}
                      />
                      <MuiLink
                        variant="body2"
                        component={Link}
                        to="/forgot-password"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        ¿Olvidaste tu contraseña?
                      </MuiLink>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loginMutation.isLoading}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {loginMutation.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 2 }}>
                      <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
                      <Typography variant="body2" color="text.secondary">
                        O
                      </Typography>
                      <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      size="large"
                      variant="outlined"
                      startIcon={<GoogleIcon />}
                      onClick={handleGoogleLogin}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        }
                      }}
                    >
                      Continuar con Google
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;