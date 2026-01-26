import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Drawer from './Drawer';
import Breadcrumbs from '../../components/Breadcrumbs';
import SustentIA from '../../components/SustentIA';

export default function DashboardLayout() {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Set responsive drawer behavior
  useEffect(() => {
    setDrawerOpen(!matchDownLG);
  }, [matchDownLG]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header open={drawerOpen} handleDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} handleDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          width: '100%',
          flexGrow: 1,
          p: { xs: 2, sm: 3 }
        }}
      >
        <Toolbar sx={{ mt: 'inherit' }} />
        <Box
          sx={{
            px: { xs: 0, sm: 2 },
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs />
          <Outlet />
        </Box>
      </Box>

      {/* Chat flotante de IA */}
      <SustentIA />
    </Box>
  );
}
