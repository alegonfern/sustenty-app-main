import PropTypes from 'prop-types';
import {
  Drawer as MuiDrawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  styled
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Settings,
  BarChart,
  Home,
  Business
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../../config';

const DrawerStyled = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: DRAWER_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme)
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme)
    })
  })
);

const openedMixin = (theme) => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden',
  borderRight: `1px solid ${theme.palette.divider}`
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden',
  width: MINI_DRAWER_WIDTH,
  borderRight: `1px solid ${theme.palette.divider}`
});

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inicio', icon: <Home />, path: '/' },
  { text: 'Organizaciones', icon: <Business />, path: '/organizations' },
  { text: 'Usuarios', icon: <People />, path: '/users' },
  { text: 'Reportes', icon: <BarChart />, path: '/reports' },
  { text: 'Configuración', icon: <Settings />, path: '/settings' }
];

export default function Drawer({ open, handleDrawerToggle }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));

  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center',
          px: open ? 3 : 1,
          py: 2,
          minHeight: 64
        }}
      >
        {open ? (
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Sustenty
          </Typography>
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            S
          </Typography>
        )}
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  mx: 1,
                  borderRadius: 1,
                  bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                  color: isSelected ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.lighter' : 'action.hover'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isSelected ? 'primary.main' : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontWeight: isSelected ? 600 : 400
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 } }}>
      {matchDownLG ? (
        <MuiDrawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`
            }
          }}
        >
          {drawer}
        </MuiDrawer>
      ) : (
        <DrawerStyled variant="permanent" open={open}>
          {drawer}
        </DrawerStyled>
      )}
    </Box>
  );
}

Drawer.propTypes = {
  open: PropTypes.bool,
  handleDrawerToggle: PropTypes.func
};
