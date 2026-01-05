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
  Switch,
  FormControlLabel,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  CloudSync as CloudSyncIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon,
  Smartphone as SmartphoneIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  Fingerprint as FingerprintIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  Webhook as WebhookIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { toast } from 'react-toastify';

// Componente TabPanel
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`settings-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Componente de tarjeta de configuración
function SettingCard({ title, description, children, icon, action }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {icon && (
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                {icon}
              </Avatar>
            )}
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {description}
              </Typography>
              {children}
            </Box>
          </Stack>
          {action && <Box>{action}</Box>}
        </Stack>
      </CardContent>
    </Card>
  );
}

// Componente de plan/pricing
function PlanCard({ name, price, period, features, current, recommended, onSelect }) {
  return (
    <Card 
      sx={{ 
        height: '100%',
        border: current ? '2px solid' : '1px solid',
        borderColor: current ? 'primary.main' : 'divider',
        position: 'relative'
      }}
    >
      {recommended && !current && (
        <Chip 
          label="Recomendado" 
          color="primary" 
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12 }}
        />
      )}
      {current && (
        <Chip 
          label="Plan Actual" 
          color="success" 
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12 }}
        />
      )}
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {name}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h3" fontWeight={700} color="primary">
            {price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            /{period}
          </Typography>
        </Stack>
        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>
        <Button 
          variant={current ? "outlined" : "contained"} 
          fullWidth 
          sx={{ mt: 2 }}
          disabled={current}
          onClick={onSelect}
        >
          {current ? 'Plan Actual' : 'Seleccionar'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { currentOrganization } = useApp();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Estados de configuración (del backend)
  const [settings, setSettings] = useState({
    // Notificaciones
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    alerts_emissions: true,
    alerts_compliance: true,
    alerts_deadlines: true,
    // Apariencia
    theme: 'light',
    language: 'es',
    date_format: 'DD/MM/YYYY',
    timezone: 'Europe/Madrid',
    // Seguridad
    two_factor_enabled: false,
    session_timeout: 30,
    ip_whitelist_enabled: false,
    ip_whitelist: '',
    // API
    api_enabled: false,
    api_key: '',
    webhooks_enabled: false,
    webhook_url: ''
  });

  // Estado para diálogos
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);

  // Datos de uso
  const [usageData, setUsageData] = useState({
    documents: 0,
    documents_limit: 100,
    storage: 0,
    storage_limit: 5,
    api_calls: 0,
    api_calls_limit: 5000,
    users: 0,
    users_limit: 10
  });

  // Historial de facturación
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Integraciones
  const [integrations, setIntegrations] = useState([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  // Cargar configuraciones al inicio
  useEffect(() => {
    loadSettings();
    loadIntegrations();
  }, []);

  // Cargar datos de uso y facturación cuando se cambia a esas pestañas
  useEffect(() => {
    if (currentTab === 5) {
      loadUsageStats();
      loadBillingHistory();
    }
  }, [currentTab]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/settings/');
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error loading settings:', error);
      // Si no existe, usar valores por defecto
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      setLoadingIntegrations(true);
      const response = await api.get('/user/integrations/');
      setIntegrations(response.data);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const response = await api.get('/user/usage/', {
        params: { organization: currentOrganization?.id }
      });
      setUsageData(response.data.usage);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const loadBillingHistory = async () => {
    try {
      setLoadingInvoices(true);
      const response = await api.get('/user/billing/');
      setInvoices(response.data.invoices);
    } catch (error) {
      console.error('Error loading billing history:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.patch('/user/settings/', settings);
      toast.success('Configuración guardada correctamente');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    // Si la API no está habilitada, habilitarla automáticamente primero
    if (!settings.api_enabled) {
      try {
        // Habilitar API y guardar
        const updatedSettings = { ...settings, api_enabled: true };
        await api.patch('/user/settings/', { api_enabled: true });
        setSettings(updatedSettings);
        toast.info('Acceso a la API habilitado');
      } catch (error) {
        console.error('Error enabling API:', error);
        toast.error('Error al habilitar la API');
        return;
      }
    }
    
    setGeneratingKey(true);
    try {
      const response = await api.post('/user/settings/api-key/');
      setNewApiKey(response.data.api_key);
      setApiKeyDialog(true);
      toast.success('Nueva API Key generada');
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error(error.response?.data?.error || 'Error al generar API Key');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleToggleIntegration = async (provider) => {
    try {
      const response = await api.post('/user/integrations/', { 
        provider, 
        action: 'toggle' 
      });
      toast.success(response.data.message);
      loadIntegrations(); // Recargar integraciones
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Error al actualizar la integración');
    }
  };

  const handleExportData = async (format = 'json') => {
    try {
      const response = await api.post('/user/export/', { format });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const calculateUsagePercent = (used, limit) => {
    if (limit === Infinity || limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Skeleton variant="rectangular" height={500} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h4" component="h1">
            Configuración
          </Typography>
        </Stack>
        <Typography variant="subtitle1" color="text.secondary">
          Personaliza tu experiencia y gestiona tu cuenta
        </Typography>
      </Box>

      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Tienes cambios sin guardar. No olvides hacer clic en "Guardar Cambios".
        </Alert>
      )}

      <Paper sx={{ p: 0 }}>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<NotificationsIcon />} label="Notificaciones" iconPosition="start" />
          <Tab icon={<PaletteIcon />} label="Apariencia" iconPosition="start" />
          <Tab icon={<SecurityIcon />} label="Seguridad" iconPosition="start" />
          <Tab icon={<CloudSyncIcon />} label="Integraciones" iconPosition="start" />
          <Tab icon={<CodeIcon />} label="API & Webhooks" iconPosition="start" />
          <Tab icon={<PaymentIcon />} label="Plan & Facturación" iconPosition="start" />
          <Tab icon={<StorageIcon />} label="Datos" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* TAB: Notificaciones */}
          <TabPanel value={currentTab} index={0}>
            <Typography variant="h6" gutterBottom>Preferencias de Notificación</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Controla cómo y cuándo quieres recibir notificaciones sobre tu actividad ESG.
            </Typography>

            <SettingCard
              title="Notificaciones por Email"
              description="Recibe actualizaciones importantes en tu correo electrónico"
              icon={<EmailIcon />}
              action={
                <Switch
                  checked={settings.email_notifications}
                  onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                  color="primary"
                />
              }
            />

            <SettingCard
              title="Notificaciones Push"
              description="Recibe notificaciones en tiempo real en tu navegador"
              icon={<SmartphoneIcon />}
              action={
                <Switch
                  checked={settings.push_notifications}
                  onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                  color="primary"
                />
              }
            />

            <SettingCard
              title="Resumen Semanal"
              description="Recibe un resumen semanal de tu progreso ESG cada lunes"
              icon={<ReceiptIcon />}
              action={
                <Switch
                  checked={settings.weekly_digest}
                  onChange={(e) => handleSettingChange('weekly_digest', e.target.checked)}
                  color="primary"
                />
              }
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Alertas Específicas
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.alerts_emissions}
                          onChange={(e) => handleSettingChange('alerts_emissions', e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Alertas de Emisiones</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Cuando las emisiones superen umbrales
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.alerts_compliance}
                          onChange={(e) => handleSettingChange('alerts_compliance', e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Alertas de Cumplimiento</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Cambios en brechas regulatorias
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.alerts_deadlines}
                          onChange={(e) => handleSettingChange('alerts_deadlines', e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">Recordatorios de Fechas</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Fechas límite de reportes y acciones
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB: Apariencia */}
          <TabPanel value={currentTab} index={1}>
            <Typography variant="h6" gutterBottom>Personalización</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ajusta la apariencia y el idioma de la aplicación según tus preferencias.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SettingCard
                  title="Tema de la Aplicación"
                  description="Elige entre modo claro u oscuro"
                  icon={<PaletteIcon />}
                >
                  <FormControl fullWidth size="small">
                    <Select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">☀️ Modo Claro</MenuItem>
                      <MenuItem value="dark">🌙 Modo Oscuro</MenuItem>
                      <MenuItem value="system">💻 Seguir Sistema</MenuItem>
                    </Select>
                  </FormControl>
                </SettingCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SettingCard
                  title="Idioma"
                  description="Selecciona el idioma de la interfaz"
                  icon={<LanguageIcon />}
                >
                  <FormControl fullWidth size="small">
                    <Select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <MenuItem value="es">🇪🇸 Español</MenuItem>
                      <MenuItem value="en">🇬🇧 English</MenuItem>
                      <MenuItem value="pt">🇧🇷 Português</MenuItem>
                      <MenuItem value="fr">🇫🇷 Français</MenuItem>
                    </Select>
                  </FormControl>
                </SettingCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SettingCard
                  title="Formato de Fecha"
                  description="Elige cómo mostrar las fechas"
                  icon={<ReceiptIcon />}
                >
                  <FormControl fullWidth size="small">
                    <Select
                      value={settings.date_format}
                      onChange={(e) => handleSettingChange('date_format', e.target.value)}
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</MenuItem>
                    </Select>
                  </FormControl>
                </SettingCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SettingCard
                  title="Zona Horaria"
                  description="Tu zona horaria para reportes y alertas"
                  icon={<LanguageIcon />}
                >
                  <FormControl fullWidth size="small">
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                      <MenuItem value="Europe/Madrid">Europe/Madrid (CET)</MenuItem>
                      <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                      <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                      <MenuItem value="America/Los_Angeles">America/Los_Angeles (PST)</MenuItem>
                      <MenuItem value="America/Mexico_City">America/Mexico_City (CST)</MenuItem>
                      <MenuItem value="America/Bogota">America/Bogota (COT)</MenuItem>
                    </Select>
                  </FormControl>
                </SettingCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB: Seguridad */}
          <TabPanel value={currentTab} index={2}>
            <Typography variant="h6" gutterBottom>Seguridad de la Cuenta</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Protege tu cuenta con medidas de seguridad adicionales.
            </Typography>

            <SettingCard
              title="Autenticación de Dos Factores (2FA)"
              description="Añade una capa extra de seguridad a tu cuenta usando una app de autenticación"
              icon={<FingerprintIcon />}
              action={
                <Button 
                  variant={settings.two_factor_enabled ? "outlined" : "contained"}
                  color={settings.two_factor_enabled ? "success" : "primary"}
                  startIcon={settings.two_factor_enabled ? <CheckIcon /> : <ShieldIcon />}
                  onClick={() => handleSettingChange('two_factor_enabled', !settings.two_factor_enabled)}
                >
                  {settings.two_factor_enabled ? 'Activado' : 'Activar 2FA'}
                </Button>
              }
            />

            <SettingCard
              title="Tiempo de Sesión"
              description="Cierra la sesión automáticamente después de un período de inactividad"
              icon={<SecurityIcon />}
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={settings.session_timeout}
                  onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
                >
                  <MenuItem value={15}>15 minutos</MenuItem>
                  <MenuItem value={30}>30 minutos</MenuItem>
                  <MenuItem value={60}>1 hora</MenuItem>
                  <MenuItem value={120}>2 horas</MenuItem>
                  <MenuItem value={480}>8 horas</MenuItem>
                </Select>
              </FormControl>
            </SettingCard>

            <SettingCard
              title="Lista Blanca de IPs"
              description="Restringe el acceso a la cuenta solo desde direcciones IP específicas"
              icon={<KeyIcon />}
              action={
                <Switch
                  checked={settings.ip_whitelist_enabled}
                  onChange={(e) => handleSettingChange('ip_whitelist_enabled', e.target.checked)}
                  color="primary"
                />
              }
            >
              {settings.ip_whitelist_enabled && (
                <TextField
                  size="small"
                  placeholder="Ej: 192.168.1.1, 10.0.0.0/24"
                  fullWidth
                  value={settings.ip_whitelist || ''}
                  onChange={(e) => handleSettingChange('ip_whitelist', e.target.value)}
                  sx={{ mt: 1 }}
                  helperText="Ingresa las IPs separadas por comas"
                />
              )}
            </SettingCard>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} color="error" gutterBottom>
              Zona de Peligro
            </Typography>

            <Card variant="outlined" sx={{ borderColor: 'error.main', mt: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Eliminar Cuenta
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteAccountDialog(true)}
                  >
                    Eliminar Cuenta
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </TabPanel>

          {/* TAB: Integraciones */}
          <TabPanel value={currentTab} index={3}>
            <Typography variant="h6" gutterBottom>Integraciones</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Conecta Sustenty con tus herramientas favoritas para automatizar flujos de trabajo.
            </Typography>

            {loadingIntegrations ? (
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Skeleton variant="rectangular" height={100} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {integrations.map((integration) => (
                  <Grid item xs={12} md={6} key={integration.provider}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'grey.100', fontSize: '1.5rem' }}>
                              {integration.icon}
                            </Avatar>
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {integration.name}
                                </Typography>
                                {integration.is_connected && (
                                  <Chip label="Conectado" size="small" color="success" />
                                )}
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {integration.description}
                              </Typography>
                            </Box>
                          </Stack>
                          <Button
                            variant={integration.is_connected ? "outlined" : "contained"}
                            size="small"
                            onClick={() => handleToggleIntegration(integration.provider)}
                          >
                            {integration.is_connected ? 'Desconectar' : 'Conectar'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              💡 <strong>¿Necesitas otra integración?</strong> Contáctanos en soporte@sustenty.io 
              y te ayudaremos a conectar cualquier herramienta que necesites.
            </Alert>
          </TabPanel>

          {/* TAB: API & Webhooks */}
          <TabPanel value={currentTab} index={4}>
            <Typography variant="h6" gutterBottom>API & Webhooks</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Accede a tus datos de sostenibilidad programáticamente y recibe notificaciones en tiempo real.
            </Typography>

            {/* Card principal de API */}
            <Card sx={{ mb: 3, border: settings.api_enabled ? '2px solid' : '1px solid', borderColor: settings.api_enabled ? 'success.main' : 'divider' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: settings.api_enabled ? 'success.light' : 'grey.200', color: settings.api_enabled ? 'success.main' : 'grey.500' }}>
                      <ApiIcon />
                    </Avatar>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" fontWeight={600}>
                          Acceso a la API
                        </Typography>
                        <Chip 
                          label={settings.api_enabled ? "Habilitado" : "Deshabilitado"} 
                          size="small" 
                          color={settings.api_enabled ? "success" : "default"}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Accede a tus datos ESG programáticamente mediante nuestra API REST
                      </Typography>
                    </Box>
                  </Stack>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.api_enabled}
                        onChange={(e) => handleSettingChange('api_enabled', e.target.checked)}
                        color="success"
                      />
                    }
                    label={settings.api_enabled ? "Activo" : "Inactivo"}
                    labelPlacement="start"
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Sección de API Key - Siempre visible */}
                <Box sx={{ 
                  p: 2, 
                  bgcolor: settings.api_enabled ? 'background.paper' : 'action.disabledBackground',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: settings.api_enabled ? 'primary.main' : 'divider'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        🔑 Tu API Key
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {settings.api_enabled 
                          ? "Genera una clave para autenticar tus peticiones a la API"
                          : "Activa el acceso a la API arriba para generar tu clave"
                        }
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={generatingKey ? <CircularProgress size={16} color="inherit" /> : <KeyIcon />}
                      onClick={handleGenerateApiKey}
                      disabled={generatingKey}
                      color={settings.api_enabled ? "primary" : "inherit"}
                    >
                      {generatingKey ? 'Generando...' : 'Generar API Key'}
                    </Button>
                  </Stack>

                  {!settings.api_enabled && (
                    <Alert severity="info" sx={{ mt: 2 }} icon={false}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                        <Typography variant="body2">
                          👆 <strong>Primero activa el switch de arriba</strong> para habilitar el acceso API
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleSettingChange('api_enabled', true)}
                        >
                          Habilitar ahora
                        </Button>
                      </Stack>
                    </Alert>
                  )}
                </Box>

                {settings.api_enabled && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ⚠️ Mantén tu API key segura. No la compartas públicamente ni la incluyas en código del frontend.
                  </Alert>
                )}
              </CardContent>
            </Card>

            <SettingCard
              title="Webhooks"
              description="Recibe notificaciones HTTP cuando ocurran eventos en tu cuenta"
              icon={<WebhookIcon />}
              action={
                <Switch
                  checked={settings.webhooks_enabled}
                  onChange={(e) => handleSettingChange('webhooks_enabled', e.target.checked)}
                  color="primary"
                />
              }
            >
              {settings.webhooks_enabled && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="URL del Webhook"
                    placeholder="https://tu-servidor.com/webhook"
                    value={settings.webhook_url || ''}
                    onChange={(e) => handleSettingChange('webhook_url', e.target.value)}
                    helperText="Enviaremos un POST a esta URL cuando ocurran eventos"
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip label="Emisiones" size="small" variant="outlined" />
                    <Chip label="Cumplimiento" size="small" variant="outlined" />
                    <Chip label="Documentos" size="small" variant="outlined" />
                    <Chip label="Alertas" size="small" variant="outlined" />
                  </Stack>
                </Box>
              )}
            </SettingCard>

            <Alert severity="info" sx={{ mt: 2 }}>
              📚 Consulta nuestra <strong>documentación de API</strong> en docs.sustenty.io para 
              ejemplos de código y endpoints disponibles.
            </Alert>
          </TabPanel>

          {/* TAB: Plan & Facturación */}
          <TabPanel value={currentTab} index={5}>
            <Typography variant="h6" gutterBottom>Plan & Facturación</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Gestiona tu suscripción y revisa tu historial de facturación.
            </Typography>

            {/* Planes disponibles */}
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
              Planes Disponibles
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <PlanCard
                  name="Starter"
                  price="€49"
                  period="mes"
                  features={[
                    'Hasta 5 usuarios',
                    '50 documentos/mes',
                    '1 GB almacenamiento',
                    'Soporte por email',
                    'Reportes básicos'
                  ]}
                  current={false}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <PlanCard
                  name="Professional"
                  price="€99"
                  period="mes"
                  features={[
                    'Hasta 10 usuarios',
                    '100 documentos/mes',
                    '5 GB almacenamiento',
                    'Soporte prioritario',
                    'Todos los reportes',
                    'API access'
                  ]}
                  current={true}
                  recommended={true}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <PlanCard
                  name="Enterprise"
                  price="Personalizado"
                  period="mes"
                  features={[
                    'Usuarios ilimitados',
                    'Documentos ilimitados',
                    'Almacenamiento ilimitado',
                    'Soporte dedicado 24/7',
                    'SSO & SAML',
                    'Integraciones custom'
                  ]}
                  current={false}
                />
              </Grid>
            </Grid>

            {/* Uso actual */}
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Uso del Plan Actual
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Documentos</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {usageData.documents}/{usageData.documents_limit}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUsagePercent(usageData.documents, usageData.documents_limit)}
                      sx={{ mt: 1 }}
                      color={calculateUsagePercent(usageData.documents, usageData.documents_limit) > 80 ? 'warning' : 'primary'}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Almacenamiento</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {usageData.storage}/{usageData.storage_limit} GB
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUsagePercent(usageData.storage, usageData.storage_limit)}
                      sx={{ mt: 1 }}
                      color={calculateUsagePercent(usageData.storage, usageData.storage_limit) > 80 ? 'warning' : 'primary'}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Llamadas API</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {usageData.api_calls?.toLocaleString() || 0}/{usageData.api_calls_limit?.toLocaleString() || 0}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUsagePercent(usageData.api_calls, usageData.api_calls_limit)}
                      sx={{ mt: 1 }}
                      color={calculateUsagePercent(usageData.api_calls, usageData.api_calls_limit) > 80 ? 'warning' : 'primary'}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Usuarios</Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {usageData.users}/{usageData.users_limit}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUsagePercent(usageData.users, usageData.users_limit)}
                      sx={{ mt: 1 }}
                      color={calculateUsagePercent(usageData.users, usageData.users_limit) > 80 ? 'warning' : 'primary'}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Historial de facturación */}
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Historial de Facturación
            </Typography>
            <Card variant="outlined">
              {loadingInvoices ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="rectangular" height={200} />
                </Box>
              ) : (
                <List>
                  {invoices.map((invoice, index) => (
                    <ListItem 
                      key={invoice.id}
                      divider={index < invoices.length - 1}
                    >
                      <ListItemIcon>
                        <ReceiptIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={invoice.id}
                        secondary={`${invoice.date} - ${invoice.plan}`}
                      />
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle2">{invoice.amount}</Typography>
                        <Chip label={invoice.status} size="small" color="success" />
                        <IconButton size="small">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </Card>
          </TabPanel>

          {/* TAB: Datos */}
          <TabPanel value={currentTab} index={6}>
            <Typography variant="h6" gutterBottom>Gestión de Datos</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Exporta, importa o elimina tus datos de sostenibilidad.
            </Typography>

            <SettingCard
              title="Exportar Todos los Datos"
              description="Descarga una copia completa de todos tus datos ESG en formato JSON o CSV"
              icon={<DownloadIcon />}
            >
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportData('json')}
                >
                  Exportar como JSON
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportData('csv')}
                >
                  Exportar como CSV
                </Button>
              </Stack>
            </SettingCard>

            <SettingCard
              title="Importar Datos"
              description="Importa datos ESG desde archivos CSV o desde otras plataformas"
              icon={<UploadIcon />}
            >
              <Button 
                variant="outlined" 
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mt: 1 }}
              >
                Seleccionar Archivo
                <input type="file" hidden accept=".csv,.json,.xlsx" />
              </Button>
            </SettingCard>

            <SettingCard
              title="Sincronización Automática"
              description="Sincroniza tus datos automáticamente con servicios externos"
              icon={<RefreshIcon />}
              action={
                <Chip 
                  icon={<CheckIcon />} 
                  label="Última sincronización: hace 2 horas" 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
              }
            >
              <Button 
                variant="text" 
                startIcon={<RefreshIcon />}
                sx={{ mt: 1 }}
              >
                Sincronizar Ahora
              </Button>
            </SettingCard>

            <Alert severity="warning" sx={{ mt: 3 }}>
              ⚠️ <strong>Retención de datos:</strong> Cumplimos con GDPR. Puedes solicitar la eliminación 
              completa de tus datos en cualquier momento. Los datos de cumplimiento normativo se 
              retienen por 7 años según requisitos legales.
            </Alert>
          </TabPanel>
        </Box>

        {/* Footer con botón de guardar */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={loadSettings}
            disabled={saving || !hasChanges}
          >
            Descartar Cambios
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={saving || !hasChanges}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Paper>

      {/* Diálogo: Eliminar cuenta */}
      <Dialog open={deleteAccountDialog} onClose={() => setDeleteAccountDialog(false)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningIcon color="error" />
            <span>¿Eliminar tu cuenta?</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Esta acción es <strong>irreversible</strong>. Se eliminarán permanentemente:
          </Typography>
          <List dense>
            <ListItem>• Todos tus datos de emisiones y reportes ESG</ListItem>
            <ListItem>• Documentos y análisis de cumplimiento</ListItem>
            <ListItem>• Configuración de equipos y organizaciones</ListItem>
            <ListItem>• Historial de actividad</ListItem>
          </List>
          <TextField
            fullWidth
            label="Escribe 'ELIMINAR' para confirmar"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteAccountDialog(false);
            setDeleteConfirmText('');
          }}>
            Cancelar
          </Button>
          <Button 
            color="error" 
            variant="contained"
            disabled={deleteConfirmText !== 'ELIMINAR'}
          >
            Eliminar Cuenta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: API Key generada */}
      <Dialog open={apiKeyDialog} onClose={() => setApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tu Nueva API Key</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Esta es la única vez que verás esta key. Cópiala ahora y guárdala en un lugar seguro.
          </Alert>
          <TextField
            fullWidth
            value={newApiKey}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            navigator.clipboard.writeText(newApiKey);
            toast.success('API Key copiada al portapapeles');
          }}>
            Copiar
          </Button>
          <Button variant="contained" onClick={() => setApiKeyDialog(false)}>Entendido</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
