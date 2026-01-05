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
  styled,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  PanelLeftClose,
  User,
  Settings,
  LogOut,
  Building2,
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth';
import { toast } from 'react-toastify';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../../config';
import CreateOrganizationModal from '../../../components/CreateOrganizationModal';
import NotificationMenu from '../../../components/NotificationMenu';
import Search from '../../../components/Search';
import ContextSelector from '../../../components/ContextSelector';
import { api } from '../../../services/api';
import { ThemeContext } from '../../../context/ThemeContext';

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
  const { mode, toggleTheme } = useContext(ThemeContext);
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openOrgModal, setOpenOrgModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const getInitials = (user) => {
    if (!user) return '?';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    return '?';
  };

  const getAvatarColor = (name) => {
    if (!name) return theme.palette.primary.main;
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

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
              {open ? <PanelLeftClose size={20} /> : <MenuIcon size={20} />}
            </IconButton>

            {!matchDownLG && <Search />}
            {matchDownLG && <Box sx={{ width: '100%', ml: 1 }} />}

            <Box sx={{ flexGrow: 1 }} />

            {/* Selector de Organización y Período */}
            <ContextSelector />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Theme Toggle */}
              <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
                <IconButton
                  onClick={toggleTheme}
                  color="inherit"
                  size="medium"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      color: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </IconButton>
              </Tooltip>

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
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: getAvatarColor(user?.username || user?.email),
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                  src={user?.profile_picture}
                  alt={user?.full_name || user?.username}
                >
                  {getInitials(user)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user?.full_name || user?.username || 'Usuario'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {user?.email}
                  </Typography>
                </Box>
                
                <MenuItem onClick={() => navigate('/profile')}>
                  <User size={16} style={{ marginRight: 16 }} />
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={() => navigate('/organizations')}>
                  <Building2 size={16} style={{ marginRight: 16 }} />
                  Organizaciones
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>
                  <Settings size={16} style={{ marginRight: 16 }} />
                  Configuración
                </MenuItem>
                <MenuItem onClick={() => navigate('/ayuda')}>
                  <HelpCircle size={16} style={{ marginRight: 16 }} />
                  Ayuda y Soporte
                </MenuItem>
                <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1 }} />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogOut size={16} style={{ marginRight: 16 }} />
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
              <MenuIcon size={20} />
            </IconButton>

            <Search />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              {/* Theme Toggle Mobile */}
              <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
                <IconButton
                  onClick={toggleTheme}
                  color="inherit"
                  size="medium"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      color: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </IconButton>
              </Tooltip>

              <NotificationMenu onCreateOrganization={handleOpenOrgModal} />

              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{
                  p: 0.5
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: getAvatarColor(user?.username || user?.email),
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                  src={user?.profile_picture}
                  alt={user?.full_name || user?.username}
                >
                  {getInitials(user)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user?.full_name || user?.username || 'Usuario'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {user?.email}
                  </Typography>
                </Box>
                
                <MenuItem onClick={() => navigate('/profile')}>
                  <User size={16} style={{ marginRight: 16 }} />
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={() => navigate('/organizations')}>
                  <Building2 size={16} style={{ marginRight: 16 }} />
                  Organizaciones
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>
                  <Settings size={16} style={{ marginRight: 16 }} />
                  Configuración
                </MenuItem>
                <MenuItem onClick={() => navigate('/ayuda')}>
                  <HelpCircle size={16} style={{ marginRight: 16 }} />
                  Ayuda y Soporte
                </MenuItem>
                <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1 }} />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogOut size={16} style={{ marginRight: 16 }} />
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
