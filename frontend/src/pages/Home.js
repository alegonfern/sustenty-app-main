import { useState, useEffect } from 'react';
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
  MobileStepper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Business,
  People,
  Assignment,
  CheckCircle,
  Science,
  Layers,
  Storage,
  Nature,
  Groups,
  GavelOutlined,
  CalendarMonth,
  Assessment,
  AutoAwesome,
  Refresh,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import MainCard from '../components/MainCard';
import MyImpact from './dashboard/MyImpact';
import { api } from '../services/api';
import InfoTooltip from '../components/InfoTooltip';
import DiscoverFeed from '../components/DiscoverFeed';

// Componente de tarjeta analítica con tooltip informativo
function AnalyticCard({ title, count, percentage, isLoss = false, color = 'primary', icon: Icon, infoKey }) {
  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack spacing={0.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          {infoKey && <InfoTooltip infoKey={infoKey} size={14} />}
        </Stack>
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h4" color="inherit">
              {count}
            </Typography>
          </Grid>
          {percentage && (
            <Grid item>
              <Chip
                variant="combined"
                color={color}
                icon={
                  isLoss ? (
                    <TrendingDown style={{ fontSize: '0.75rem', color: 'inherit' }} />
                  ) : (
                    <TrendingUp style={{ fontSize: '0.75rem', color: 'inherit' }} />
                  )
                }
                label={`${percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
      <Box sx={{ pt: 2.25 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={color}
          sx={{ height: 6, borderRadius: 1 }}
        />
      </Box>
    </MainCard>
  );
}

export default function Home() {
    // Feed de buenas prácticas ESG (mock por ahora)
    const [discoverFeed, setDiscoverFeed] = useState([
      {
        id: 1,
        type: 'highlight',
        title: 'Acción destacada: Reducción de plásticos',
        description: 'La organización X logró reducir el uso de plásticos en un 30% este trimestre.',
        tags: ['ambiental', 'innovación'],
      },
      {
        id: 2,
        type: 'suggestion',
        title: 'Sugerencia: Implementa reciclaje en oficinas',
        description: 'El 80% de las empresas líderes tienen programas de reciclaje interno. ¡Súmate!',
        tags: ['ambiental', 'práctica'],
      },
      {
        id: 3,
        type: 'recommendation',
        title: 'Recomendación ESG: Medición de huella hídrica',
        description: 'Comienza a medir el consumo de agua para mejorar tu reporte ESG.',
        tags: ['agua', 'reporte'],
      },
    ]);
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
    loadUser();
    loadESGMetrics();
    loadSustentIAInsights();
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

  const loadUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const loadESGMetrics = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los datos en paralelo usando el servicio API
      const [dataRes, factorsRes, scopesRes, periodsRes, goalsRes, actionsRes] = await Promise.all([
        api.getESGDataCollection(),
        api.getESGMetrics(),
        api.getESGScopes(),
        api.getESGPeriods(),
        api.getESGGoals(),
        api.getESGActions()
      ]);

      // Extraer los datos (pueden venir paginados o no)
      const dataCollection = Array.isArray(dataRes.data) ? dataRes.data : dataRes.data.results || [];
      const factors = Array.isArray(factorsRes.data) ? factorsRes.data : factorsRes.data.results || [];
      const scopes = Array.isArray(scopesRes.data) ? scopesRes.data : scopesRes.data.results || [];
      const periods = Array.isArray(periodsRes.data) ? periodsRes.data : periodsRes.data.results || [];
      const goals = Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.results || [];
      const actions = Array.isArray(actionsRes.data) ? actionsRes.data : actionsRes.data.results || [];

      // Calcular emisiones totales
      const totalEmissions = dataCollection.reduce((sum, record) => 
        sum + (parseFloat(record.calculated_emission) || 0), 0
      );

      // Emisiones por Scope
      const scopeData = {
        scope1: dataCollection
          .filter(d => d.metric_detail?.scope_detail?.code === 'scope_1')
          .reduce((sum, r) => sum + (parseFloat(r.calculated_emission) || 0), 0),
        scope2: dataCollection
          .filter(d => d.metric_detail?.scope_detail?.code === 'scope_2')
          .reduce((sum, r) => sum + (parseFloat(r.calculated_emission) || 0), 0),
        scope3: dataCollection
          .filter(d => d.metric_detail?.scope_detail?.code === 'scope_3')
          .reduce((sum, r) => sum + (parseFloat(r.calculated_emission) || 0), 0)
      };

      // Conteos por categoría
      const categoryCounts = {
        environmental: dataCollection.filter(d => 
          d.metric_detail?.category_detail?.code === 'environmental'
        ).length,
        social: dataCollection.filter(d => 
          d.metric_detail?.category_detail?.code === 'social'
        ).length,
        governance: dataCollection.filter(d => 
          d.metric_detail?.category_detail?.code === 'governance'
        ).length
      };

      // Estado de registros
      const completedRecords = dataCollection.filter(d => d.status === 'completed').length;
      const pendingRecords = dataCollection.filter(d => d.status === 'pending').length;

      // Datos recientes (últimos 5)
      const recentData = dataCollection
        .sort((a, b) => new Date(b.collection_date) - new Date(a.collection_date))
        .slice(0, 5);

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
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
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

  const loadSustentIAInsights = async () => {
    try {
      setInsightLoading(true);
      const response = await api.getSustentIAInsights();
      console.log('SustentIA insights response:', response.data);
      
      // Si el backend devuelve un array de insights
      if (Array.isArray(response.data)) {
        setSustentiaInsights(response.data);
      } else if (response.data.insights && Array.isArray(response.data.insights)) {
        setSustentiaInsights(response.data.insights);
      } else {
        // Fallback si es un solo insight
        setSustentiaInsights([response.data]);
      }
    } catch (err) {
      console.error('Error loading SustentIA insights:', err);
      console.error('Error details:', err.response?.data);
      // Fallback en caso de error con mensajes predeterminados
      setSustentiaInsights([
        {
          insight: 'Bienvenido a Sustenty. Comienza explorando las diferentes secciones para gestionar tu impacto ESG.',
          generated_at: new Date().toISOString(),
          context: {}
        },
        {
          insight: 'Recuerda registrar tus datos de emisiones regularmente para un seguimiento preciso.',
          generated_at: new Date().toISOString(),
          context: {}
        },
        {
          insight: 'Establece objetivos de reducción de emisiones para medir tu progreso.',
          generated_at: new Date().toISOString(),
          context: {}
        },
        {
          insight: 'Involucra a tu equipo en las iniciativas de sostenibilidad para mayor impacto.',
          generated_at: new Date().toISOString(),
          context: {}
        },
        {
          insight: 'Analiza tus datos ESG para identificar oportunidades de mejora.',
          generated_at: new Date().toISOString(),
          context: {}
        }
      ]);
    } finally {
      setInsightLoading(false);
    }
  };

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
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>

      {/* Sección de bienvenida */}
      <Grid item xs={12}>
        <MainCard>
          <Box>
            <Typography variant="h3" gutterBottom>
              ¡Bienvenido {user?.first_name || user?.username || 'Usuario'}! 🌱
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitoreo de indicadores ambientales, sociales y de gobernanza
            </Typography>
          </Box>
        </MainCard>
      </Grid>
      {/* Panel Mi Impacto ESG debajo de bienvenida */}
      <Grid item xs={12}>
        <MyImpact />
      </Grid>

      {/* Discover ESG Feed - Buenas prácticas y sugerencias */}
      <Grid item xs={12}>
        <MainCard>
          <Box>
            <Typography variant="h4" color="primary.main" gutterBottom>
              Discover ESG
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Acciones destacadas, sugerencias y recomendaciones para potenciar tu impacto.
            </Typography>
            <DiscoverFeed feed={discoverFeed} />
          </Box>
        </MainCard>
      </Grid>

      {/* SustentIA Insights Slider Card */}
      <Grid item xs={12}>
        <MainCard
          sx={{
            background: [
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Morado
              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Rosa
              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Azul
              'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Verde
              'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'  // Naranja-Amarillo
            ][activeInsightStep % 5],
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.6s ease-in-out',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 56,
                  height: 56,
                }}
              >
                <AutoAwesome sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                    ¿Qué tiene SustentIA para decirte?
                  </Typography>
                  <Tooltip title="Generar nuevos insights">
                    <IconButton
                      onClick={handleRefreshInsights}
                      disabled={insightLoading}
                      sx={{ 
                        color: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                      }}
                    >
                      {insightLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <Refresh />}
                    </IconButton>
                  </Tooltip>
                </Stack>
                
                {insightLoading && sustentiaInsights.length === 0 ? (
                  <Stack spacing={1}>
                    <LinearProgress sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Generando insights personalizados...
                    </Typography>
                  </Stack>
                ) : sustentiaInsights.length > 0 ? (
                  <Box>
                    <Typography variant="body1" sx={{ color: 'white', lineHeight: 1.8, mb: 2, minHeight: '3.6em' }}>
                      {sustentiaInsights[activeInsightStep]?.insight}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <Chip
                        size="small"
                        label={`${activeInsightStep + 1} de ${sustentiaInsights.length} insights`}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          border: 'none'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        • Se renuevan cada hora
                      </Typography>
                    </Stack>
                    
                    <MobileStepper
                      variant="dots"
                      steps={sustentiaInsights.length}
                      position="static"
                      activeStep={activeInsightStep}
                      sx={{
                        bgcolor: 'transparent',
                        '& .MuiMobileStepper-dot': {
                          bgcolor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '& .MuiMobileStepper-dotActive': {
                          bgcolor: 'white',
                        }
                      }}
                      nextButton={
                        <IconButton 
                          size="small" 
                          onClick={handleNextInsight}
                          sx={{ 
                            color: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                          }}
                        >
                          <KeyboardArrowRight />
                        </IconButton>
                      }
                      backButton={
                        <IconButton 
                          size="small" 
                          onClick={handlePrevInsight}
                          sx={{ 
                            color: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                          }}
                        >
                          <KeyboardArrowLeft />
                        </IconButton>
                      }
                    />
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Haz clic en el botón de actualizar para obtener insights personalizados
                  </Typography>
                )}
              </Box>
            </Stack>
          </Stack>
        </MainCard>
      </Grid>

      {/* Métricas principales de emisiones */}
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Emisiones Totales"
          count={`${esgData.totalEmissions.toFixed(2)} tCO₂e`}
          percentage={esgData.totalEmissions > 0 ? 100 : 0}
          color="error"
          icon={Nature}
          infoKey="emissions"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Scope 1 (Directas)"
          count={`${esgData.scopeData.scope1.toFixed(2)} tCO₂e`}
          percentage={calculatePercentage(esgData.scopeData.scope1, esgData.totalEmissions)}
          color="error"
          icon={Layers}
          infoKey="scope1"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Scope 2 (Energía)"
          count={`${esgData.scopeData.scope2.toFixed(2)} tCO₂e`}
          percentage={calculatePercentage(esgData.scopeData.scope2, esgData.totalEmissions)}
          color="warning"
          icon={Layers}
          infoKey="scope2"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Scope 3 (Indirectas)"
          count={`${esgData.scopeData.scope3.toFixed(2)} tCO₂e`}
          percentage={calculatePercentage(esgData.scopeData.scope3, esgData.totalEmissions)}
          color="info"
          icon={Layers}
          infoKey="scope3"
        />
      </Grid>

      {/* Métricas por categoría ESG */}
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Métricas Ambientales"
          count={esgData.categoryCounts.environmental}
          percentage={calculatePercentage(esgData.categoryCounts.environmental, 
            esgData.categoryCounts.environmental + esgData.categoryCounts.social + esgData.categoryCounts.governance)}
          color="success"
          icon={Nature}
          infoKey="environmental"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Métricas Sociales"
          count={esgData.categoryCounts.social}
          percentage={calculatePercentage(esgData.categoryCounts.social, 
            esgData.categoryCounts.environmental + esgData.categoryCounts.social + esgData.categoryCounts.governance)}
          color="primary"
          icon={Groups}
          infoKey="social"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Métricas Gobernanza"
          count={esgData.categoryCounts.governance}
          percentage={calculatePercentage(esgData.categoryCounts.governance, 
            esgData.categoryCounts.environmental + esgData.categoryCounts.social + esgData.categoryCounts.governance)}
          color="info"
          icon={GavelOutlined}
          infoKey="governance"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Factores de Emisión"
          count={esgData.totalFactors}
          percentage={esgData.totalFactors > 0 ? 100 : 0}
          color="primary"
          icon={Science}
          infoKey="emissionFactor"
        />
      </Grid>

      {/* Métricas de configuración y gestión */}
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Scopes Configurados"
          count={esgData.totalScopes}
          percentage={esgData.totalScopes > 0 ? 100 : 0}
          color="success"
          icon={Layers}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Períodos ESG"
          count={esgData.totalPeriods}
          percentage={esgData.totalPeriods > 0 ? 100 : 0}
          color="info"
          icon={CalendarMonth}
          infoKey="period"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Acciones Planificadas"
          count={esgData.totalActions}
          percentage={esgData.totalActions > 0 ? 100 : 0}
          color="warning"
          icon={Assignment}
          infoKey="actions"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Objetivos ESG"
          count={esgData.totalGoals}
          percentage={esgData.totalGoals > 0 ? 100 : 0}
          color="primary"
          icon={CheckCircle}
          infoKey="goals"
        />
      </Grid>

      {/* Estado de recolección de datos */}
      <Grid item xs={12} sm={6}>
        <MainCard>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">Estado de Recolección</Typography>
              <InfoTooltip infoKey="dataCollection" />
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined" sx={{ bgcolor: 'success.lighter' }}>
                  <CardContent>
                    <Stack alignItems="center" spacing={1}>
                      <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                      <Typography variant="h4" color="success.main">
                        {esgData.completedRecords}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completados
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined" sx={{ bgcolor: 'warning.lighter' }}>
                  <CardContent>
                    <Stack alignItems="center" spacing={1}>
                      <Storage sx={{ fontSize: 40, color: 'warning.main' }} />
                      <Typography variant="h4" color="warning.main">
                        {esgData.pendingRecords}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pendientes
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </MainCard>
      </Grid>

      {/* Progreso general */}
      <Grid item xs={12} sm={6}>
        <MainCard>
          <Stack spacing={2}>
            <Typography variant="h5">Progreso General</Typography>
            <Box>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Datos Completados</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculatePercentage(esgData.completedRecords, 
                        esgData.completedRecords + esgData.pendingRecords)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculatePercentage(esgData.completedRecords, 
                      esgData.completedRecords + esgData.pendingRecords)} 
                    color="success" 
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Scope 1 vs Total</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculatePercentage(esgData.scopeData.scope1, esgData.totalEmissions)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculatePercentage(esgData.scopeData.scope1, esgData.totalEmissions)} 
                    color="error" 
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Scope 2 vs Total</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculatePercentage(esgData.scopeData.scope2, esgData.totalEmissions)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculatePercentage(esgData.scopeData.scope2, esgData.totalEmissions)} 
                    color="warning" 
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Scope 3 vs Total</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculatePercentage(esgData.scopeData.scope3, esgData.totalEmissions)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculatePercentage(esgData.scopeData.scope3, esgData.totalEmissions)} 
                    color="info" 
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      {/* Actividad Reciente */}
      <Grid item xs={12}>
        <MainCard>
          <Stack spacing={2}>
            <Typography variant="h5">Actividad Reciente - Datos ESG</Typography>
            {esgData.recentData.length === 0 ? (
              <Alert severity="info">No hay datos de recolección registrados</Alert>
            ) : (
              <Box>
                <Stack spacing={2}>
                  {esgData.recentData.map((record, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: record.status === 'completed' ? 'success.lighter' : 'warning.lighter', 
                        color: record.status === 'completed' ? 'success.main' : 'warning.main' 
                      }}>
                        <Storage />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">
                          {record.metric_detail?.name || 'Métrica sin nombre'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.calculated_emission ? 
                            `${parseFloat(record.calculated_emission).toFixed(2)} ${record.metric_detail?.emission_unit || 'kgCO₂e'}` : 
                            'Sin emisión calculada'}
                          {' • '}
                          {new Date(record.collection_date).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                      <Chip 
                        label={record.status === 'completed' ? 'Completado' : 'Pendiente'}
                        color={record.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
