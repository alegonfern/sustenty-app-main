import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  Alert,
  IconButton,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { toast } from 'react-toastify';

// Panel de contenido con tab
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Profile() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Datos del usuario
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: ''
  });
  
  // Referencia para el input de archivo
  const fileInputRef = React.useRef(null);
  
  // Cambio de contraseña
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState('');
  
  // Organización actual
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del usuario
      const userResponse = await api.getCurrentUser();
      const userData = userResponse.data;
      setUser(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        position: userData.position || '',
        department: userData.department || ''
      });
      
      // Cargar organización
      try {
        const orgResponse = await api.getOrganizations();
        const orgs = orgResponse.data.results || orgResponse.data || [];
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      } catch (err) {
        console.log('No organization found');
      }
      
    } catch (err) {
      console.error('Error cargando perfil:', err);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      await api.updateProfile(formData);
      
      toast.success('Perfil actualizado correctamente');
      setEditing(false);
      loadProfile();
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      position: user?.position || '',
      department: user?.department || ''
    });
    setEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    // Validaciones
    if (!passwordData.current_password) {
      setPasswordError('Ingrese su contraseña actual');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      setSaving(true);
      
      await api.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      toast.success('Contraseña cambiada correctamente');
      setPasswordDialogOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.old_password?.[0] || 'Error al cambiar la contraseña';
      setPasswordError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return 'US';
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido. Use JPG, PNG, GIF o WebP');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      await api.uploadAvatar(formData);
      toast.success('Imagen de perfil actualizada');
      loadProfile();
    } catch (err) {
      console.error('Error subiendo avatar:', err);
      toast.error(err.response?.data?.detail || 'Error al subir la imagen');
    } finally {
      setUploadingAvatar(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('¿Eliminar tu imagen de perfil?')) return;

    try {
      setUploadingAvatar(true);
      await api.deleteAvatar();
      toast.success('Imagen de perfil eliminada');
      loadProfile();
    } catch (err) {
      console.error('Error eliminando avatar:', err);
      toast.error('Error al eliminar la imagen');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          Error al cargar el perfil. Verifica tu sesión o vuelve a intentarlo.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h4" component="h1">
            Mi Perfil
          </Typography>
        </Stack>
        <Typography variant="subtitle1" color="text.secondary">
          Gestiona tu información personal y configuración de cuenta
        </Typography>
      </Box>

      {/* Header con Avatar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Box sx={{ position: 'relative' }}>
            {/* Input oculto para seleccionar archivo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />
            <Avatar
              src={user?.profile_picture}
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={handleAvatarClick}
            >
              {uploadingAvatar ? (
                <CircularProgress size={40} color="inherit" />
              ) : (
                getInitials(user?.first_name, user?.last_name, user?.username)
              )}
            </Avatar>
            <IconButton
              size="small"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
            {user?.profile_picture && (
              <IconButton
                size="small"
                onClick={handleDeleteAvatar}
                disabled={uploadingAvatar}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'error.light',
                  color: 'white',
                  width: 24,
                  height: 24,
                  '&:hover': { bgcolor: 'error.main' }
                }}
              >
                <CancelIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
          
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user?.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Haz clic en la imagen para cambiarla
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              {user?.is_staff && (
                <Chip label="Administrador" color="primary" size="small" />
              )}
              {organization && (
                <Chip 
                  icon={<BusinessIcon fontSize="small" />} 
                  label={organization.name} 
                  variant="outlined" 
                  size="small" 
                />
              )}
              <Chip 
                icon={<CheckCircleIcon fontSize="small" />} 
                label="Cuenta activa" 
                color="success" 
                variant="outlined"
                size="small" 
              />
            </Stack>
          </Box>
          
          <Box>
            {!editing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
              >
                Editar Perfil
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  Guardar
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ p: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, val) => setCurrentTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<PersonIcon />} label="Información Personal" iconPosition="start" />
          <Tab icon={<SecurityIcon />} label="Seguridad" iconPosition="start" />
          <Tab icon={<HistoryIcon />} label="Actividad" iconPosition="start" />
        </Tabs>

        {/* Tab: Información Personal */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Datos Personales
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Apellido"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" />
                    Información Laboral
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Cargo"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Ej: Gerente de Sostenibilidad"
                    />
                    <TextField
                      fullWidth
                      label="Departamento"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Ej: Medio Ambiente"
                    />
                    <TextField
                      fullWidth
                      label="Organización"
                      value={organization?.name || 'Sin organización'}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Usuario"
                      value={user?.username || ''}
                      disabled
                      helperText="El nombre de usuario no se puede cambiar"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab: Seguridad */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon color="primary" />
                    Contraseña
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Cambia tu contraseña regularmente para mantener tu cuenta segura.
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Cambiar Contraseña
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" />
                    Sesiones Activas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Estás conectado desde este dispositivo.
                  </Alert>
                  
                  <Typography variant="body2" color="text.secondary">
                    Última conexión: {new Date().toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab: Actividad */}
        <TabPanel value={currentTab} index={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon color="primary" />
                Actividad Reciente
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Alert severity="info">
                El historial de actividad estará disponible próximamente.
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Aquí podrás ver un registro de tus acciones recientes en la plataforma.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Diálogo: Cambiar Contraseña */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LockIcon color="primary" />
            <Typography variant="h6">Cambiar Contraseña</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Contraseña Actual"
                name="current_password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Nueva Contraseña"
                name="new_password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                helperText="Mínimo 8 caracteres"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirmar Nueva Contraseña"
                name="confirm_password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
