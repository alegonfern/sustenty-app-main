import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import NavbarDiscoverButton from './NavbarDiscoverButton';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Sustenty
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <NavbarDiscoverButton />
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
              >
                Dashboard
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Iniciar Sesión
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;