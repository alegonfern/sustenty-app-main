import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import './SaasLanding.css';

// Navbar tipo saasable, solo el botón usa clase Sustenty
export default function NavbarSaasableSustenty() {
  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          <img src="/logo-full.svg" alt="Sustenty Logo" className="saas-logo" style={{ height: 40 }} />
          <Stack direction="row" spacing={3} alignItems="center">
            <a href="#features" className="saas-nav-link">Características</a>
            <a href="#benefits" className="saas-nav-link">Beneficios</a>
            <a href="#pricing" className="saas-nav-link">Precios</a>
            <a href="#contact" className="saas-nav-link">Contacto</a>
            <Button href="/login" className="saas-cta-btn" variant="contained" sx={{ ml: 2 }}>Iniciar sesión</Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
