import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  FormHelperText,
  Link as MuiLink,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import api from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const password = watch('password');

  const resetMutation = useMutation(api.resetPassword, {
    onSuccess: () => {
      toast.success('Contraseña actualizada exitosamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      console.error('Password reset error:', error);
      toast.error(
        error.response?.data?.detail ||
        error.response?.data?.password?.[0] ||
        'Error al restablecer contraseña. El enlace puede haber expirado.'
      );
    },
  });

  const onSubmit = (data) => {
    if (!token) {
      toast.error('Token de recuperación no válido');
      return;
    }
    
    resetMutation.mutate({
      token,
      password: data.password,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (!token) {
    return (
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 475,
            px: 2,
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3, md: 4, xl: 5 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  Enlace inválido
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  El enlace de recuperación no es válido o ha expirado.
                  Por favor solicita un nuevo enlace de recuperación.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={() => navigate('/forgot-password')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Solicitar nuevo enlace
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/images/auth-bg.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          zIndex: -1,
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 475,
          px: 2,
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4, xl: 5 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                <Typography variant="h3">Restablecer Contraseña</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary">
                Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="password-reset">Nueva contraseña</InputLabel>
                      <Controller
                        name="password"
                        control={control}
                        rules={{ 
                          required: 'La contraseña es requerida',
                          minLength: {
                            value: 8,
                            message: 'La contraseña debe tener al menos 8 caracteres'
                          }
                        }}
                        render={({ field }) => (
                          <OutlinedInput
                            {...field}
                            fullWidth
                            error={Boolean(errors.password)}
                            id="password-reset"
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
                            placeholder="Ingresa tu nueva contraseña"
                          />
                        )}
                      />
                    </Stack>
                    {errors.password && (
                      <FormHelperText error id="password-reset-helper">
                        {errors.password.message}
                      </FormHelperText>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="confirm-password-reset">Confirmar contraseña</InputLabel>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{ 
                          required: 'Debes confirmar tu contraseña',
                          validate: value => value === password || 'Las contraseñas no coinciden'
                        }}
                        render={({ field }) => (
                          <OutlinedInput
                            {...field}
                            fullWidth
                            error={Boolean(errors.confirmPassword)}
                            id="confirm-password-reset"
                            type={showConfirmPassword ? 'text' : 'password'}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={handleClickShowConfirmPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  edge="end"
                                  size="large"
                                >
                                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>
                            }
                            placeholder="Confirma tu nueva contraseña"
                          />
                        )}
                      />
                    </Stack>
                    {errors.confirmPassword && (
                      <FormHelperText error id="confirm-password-reset-helper">
                        {errors.confirmPassword.message}
                      </FormHelperText>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={resetMutation.isLoading}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {resetMutation.isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <ArrowBack fontSize="small" />
                      <MuiLink
                        variant="body2"
                        component={Link}
                        to="/login"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        Volver al inicio de sesión
                      </MuiLink>
                    </Stack>
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

export default ResetPassword;
