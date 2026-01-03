import { useRef, useState, useEffect } from 'react';
import {
  useMediaQuery,
  Avatar,
  Badge,
  ClickAwayListener,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  Typography,
  Box
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Business,
  CheckCircle
} from '@mui/icons-material';
import MainCard from './MainCard';
import IconButton from './@extended/IconButton';
import Transitions from './@extended/Transitions';
import { api } from '../services/api';

const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

export default function NotificationMenu({ onCreateOrganization }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const anchorRef = useRef(null);
  const [hasOrganization, setHasOrganization] = useState(true);
  const [open, setOpen] = useState(false);

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

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleCreateOrgClick = () => {
    setOpen(false);
    onCreateOrganization();
  };

  const unreadCount = hasOrganization ? 0 : 1;

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{
          color: 'text.primary',
          bgcolor: open ? 'grey.100' : 'transparent'
        }}
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount} color="primary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [downMD ? -5 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: 2,
                width: '100%',
                minWidth: 285,
                maxWidth: { xs: 285, md: 420 }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notificaciones"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {unreadCount > 0 && (
                        <Tooltip title="Marcar todo como leído">
                          <IconButton color="success" size="small">
                            <CheckCircle style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        px: 2,
                        '&.Mui-selected': {
                          bgcolor: 'grey.50',
                          color: 'text.primary'
                        },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': {
                          ...actionSX,
                          position: 'relative'
                        }
                      }
                    }}
                  >
                    {!hasOrganization ? (
                      <>
                        <ListItem
                          component={ListItemButton}
                          divider
                          selected
                          onClick={handleCreateOrgClick}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ color: 'warning.main', bgcolor: 'warning.lighter' }}>
                              <Business />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="h6">
                                Crea tu primera organización
                              </Typography>
                            }
                            secondary="Para comenzar a usar Sustenty, necesitas crear una organización"
                          />
                        </ListItem>
                        <ListItemButton sx={{ textAlign: 'center', py: '12px !important' }}>
                          <ListItemText
                            primary={
                              <Typography variant="h6" color="primary">
                                Ver todas
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </>
                    ) : (
                      <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No tienes notificaciones nuevas
                        </Typography>
                      </Box>
                    )}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
