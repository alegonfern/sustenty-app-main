import PropTypes from 'prop-types';
import { useState } from 'react';
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
  Collapse,
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
  Rss,
  Package,
  BookOpen,
  LayoutDashboard,
  Sparkles,
  BookMarked,
  ArrowRight,
  Plug,
  Receipt,
  FileCheck,
  ChevronDown,
  ChevronRight
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
    id: 'main',
    title: '',
    type: 'group',
    children: [
      { id: 'feed', text: 'Feed', icon: <Rss size={20} />, path: '/app', type: 'item' },
      { id: 'agentes', text: 'Agentes', icon: <Sparkles size={20} />, path: '/app/agentes-ia', type: 'item' },
      {
        id: 'inventario',
        text: 'Inventario',
        icon: <Package size={20} />,
        path: '/app/inventario',
        type: 'collapse',
        children: [
          { id: 'integraciones', text: 'Integraciones', icon: <Plug size={16} />, path: '/app/inventario/integraciones' },
          { id: 'facturas', text: 'Facturas', icon: <Receipt size={16} />, path: '/app/inventario/facturas' },
          { id: 'normativas', text: 'Normativas', icon: <FileCheck size={16} />, path: '/app/inventario/normativas' }
        ]
      },
      { id: 'onboarding', text: 'Onboarding', icon: <BookOpen size={20} />, path: '/app/onboarding', type: 'item' },
      { id: 'dashboard', text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/app/dashboard', type: 'item' },
      { id: 'recursos', text: 'Recursos', icon: <BookMarked size={20} />, path: '/app/recursos', type: 'item' }
    ]
  }
];

export default function Drawer({ open, handleDrawerToggle }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const [expandedItems, setExpandedItems] = useState({ inventario: location.pathname.startsWith('/app/inventario') });

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img
              src="/logo_saas.png"
              alt="Sustenty"
              style={{ height: 36, width: 36, borderRadius: 8, objectFit: 'cover' }}
            />
            <Typography sx={{ fontFamily: "'Recoleta', serif", fontWeight: 700, fontSize: '1.25rem', color: '#1a2e29', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Sustenty
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/logo_saas.png"
              alt="Sustenty"
              style={{ height: 36, width: 36, borderRadius: 8, objectFit: 'cover' }}
            />
          </Box>
        )}
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {menuGroups.map((group, groupIndex) => (
          <Box key={group.id}>
            {/* Group Title */}
            {open && group.title && (
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
              if (item.type === 'collapse') {
                const isExpanded = expandedItems[item.id];
                const isActive = location.pathname.startsWith(item.path + '/');
                return (
                  <Box key={item.id}>
                    <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => open ? toggleExpand(item.id) : navigate(item.children[0].path)}
                        sx={{
                          minHeight: 48,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          mx: 1,
                          borderRadius: 1,
                          bgcolor: isActive ? 'primary.lighter' : 'transparent',
                          color: isActive ? 'primary.main' : 'text.primary',
                          '&:hover': { bgcolor: isActive ? 'primary.lighter' : 'action.hover' }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center', color: isActive ? 'primary.main' : 'inherit' }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          sx={{ opacity: open ? 1 : 0, '& .MuiTypography-root': { fontWeight: isActive ? 600 : 400 } }}
                        />
                        {open && (isExpanded
                          ? <ChevronDown size={16} />
                          : <ChevronRight size={16} />)}
                      </ListItemButton>
                    </ListItem>
                    {open && (
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List disablePadding>
                          {item.children.map((sub) => {
                            const isSubSelected = location.pathname === sub.path;
                            return (
                              <ListItem key={sub.id} disablePadding sx={{ display: 'block', mb: 0.25 }}>
                                <ListItemButton
                                  onClick={() => navigate(sub.path)}
                                  sx={{
                                    minHeight: 40,
                                    pl: 5.5,
                                    pr: 2.5,
                                    mx: 1,
                                    borderRadius: 1,
                                    bgcolor: isSubSelected ? 'primary.lighter' : 'transparent',
                                    color: isSubSelected ? 'primary.main' : 'text.secondary',
                                    '&:hover': { bgcolor: isSubSelected ? 'primary.lighter' : 'action.hover', color: 'text.primary' }
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 0, mr: 1.5, justifyContent: 'center', color: isSubSelected ? 'primary.main' : 'inherit' }}>
                                    {sub.icon}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={sub.text}
                                    sx={{ '& .MuiTypography-root': { fontSize: '0.85rem', fontWeight: isSubSelected ? 600 : 400 } }}
                                  />
                                </ListItemButton>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Collapse>
                    )}
                  </Box>
                );
              }

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
