import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = React.useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    }
  });

  const resetMutation = useMutation(api.requestPasswordReset, {
    onSuccess: () => {
      setEmailSent(true);
      toast.success('Se ha enviado un correo con instrucciones para recuperar tu contraseña');
    },
    onError: (error) => {
      console.error('Password reset error:', error);
      toast.error(
        error.response?.data?.detail ||
        error.response?.data?.email?.[0] ||
        'Error al solicitar recuperación de contraseña. Intenta nuevamente.'
      );
    },
  });

  const onSubmit = (data) => {
    resetMutation.mutate(data);
  };

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
                <Typography variant="h3">Recuperar Contraseña</Typography>
              </Stack>
            </Grid>

            {!emailSent ? (
              <>
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary">
                    Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña.
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack sx={{ gap: 1 }}>
                          <InputLabel htmlFor="email-reset">Correo electrónico</InputLabel>
                          <Controller
                            name="email"
                            control={control}
                            rules={{ 
                              required: 'El correo electrónico es requerido',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Correo electrónico inválido'
                              }
                            }}
                            render={({ field }) => (
                              <OutlinedInput
                                {...field}
                                id="email-reset"
                                type="email"
                                placeholder="Ingresa tu correo electrónico"
                                fullWidth
                                error={Boolean(errors.email)}
                              />
                            )}
                          />
                        </Stack>
                        {errors.email && (
                          <FormHelperText error id="email-reset-helper">
                            {errors.email.message}
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
                          {resetMutation.isLoading ? 'Enviando...' : 'Enviar instrucciones'}
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
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: 'success.lighter',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'success.main',
                    }}
                  >
                    <Typography variant="h5" sx={{ mb: 1, color: 'success.dark' }}>
                      ✓ Correo enviado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hemos enviado un correo con instrucciones para recuperar tu contraseña.
                      Por favor revisa tu bandeja de entrada y sigue las instrucciones.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Volver al inicio de sesión
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
