import React, { useState } from 'react';
import './Landing.css';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton, List, ListItem, ListItemText } from '@mui/material';

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Características', href: '#features' },
    { label: 'Clientes', href: '#clientes' },
    { label: 'Precios', href: '#precios' },
    { label: 'Comenzar', href: '/register', className: 'landing' },
    { label: 'Iniciar Sesión', href: '/login', className: 'landing-cta' }
  ];

  return (
    <main className="landing-root">
      <header className="landing-header">
        <img src="/logo-full.svg" alt="Sustenty Logo" className="landing-logo" />
        <nav className="landing-nav">
          <div className="landing-nav-desktop">
            {menuItems.map(item => (
              <a key={item.label} href={item.href} className={item.className || ''}>{item.label}</a>
            ))}
          </div>
          <div className="landing-nav-mobile">
            <IconButton onClick={() => setMenuOpen(true)}>
              <MenuIcon fontSize="large" />
            </IconButton>
            <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
              <List sx={{ width: 220 }}>
                {menuItems.map(item => (
                  <ListItem button key={item.label} component="a" href={item.href} onClick={() => setMenuOpen(false)}>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            </Drawer>
          </div>
        </nav>
      </header>
      {/* ...existing code... */}
    </main>
  );
}
