import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  MobileStepper,
  Button,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Storage,
  Nature,
  AutoAwesome,
  Refresh,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ArrowForward,
  CloudQueue,
  Layers,
  TrendingDown,
  TrendingUp
} from '@mui/icons-material';
import { Database, ShieldCheck, BarChart3, Leaf } from 'lucide-react';
import MainCard from '../components/MainCard';
import { api } from '../services/api';
import InfoTooltip from '../components/InfoTooltip';

// Tarjeta KPI: ícono + número + label + barra de progreso
function KpiCard({ title, value, subtitle, icon: Icon, iconColor, barColor, barValue, infoKey }) {
  return (
    <MainCard contentSX={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Avatar sx={{ bgcolor: `${iconColor}18`, width: 44, height: 44 }}>
            <Icon sx={{ color: iconColor, fontSize: 22 }} />
          </Avatar>
          {infoKey && <InfoTooltip infoKey={infoKey} size={14} />}
        </Stack>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" lineHeight={1.2}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            {title}
          </Typography>
        </Box>
        {barValue !== undefined && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
              <Typography variant="caption" fontWeight={600} color={iconColor}>{barValue}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={barValue}
              sx={{
                height: 5,
                borderRadius: 3,
                bgcolor: `${iconColor}18`,
                '& .MuiLinearProgress-bar': { bgcolor: iconColor, borderRadius: 3 }
              }}
            />
          </Box>
        )}
      </Stack>
    </MainCard>
  );
}

