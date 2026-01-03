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
  Badge,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard as DashboardIcon,
  Notifications,
  Business
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth';
import { toast } from 'react-toastify';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../../config';
import CreateOrganizationModal from '../../../components/CreateOrganizationModal';
import { api } from '../../../services/api';

export default function Header({ open, handleDrawerToggle }) {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openOrgModal, setOpenOrgModal] = useState(false);
  const [hasOrganization, setHasOrganization] = useState(false);

  // Verificar si el usuario tiene organizaciones
  useEffect(() => {
    const checkOrganizations = async () => {
      try {
        const response = await api.getOrganizations();
        setHasOrganization(response.data.length > 0);
      } catch (error) {
        console.error('Error al obtener organizaciones:', error);
      }
    };
    checkOrganizations();
  }, []);

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
      setHasOrganization(true);
      handleCloseOrgModal();
      // Navegar a la página de organizaciones
      navigate('/organizations');
    } catch (error) {
      console.error('Error al crear organización:', error);
      toast.error('Error al crear la organización');
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.drawer + 1,
          width: matchDownLG ? '100%' : open ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${MINI_DRAWER_WIDTH}px)`,
          ml: matchDownLG ? 0 : open ? `${DRAWER_WIDTH}px` : `${MINI_DRAWER_WIDTH}px`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          })
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ 
              mr: 2,
              bgcolor: open ? 'transparent' : 'action.hover',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notificación de crear organización */}
            {!hasOrganization && (
              <Tooltip title="Crea tu organización">
                <IconButton
                  color="inherit"
                  onClick={handleOpenOrgModal}
                  sx={{
                    bgcolor: 'warning.lighter',
                    '&:hover': {
                      bgcolor: 'warning.light'
                    }
                  }}
                >
                  <Badge badgeContent={1} color="error">
                    <Notifications color="warning" />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

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
