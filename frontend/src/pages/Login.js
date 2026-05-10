import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { Visibility, VisibilityOff, LightMode, DarkMode } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { ThemeContext } from '../context/ThemeContext';
import './AuthPages.css';

const Login = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loginMutation = useMutation(api.login, {
    onSuccess: (response) => {
      const { access, refresh } = response.data;
      authService.login(access, refresh, rememberMe);
      window.dispatchEvent(new Event('auth-login'));
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/app', { replace: true });
    },
    onError: (error) => {
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

  const handleGoogleLogin = () => {
    const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace('/api/v1', '');
    window.location.href = `${BASE_URL}/accounts/google/login/?process=login`;
  };

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="auth-page">
      <button
        type="button"
        onClick={toggleTheme}
        className="auth-switch-theme"
        aria-label={mode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}
      >
        {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
      </button>

      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <img src="/logo_saas.png" alt="Sustenty logo" />
          <span>Sustenty</span>
        </Link>

        <h1 className="auth-title">
          Bienvenido de <span className="teal">vuelta.</span>
        </h1>
        <p className="auth-subtitle">
          Inicia sesión para seguir gestionando tus métricas ESG, reportes y planes de reducción en un solo lugar.
        </p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="auth-label" htmlFor="username-login">Nombre de usuario</label>
            <div className="auth-input-wrap">
              <input
                id="username-login"
                className="auth-input"
                type="text"
                placeholder="Ingresa tu nombre de usuario"
                {...register('username', { required: 'El nombre de usuario es requerido' })}
              />
            </div>
            {errors.username && <p className="auth-error">{errors.username.message}</p>}
          </div>

          <div>
            <label className="auth-label" htmlFor="password-login">Contraseña</label>
            <div className="auth-input-wrap">
              <input
                id="password-login"
                className="auth-input has-toggle"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                  },
                })}
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password.message}</p>}
          </div>

          <div className="auth-row">
            <label className="auth-check" htmlFor="remember-me">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Mantenerme conectado
            </label>
            <Link className="auth-link" to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>

          <button className="auth-btn-primary" type="submit" disabled={loginMutation.isLoading}>
            {loginMutation.isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="auth-divider">o</div>

          <button className="auth-btn-secondary" type="button" onClick={handleGoogleLogin}>
            <span>G</span>
            Continuar con Google
          </button>
        </form>

        <p className="auth-foot">
          ¿No tienes cuenta? <Link className="auth-link" to="/register">Crea una aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
