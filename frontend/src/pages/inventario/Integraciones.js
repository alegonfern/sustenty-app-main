import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Grid,
  Alert,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Skeleton,
  Tabs,
  Tab
} from '@mui/material';
import {
  CloudSync as CloudSyncIcon,
  Key as KeyIcon,
  Webhook as WebhookIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Integraciones() {
  const [tab, setTab] = useState(0);

  // Integraciones
  const [integrations, setIntegrations] = useState([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  // API & Webhooks
  const [apiEnabled, setApiEnabled] = useState(false);
  const [webhooksEnabled, setWebhooksEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIntegrations();
    loadApiSettings();
  }, []);

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

  const loadApiSettings = async () => {
    try {
      const response = await api.get('/user/settings/');
      setApiEnabled(response.data.api_enabled || false);
      setWebhooksEnabled(response.data.webhooks_enabled || false);
      setWebhookUrl(response.data.webhook_url || '');
    } catch (error) {
      console.error('Error loading API settings:', error);
    }
  };

  const handleToggleIntegration = async (provider) => {
    try {
      const response = await api.post('/user/integrations/', { provider, action: 'toggle' });
      toast.success(response.data.message);
      loadIntegrations();
    } catch (error) {
      toast.error('Error al actualizar la integración');
    }
  };

  const handleGenerateApiKey = async () => {
    if (!apiEnabled) {
      try {
        await api.patch('/user/settings/', { api_enabled: true });
        setApiEnabled(true);
        toast.info('Acceso a la API habilitado');
      } catch {
        toast.error('Error al habilitar la API');
        return;
      }
    }
    setGeneratingKey(true);
    try {
      await api.post('/user/settings/api-key/');
      toast.success('Nueva API Key generada');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al generar API Key');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleSaveWebhook = async () => {
    setSaving(true);
    try {
      await api.patch('/user/settings/', { webhooks_enabled: webhooksEnabled, webhook_url: webhookUrl });
      toast.success('Configuración guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
          Inventario
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2e29' }}>
          Integraciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Conecta Sustenty con tus herramientas y accede a la API.
        </Typography>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tab icon={<CloudSyncIcon />} label="Conexiones" iconPosition="start" />
        <Tab icon={<ApiIcon />} label="API & Webhooks" iconPosition="start" />
      </Tabs>

      {/* TAB: Conexiones */}
      <TabPanel value={tab} index={0}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Conecta Sustenty con tus herramientas favoritas para automatizar flujos de trabajo.
        </Typography>

        {loadingIntegrations ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : integrations.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', py: 6, borderRadius: 2 }}>
            <CloudSyncIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" gutterBottom>Sin integraciones disponibles</Typography>
            <Typography variant="body2" color="text.secondary">
              Las integraciones se cargan desde el servidor.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {integrations.map((integration) => (
              <Grid item xs={12} md={6} key={integration.provider}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
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
                        variant={integration.is_connected ? 'outlined' : 'contained'}
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
      <TabPanel value={tab} index={1}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Accede a tus datos de sostenibilidad programáticamente y recibe notificaciones en tiempo real.
        </Typography>

        {/* API Key */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '1.5px solid',
            borderColor: apiEnabled ? 'success.main' : 'divider'
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ bgcolor: apiEnabled ? 'success.light' : 'grey.200', color: apiEnabled ? 'success.main' : 'grey.500' }}>
                  <ApiIcon />
                </Avatar>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight={600}>Acceso a la API</Typography>
                    <Chip
                      label={apiEnabled ? 'Habilitado' : 'Deshabilitado'}
                      size="small"
                      color={apiEnabled ? 'success' : 'default'}
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
                    checked={apiEnabled}
                    onChange={(e) => setApiEnabled(e.target.checked)}
                    color="success"
                  />
                }
                label={apiEnabled ? 'Activo' : 'Inactivo'}
                labelPlacement="start"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                p: 2,
                bgcolor: apiEnabled ? 'background.paper' : 'action.disabledBackground',
                borderRadius: 1,
                border: '1px dashed',
                borderColor: apiEnabled ? 'primary.main' : 'divider'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>🔑 Tu API Key</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {apiEnabled
                      ? 'Genera una clave para autenticar tus peticiones a la API'
                      : 'Activa el acceso a la API arriba para generar tu clave'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={generatingKey ? <CircularProgress size={16} color="inherit" /> : <KeyIcon />}
                  onClick={handleGenerateApiKey}
                  disabled={generatingKey}
                >
                  {generatingKey ? 'Generando...' : 'Generar API Key'}
                </Button>
              </Stack>
            </Box>

            {apiEnabled && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ⚠️ Mantén tu API key segura. No la compartas públicamente ni la incluyas en código del frontend.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                  <WebhookIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>Webhooks</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recibe notificaciones HTTP cuando ocurran eventos en tu cuenta
                  </Typography>
                </Box>
              </Stack>
              <Switch
                checked={webhooksEnabled}
                onChange={(e) => setWebhooksEnabled(e.target.checked)}
                color="primary"
              />
            </Stack>

            {webhooksEnabled && (
              <Box>
                <TextField
                  size="small"
                  fullWidth
                  label="URL del Webhook"
                  placeholder="https://tu-servidor.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  helperText="Enviaremos un POST a esta URL cuando ocurran eventos"
                  sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                  {['Emisiones', 'Cumplimiento', 'Documentos', 'Alertas'].map((label) => (
                    <Chip key={label} label={label} size="small" variant="outlined" />
                  ))}
                </Stack>
                <Button variant="contained" size="small" onClick={handleSaveWebhook} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar configuración'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 3 }}>
          📚 Consulta nuestra <strong>documentación de API</strong> en docs.sustenty.io para
          ejemplos de código y endpoints disponibles.
        </Alert>
      </TabPanel>
    </Box>
  );
}
