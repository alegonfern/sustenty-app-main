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
  styled,
  Card,
  CardContent,
  Button,
  Stack,
  Chip
} from '@mui/material';
import {
  Home,
  Database,
  BarChart3,
  ListChecks,
  Settings,
  ShieldCheck,
  FileText,
  LineChart,
  AlertTriangle,
  ClipboardList,
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
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
  borderRight: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden',
  boxShadow: 'none'
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden',
  width: MINI_DRAWER_WIDTH,
  borderRight: 'none',
  boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
});

const menuGroups = [
  {
    id: 'navigation',
    title: 'Navegación',
    type: 'group',
    children: [
      { id: 'home', text: 'Inicio', icon: <Home size={20} />, path: '/', type: 'item' }
    ]
  },
  {
    id: 'esg',
    title: 'Esg',
    type: 'group',
    children: [
      { id: 'esg-collection', text: 'Colección', icon: <Database size={20} />, path: '/esg/collection', type: 'item' },
      { id: 'esg-analytics', text: 'Analítica', icon: <BarChart3 size={20} />, path: '/esg/analytics', type: 'item' },
      { id: 'esg-actions', text: 'Acciones', icon: <ListChecks size={20} />, path: '/esg/actions', type: 'item' },
      { id: 'esg-config', text: 'Configuración', icon: <Settings size={20} />, path: '/esg/config', type: 'item' }
    ]
  },
  {
    id: 'compliance',
    title: 'Cumplimiento',
    type: 'group',
    children: [
      { id: 'compliance-dashboard', text: 'Dashboard', icon: <ShieldCheck size={20} />, path: '/compliance/dashboard', type: 'item' },
      { id: 'compliance-documents', text: 'Documentos', icon: <FileText size={20} />, path: '/compliance/documents', type: 'item' },
      { id: 'compliance-analyses', text: 'Análisis', icon: <LineChart size={20} />, path: '/compliance/analyses', type: 'item' },
      { id: 'compliance-gaps', text: 'Brechas', icon: <AlertTriangle size={20} />, path: '/compliance/gaps', type: 'item' },
      { id: 'compliance-reports', text: 'Reportes', icon: <ClipboardList size={20} />, path: '/compliance/reports', type: 'item' }
    ]
  },
  {
    id: 'management',
    title: 'Gestión',
    type: 'group',
    children: [
      { id: 'organizations', text: 'Organizaciones', icon: <Building2 size={20} />, path: '/organizations', type: 'item' },
      { id: 'teams', text: 'Equipo', icon: <Users size={20} />, path: '/team/teams', type: 'item' }
    ]
  },
  {
    id: 'settings',
    title: 'Sistema',
    type: 'group',
    children: [
      { id: 'settings', text: 'Configuración', icon: <Settings size={20} />, path: '/settings', type: 'item' },
      { id: 'help', text: 'Ayuda', icon: <HelpCircle size={20} />, path: '/ayuda', type: 'item', badge: 'Soporte' }
    ]
  }
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
          // Logo completo cuando está abierto
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo-full.svg" 
              alt="Sustenty" 
              style={{ height: 32 }}
              onError={(e) => {
                // Fallback: mostrar texto si no existe la imagen
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                display: 'none' // Se muestra solo si falla la imagen
              }}
            >
              Sustenty
            </Typography>
          </Box>
        ) : (
          // Solo icono cuando está contraído
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/logo-icon.svg" 
              alt="S" 
              style={{ height: 32, width: 32 }}
              onError={(e) => {
                // Fallback si no existe la imagen
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                display: 'none' // Se muestra solo si falla la imagen
              }}
            >
              S
            </Typography>
          </Box>
        )}
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {menuGroups.map((group, groupIndex) => (
          <Box key={group.id}>
            {/* Group Title */}
            {open && (
              <ListItem sx={{ py: 1, px: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    fontSize: '0.75rem'
                  }}
                >
                  {group.title}
                </Typography>
              </ListItem>
            )}
            
            {/* Group Items */}
            {group.children.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <ListItem key={item.id} disablePadding sx={{ display: 'block', mb: 0.5 }}>
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
            
            {/* Divider between groups (except last group) */}
            {groupIndex < menuGroups.length - 1 && open && (
              <Divider sx={{ my: 1.5, mx: 2 }} />
            )}
          </Box>
        ))}
      </List>

      {/* Mantis Pro Upgrade Card */}
      {open && (
        <Box sx={{ p: 2.5, mt: 'auto' }}>
          <Card
            sx={{
              bgcolor: 'primary.main',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 210,
                height: 210,
                background: 'linear-gradient(140.9deg, rgba(255, 255, 255, 0) -14.02%, rgba(255, 255, 255, 0.15) 77.58%)',
                borderRadius: '50%',
                top: -85,
                right: -95
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 210,
                height: 210,
                background: 'linear-gradient(140.9deg, rgba(255, 255, 255, 0) -14.02%, rgba(255, 255, 255, 0.1) 77.58%)',
                borderRadius: '50%',
                top: -125,
                right: -15
              }
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label="Pro"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 20
                    }}
                  />
                </Stack>
                
                <Stack spacing={0.5}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Sustenty Pro
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Obtén funcionalidades avanzadas
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ArrowRight size={16} />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)'
                    },
                    textTransform: 'none'
                  }}
                >
                  Actualizar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}
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
