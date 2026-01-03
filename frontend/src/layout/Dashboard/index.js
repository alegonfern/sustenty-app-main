import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Drawer from './Drawer';

export default function DashboardLayout() {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(true);

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
          width: matchDownLG ? '100%' : `calc(100% - ${drawerOpen ? '260px' : '60px'})`,
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }),
          ml: matchDownLG ? 0 : drawerOpen ? 0 : `-${260 - 60}px`
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
