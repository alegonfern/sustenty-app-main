import PropTypes from 'prop-types';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  AccountCircle,
  Logout,
  Dashboard as DashboardIcon,
  Business
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth';
import { toast } from 'react-toastify';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../../config';
import CreateOrganizationModal from '../../../components/CreateOrganizationModal';
import NotificationMenu from '../../../components/NotificationMenu';
import Search from '../../../components/Search';
import { api } from '../../../services/api';

// Styled AppBar with smooth transitions
const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(!open && {
    width: `calc(100% - ${MINI_DRAWER_WIDTH}px)`
  }),
  ...(open && {
    marginLeft: DRAWER_WIDTH,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

export default function Header({ open, handleDrawerToggle }) {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openOrgModal, setOpenOrgModal] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/login');
    handleClose();
  };

  const handleOpenOrgModal = () => {
    setOpenOrgModal(true);
  };

  const handleCloseOrgModal = () => {
    setOpenOrgModal(false);
  };

  const handleCreateOrganization = async (data) => {
    try {
      await api.createOrganization(data);
      toast.success('¡Organización creada exitosamente!');
      handleCloseOrgModal();
      navigate('/organizations');
    } catch (error) {
      console.error('Error al crear organización:', error);
      toast.error('Error al crear la organización');
    }
  };

  return (
    <>
      {!matchDownLG ? (
        <AppBarStyled
          position="fixed"
          open={open}
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: `1px solid`,
            borderBottomColor: 'divider'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{
                color: 'text.primary',
                bgcolor: open ? 'transparent' : 'grey.100',
                ml: { xs: 0, lg: -2 },
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              {open ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>

            {!matchDownLG && <Search />}
            {matchDownLG && <Box sx={{ width: '100%', ml: 1 }} />}

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Notificaciones */}
              <NotificationMenu onCreateOrganization={handleOpenOrgModal} />

              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{
                  p: 0.5
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <AccountCircle />
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => navigate('/dashboard')}>
                  <DashboardIcon sx={{ mr: 2 }} fontSize="small" />
                  Mi Dashboard
                </MenuItem>
                <MenuItem onClick={() => navigate('/organizations')}>
                  <Business sx={{ mr: 2 }} fontSize="small" />
                  Organizaciones
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 2 }} fontSize="small" />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBarStyled>
      ) : (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: `1px solid`,
            borderBottomColor: 'divider',
            width: '100%'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{
                mr: 1,
                color: 'text.primary'
              }}
            >
              <MenuIcon />
            </IconButton>

            <Search />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              <NotificationMenu onCreateOrganization={handleOpenOrgModal} />

              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{
                  p: 0.5
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <AccountCircle />
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => navigate('/dashboard')}>
                  <DashboardIcon sx={{ mr: 2 }} fontSize="small" />
                  Mi Dashboard
                </MenuItem>
                <MenuItem onClick={() => navigate('/organizations')}>
                  <Business sx={{ mr: 2 }} fontSize="small" />
                  Organizaciones
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 2 }} fontSize="small" />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Modal de creación de organización */}
      <CreateOrganizationModal
        open={openOrgModal}
        onClose={handleCloseOrgModal}
        onSubmit={handleCreateOrganization}
      />
    </>
  );
}

Header.propTypes = {
  open: PropTypes.bool,
  handleDrawerToggle: PropTypes.func
};