// Tarjeta de acceso rápido a módulos
function QuickAccessCard({ label, desc, icon: Icon, path, color, navigate }) {
  return (
    <Card
      onClick={() => navigate(path)}
      sx={{
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 4px 16px ${color}22`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: `${color}15`, width: 40, height: 40 }}>
              <Icon size={20} color={color} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>{label}</Typography>
              <Typography variant="caption" color="text.secondary">{desc}</Typography>
            </Box>
          </Stack>
          <ArrowForward sx={{ color: 'text.disabled', fontSize: 18 }} />
        </Stack>
      </CardContent>
    </Card>
  );
}

// ---
// Definir funciones antes del componente para evitar ReferenceError
const loadUser = async (setUser) => {
  try {
    const response = await api.getCurrentUser();
    setUser(response.data);
  } catch (error) {
    console.error('Error al cargar usuario:', error);
  }
};

const loadESGMetrics = async (setEsgData, setLoading, setError) => {
  try {
    setLoading(true);
    const [dataRes, factorsRes, scopesRes, periodsRes, goalsRes, actionsRes] = await Promise.all([
      api.getCarbonData(),
      api.getCarbonFactors(),
      api.getCarbonScopes(),
      api.getCarbonPeriods(),
      api.getESGGoals(),
      api.getESGActions()
    ]);
    const dataCollection = Array.isArray(dataRes.data) ? dataRes.data : dataRes.data.results || [];
    const factors = Array.isArray(factorsRes.data) ? factorsRes.data : factorsRes.data.results || [];
    const scopes = Array.isArray(scopesRes.data) ? scopesRes.data : scopesRes.data.results || [];
    const periods = Array.isArray(periodsRes.data) ? periodsRes.data : periodsRes.data.results || [];
    const goals = Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.results || [];
    const actions = Array.isArray(actionsRes.data) ? actionsRes.data : actionsRes.data.results || [];
    const totalEmissions = dataCollection.reduce((sum, record) => sum + (parseFloat(record.calculated_emission) || 0), 0);
    const scopeData = {
      scope1: dataCollection.filter(d => d.factor_detail?.scope_detail?.code === 'scope_1').reduce((sum, r) => sum + (parseFloat(r.calculated_emission) || 0), 0),
      scope2: dataCollection.filter(d => d.factor_detail?.scope_detail?.code === 'scope_2').reduce((sum, r) => sum + (parseFloat(r.calculated_emission) || 0), 0),
      scope3: dataCollection.filter(d => d.factor_detail?.scope_detail?.code === 'scope_3').reduce((sum, r) => sum + (parseFloat(r.calculated_emission) || 0), 0)
    };
    const categoryCounts = {
      scope1: dataCollection.filter(d => d.factor_detail?.scope_detail?.code === 'scope_1').length,
      scope2: dataCollection.filter(d => d.factor_detail?.scope_detail?.code === 'scope_2').length,
      scope3: dataCollection.filter(d => d.factor_detail?.scope_detail?.code === 'scope_3').length
    };
    const completedRecords = dataCollection.filter(d => d.status === 'completed').length;
    const pendingRecords = dataCollection.filter(d => d.status === 'pending').length;
    const recentData = dataCollection.sort((a, b) => new Date(b.collection_date) - new Date(a.collection_date)).slice(0, 5);
    setEsgData({
      totalEmissions,
      scopeData,
      categoryCounts,
      totalFactors: factors.length,
      totalScopes: scopes.length,
      totalPeriods: periods.length,
      totalActions: actions.length,
      totalGoals: goals.length,
      completedRecords,
      pendingRecords,
      recentData
    });
    setLoading(false);
  } catch (err) {
    console.error('Error loading ESG metrics:', err);
    let errorMessage = 'Error al cargar las métricas ESG';
    if (err.response?.status === 401) {
      errorMessage = 'No estás autenticado. Por favor inicia sesión nuevamente.';
    } else if (err.response?.status === 403) {
      errorMessage = 'No tienes permisos para acceder a estos datos.';
    } else if (err.response?.data?.detail) {
      errorMessage = err.response.data.detail;
    } else if (err.message) {
      errorMessage = `Error: ${err.message}`;
    }
    setError(errorMessage);
    setLoading(false);
  }
};

const loadSustentIAInsights = async (setSustentiaInsights, setInsightLoading) => {
  try {
    setInsightLoading(true);
    const response = await api.getSustentIAInsights();
    if (Array.isArray(response.data)) {
      setSustentiaInsights(response.data);
    } else if (response.data.insights && Array.isArray(response.data.insights)) {
      setSustentiaInsights(response.data.insights);
    } else {
      setSustentiaInsights([response.data]);
    }
  } catch (err) {
    setSustentiaInsights([
      { insight: 'Bienvenido a Sustenty. Comienza explorando las diferentes secciones para gestionar tu impacto ESG.', generated_at: new Date().toISOString(), context: {} },
      { insight: 'Recuerda registrar tus datos de emisiones regularmente para un seguimiento preciso.', generated_at: new Date().toISOString(), context: {} },
      { insight: 'Establece objetivos de reducción de emisiones para medir tu progreso.', generated_at: new Date().toISOString(), context: {} },
      { insight: 'Involucra a tu equipo en las iniciativas de sostenibilidad para mayor impacto.', generated_at: new Date().toISOString(), context: {} },
      { insight: 'Analiza tus datos ESG para identificar oportunidades de mejora.', generated_at: new Date().toISOString(), context: {} }
    ]);
  } finally {
    setInsightLoading(false);
  }
};

export default function Home() {
  const { organizations } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [sustentiaInsights, setSustentiaInsights] = useState([]);
  const [activeInsightStep, setActiveInsightStep] = useState(0);
  const [insightLoading, setInsightLoading] = useState(false);
  const [esgData, setEsgData] = useState({
    totalEmissions: 0,
    scopeData: { scope1: 0, scope2: 0, scope3: 0 },
    categoryCounts: { environmental: 0, social: 0, governance: 0 },
    totalFactors: 0,
    totalScopes: 0,
    totalPeriods: 0,
    totalActions: 0,
    totalGoals: 0,
    completedRecords: 0,
    pendingRecords: 0,
    recentData: []
  });

  useEffect(() => {
    loadUser(setUser);
    loadESGMetrics(setEsgData, setLoading, setError);
    loadSustentIAInsights(setSustentiaInsights, setInsightLoading);
  }, []);

  // Auto-avanzar el slider cada 5 segundos
  useEffect(() => {
    if (sustentiaInsights.length > 1) {
      const timer = setInterval(() => {
        setActiveInsightStep((prevStep) => 
          prevStep === sustentiaInsights.length - 1 ? 0 : prevStep + 1
        );
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [sustentiaInsights]);


  // Render condicionales DESPUÉS de los hooks
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="body1">Si el problema persiste, verifica tu sesión o contacta soporte.</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} href="/login">Ir a login</Button>
      </Box>
    );
  }

  if (Array.isArray(organizations) && organizations.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No tienes organizaciones asociadas a tu usuario.<br />
          Crea una organización para comenzar a usar la plataforma.
        </Alert>
        {/* Si tienes un modal o página para crear organización, enlaza aquí */}
        {/* <Button variant="contained" color="primary" href="/app/organizations/create">Crear organización</Button> */}
      </Box>
    );
  }



  const handleRefreshInsights = async () => {
    setInsightLoading(true);
    setActiveInsightStep(0);
    try {
      const response = await api.getSustentIAInsights(true); // Forzar nueva generación
      console.log('SustentIA refresh response:', response.data);
      
      if (Array.isArray(response.data)) {
        setSustentiaInsights(response.data);
      } else if (response.data.insights && Array.isArray(response.data.insights)) {
        setSustentiaInsights(response.data.insights);
      } else {
        setSustentiaInsights([response.data]);
      }
    } catch (error) {
      console.error('Error refreshing insights:', error);
      console.log('Error details:', error.response);
      setSustentiaInsights([
        {
          insight: 'Bienvenido a Sustenty. Estamos procesando tus datos ESG para ofrecerte insights personalizados.',
          generated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setInsightLoading(false);
    }
  };

  const handleNextInsight = () => {
    setActiveInsightStep((prevStep) => 
      prevStep === sustentiaInsights.length - 1 ? 0 : prevStep + 1
    );
  };

  const handlePrevInsight = () => {
    setActiveInsightStep((prevStep) => 
      prevStep === 0 ? sustentiaInsights.length - 1 : prevStep - 1
    );
  };

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }} align="center">Cargando métricas ESG...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>

      {/* ── Banner de bienvenida ── */}
      <Grid item xs={12}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #0d2420 0%, #1a3d35 60%, #10b981 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'rgba(61,182,138,0.12)',
              top: -120,
              right: -80
            }
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 36, height: 36 }}>
                    <Leaf size={18} color="white" />
                  </Avatar>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Typography>
                </Stack>
                <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 0.5 }}>
                  Hola, {user?.first_name || user?.username || 'Usuario'} 👋
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  Aquí tienes el resumen de tu impacto ESG de hoy
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} sx={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/app/carbon/collection')}
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(8px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                >
                  Registrar datos
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/app/compliance/dashboard')}
                  sx={{ bgcolor: '#10b981', color: 'white', '&:hover': { bgcolor: '#059669' } }}
                >
                  Ver compliance
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* ── KPIs de emisiones (4 tarjetas) ── */}
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Emisiones Totales"
          value={`${esgData.totalEmissions.toFixed(1)} tCO₂e`}
          subtitle="del total registrado"
          icon={CloudQueue}
          iconColor="#ef4444"
          barValue={esgData.totalEmissions > 0 ? 100 : 0}
          infoKey="emissions"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Scope 1 — Directas"
          value={`${esgData.scopeData.scope1.toFixed(1)} tCO₂e`}
          subtitle="del total"
          icon={Layers}
          iconColor="#f59e0b"
          barValue={calculatePercentage(esgData.scopeData.scope1, esgData.totalEmissions)}
          infoKey="scope1"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Scope 2 — Energía"
          value={`${esgData.scopeData.scope2.toFixed(1)} tCO₂e`}
          subtitle="del total"
          icon={Layers}
          iconColor="#0ea5e9"
          barValue={calculatePercentage(esgData.scopeData.scope2, esgData.totalEmissions)}
          infoKey="scope2"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Scope 3 — Indirectas"
          value={`${esgData.scopeData.scope3.toFixed(1)} tCO₂e`}
          subtitle="del total"
          icon={Layers}
          iconColor="#10b981"
          barValue={calculatePercentage(esgData.scopeData.scope3, esgData.totalEmissions)}
          infoKey="scope3"
        />
      </Grid>

      {/* ── SustentIA Insights ── */}
      <Grid item xs={12} md={8}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #0d2420 0%, #134e3a 100%)',
            color: 'white',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.08)',
              top: -80,
              right: -60
            }
          }}
        >
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.2)', width: 40, height: 40 }}>
                    <AutoAwesome sx={{ color: '#10b981', fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600} sx={{ color: 'white' }}>
                      SustentIA
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Insights personalizados · se renuevan cada hora
                    </Typography>
                  </Box>
                </Stack>
                <Tooltip title="Generar nuevos insights">
                  <IconButton
                    onClick={handleRefreshInsights}
                    disabled={insightLoading}
                    size="small"
                    sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    {insightLoading ? <CircularProgress size={18} sx={{ color: '#10b981' }} /> : <Refresh fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Stack>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

              {insightLoading && sustentiaInsights.length === 0 ? (
                <Stack spacing={1}>
                  <LinearProgress sx={{ bgcolor: 'rgba(16,185,129,0.15)', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Generando insights personalizados...</Typography>
                </Stack>
              ) : sustentiaInsights.length > 0 ? (
                <Box>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8, minHeight: '3.6em' }}>
                    "{sustentiaInsights[activeInsightStep]?.insight}"
                  </Typography>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2.5}>
                    <Chip
                      size="small"
                      label={`${activeInsightStep + 1} / ${sustentiaInsights.length}`}
                      sx={{ bgcolor: 'rgba(16,185,129,0.2)', color: '#10b981', border: 'none', fontWeight: 600 }}
                    />
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={handlePrevInsight} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}>
                        <KeyboardArrowLeft fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleNextInsight} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}>
                        <KeyboardArrowRight fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Haz clic en actualizar para obtener insights personalizados.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* ── Estado de recolección ── */}
      <Grid item xs={12} md={4}>
        <MainCard sx={{ height: '100%' }}>
          <Stack spacing={2.5} height="100%">
            <Typography variant="h5" fontWeight={600}>Estado de datos</Typography>
            <Stack spacing={1.5} flex={1}>
              <Card variant="outlined" sx={{ borderColor: 'success.light', bgcolor: 'success.lighter' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'success.light', width: 36, height: 36 }}>
                      <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" color="success.main" fontWeight={700}>{esgData.completedRecords}</Typography>
                      <Typography variant="caption" color="text.secondary">Registros completados</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ borderColor: 'warning.light', bgcolor: 'warning.lighter' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'warning.light', width: 36, height: 36 }}>
                      <Storage sx={{ fontSize: 18, color: 'warning.main' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" color="warning.main" fontWeight={700}>{esgData.pendingRecords}</Typography>
                      <Typography variant="caption" color="text.secondary">Registros pendientes</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary">Completitud</Typography>
                <Typography variant="caption" fontWeight={600} color="success.main">
                  {calculatePercentage(esgData.completedRecords, esgData.completedRecords + esgData.pendingRecords)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={calculatePercentage(esgData.completedRecords, esgData.completedRecords + esgData.pendingRecords)}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'success.lighter', '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 3 } }}
              />
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      {/* ── Accesos rápidos a módulos ── */}
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={600} mb={1.5}>Módulos</Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Huella de Carbono', desc: 'Registro y analítica de emisiones', icon: Database, path: '/app/carbon/collection', color: '#10b981' },
            { label: 'Compliance', desc: 'Documentos, análisis y brechas', icon: ShieldCheck, path: '/app/compliance/dashboard', color: '#0ea5e9' },
            { label: 'ESG', desc: 'Marco, acciones y métricas ESG', icon: BarChart3, path: '/app/esg/overview', color: '#f59e0b' },
            { label: 'Agentes IA', desc: 'SustentIA para insights automáticos', icon: Nature, path: '/app/agentes-ia', color: '#a855f7' },
          ].map(m => (
            <Grid item xs={12} sm={6} md={3} key={m.path}>
              <QuickAccessCard {...m} navigate={navigate} />
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* ── Actividad reciente ── */}
      <Grid item xs={12}>
        <MainCard>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" fontWeight={600}>Actividad reciente</Typography>
              <Button size="small" endIcon={<ArrowForward fontSize="small" />} onClick={() => navigate('/app/carbon/collection')} sx={{ textTransform: 'none' }}>
                Ver todo
              </Button>
            </Stack>
            {esgData.recentData.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No hay datos de recolección registrados aún.</Alert>
            ) : (
              <Stack spacing={1.5}>
                {esgData.recentData.map((record, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Avatar sx={{ bgcolor: record.status === 'completed' ? 'success.lighter' : 'warning.lighter', color: record.status === 'completed' ? 'success.main' : 'warning.main', width: 36, height: 36 }}>
                      <Storage sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {record.metric_detail?.name || 'Métrica sin nombre'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.calculated_emission ? `${parseFloat(record.calculated_emission).toFixed(2)} kgCO₂e` : 'Sin emisión'} · {new Date(record.collection_date).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                    <Chip
                      label={record.status === 'completed' ? 'Completado' : 'Pendiente'}
                      color={record.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
