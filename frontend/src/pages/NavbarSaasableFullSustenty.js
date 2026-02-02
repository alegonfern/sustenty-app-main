import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';


// Navbar con menú centralizado tipo SaasAble, botón Sustenty
export default function NavbarSaasableFullSustenty() {
  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ background: '#f7fafd', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          <img src="/logo-full.svg" alt="Sustenty Logo" className="saas-logo" style={{ height: 36 }} />
          <Box sx={{ bgcolor: '#f1f4f8', borderRadius: 10, px: 2, py: 0.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <a href="#features" className="saas-nav-link" style={{ padding: '8px 18px', borderRadius: 8, color: '#222', textDecoration: 'none', fontWeight: 500 }}>Características</a>
            <a href="#benefits" className="saas-nav-link" style={{ padding: '8px 18px', borderRadius: 8, color: '#222', textDecoration: 'none', fontWeight: 500 }}>Beneficios</a>
            <a href="#pricing" className="saas-nav-link" style={{ padding: '8px 18px', borderRadius: 8, color: '#222', textDecoration: 'none', fontWeight: 500 }}>Precios</a>
            <a href="#contact" className="saas-nav-link" style={{ padding: '8px 18px', borderRadius: 8, color: '#222', textDecoration: 'none', fontWeight: 500 }}>Contacto</a>
          </Box>
          <Button href="/login" className="saas-cta-btn" variant="outlined" sx={{ ml: 2 }}>
            Iniciar sesión
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
