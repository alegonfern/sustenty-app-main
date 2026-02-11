import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Divider,
  Grid,
  Typography,
  Breadcrumbs as MuiBreadcrumbs
} from '@mui/material';
import {
  Home,
  Dashboard as DashboardIcon,
  Business,
  People,
  BarChart,
  Settings
} from '@mui/icons-material';
import MainCard from './MainCard';

// Configuración de rutas y títulos
const menuItems = {
  '/': { title: 'Inicio', icon: Home },
  '/dashboard': { title: 'Dashboard', icon: DashboardIcon },
  '/organizations': { title: 'Organizaciones', icon: Business },
  '/users': { title: 'Usuarios', icon: People },
  '/reports': { title: 'Reportes', icon: BarChart },
  '/settings': { title: 'Configuración', icon: Settings }
};

export default function Breadcrumbs({ 
  card = false, 
  divider = true,
  title = false,
  sx = {},
  ...others 
}) {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('');
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = menuItems[currentPath] || { title: 'Página', icon: Home };
    
    setPageTitle(currentItem.title);

    // Generar breadcrumbs
    const paths = currentPath.split('/').filter(Boolean);
    const items = [{ title: 'Inicio', path: '/', icon: Home }];

    let accumulatedPath = '';
    paths.forEach((path) => {
      accumulatedPath += `/${path}`;
      const item = menuItems[accumulatedPath];
      if (item) {
        items.push({
          title: item.title,
          path: accumulatedPath,
          icon: item.icon
        });
      }
    });

    setBreadcrumbItems(items);
  }, [location]);

  const iconSX = {
    marginRight: 0.75,
    width: '1rem',
    height: '1rem',
    color: 'secondary.main'
  };

  return (
    <MainCard
      border={card}
      sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, ...sx }}
      {...others}
      content={card}
      elevation={0}
    >
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <MuiBreadcrumbs aria-label="breadcrumb" separator="/">
            {breadcrumbItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === breadcrumbItems.length - 1;

              return isLast ? (
                <Typography key={item.path} variant="subtitle1" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Icon sx={iconSX} />
                  {item.title}
                </Typography>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                  <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icon sx={iconSX} />
                    {item.title}
                  </Typography>
                </Link>
              );
            })}
          </MuiBreadcrumbs>
        </Grid>
        {title && (
          <Grid item sx={{ mt: 0.25 }}>
            <Typography variant="h2">{pageTitle}</Typography>
          </Grid>
        )}
      </Grid>
      {card === false && divider && <Divider sx={{ mt: 2 }} />}
    </MainCard>
  );
}

Breadcrumbs.propTypes = {
  card: PropTypes.bool,
  divider: PropTypes.bool,
  title: PropTypes.bool,
  sx: PropTypes.object
};
