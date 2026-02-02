import { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Assessment,
  Description,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  TrendingUp,
  Refresh,
  Policy,
  GavelOutlined,
  Security,
  Eco
} from '@mui/icons-material';
import MainCard from '../../components/MainCard';
import { api } from '../../services/api';
import InfoTooltip from '../../components/InfoTooltip';

// Componente de tarjeta de métrica con tooltip informativo
function MetricCard({ title, value, subtitle, icon: Icon, color = 'primary', infoKey }) {
  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            {infoKey && <InfoTooltip infoKey={infoKey} size={14} />}
          </Stack>
          <Typography variant="h3" color={`${color}.main`}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {Icon && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.lighter`,
              color: `${color}.main`
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Box>
        )}
      </Stack>
    </MainCard>
  );
}

// Componente de score circular
function ComplianceScoreCircle({ score, size = 120 }) {
  const getColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={score || 0}
        size={size}
        thickness={4}
        color={getColor(score)}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" component="div" color="text.primary">
          {score ? `${Math.round(score)}%` : 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ComplianceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    total_frameworks: 0,
    total_documents: 0,
    total_analyses: 0,
    average_compliance_score: null,
    gaps_by_severity: {},
    gaps_by_status: {},
    compliance_by_framework: [],
    recent_analyses: [],
    pending_gaps: []
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getComplianceDashboard();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error al cargar el dashboard de cumplimiento');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success',
      info: 'default'
    };
    return colors[severity] || 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle color="success" />;
      case 'partial':
        return <Warning color="warning" />;
      case 'non_compliant':
        return <ErrorIcon color="error" />;
      default:
        return <Policy color="info" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" gutterBottom>
              Dashboard de Cumplimiento
            </Typography>
            <InfoTooltip infoKey="compliance" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Verifica que tu organización cumple con las regulaciones y estándares ESG aplicables
          </Typography>
        </Box>
        <Tooltip title="Actualizar">
          <IconButton onClick={loadDashboard} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Información para nuevos usuarios */}
      {dashboardData.total_analyses === 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={false}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📋 ¡Comienza tu viaje hacia el cumplimiento!
          </Typography>
          <Typography variant="body2">
            El cumplimiento normativo no es solo una obligación legal, es una oportunidad para demostrar 
            el compromiso de tu empresa con la sostenibilidad. Sube tus documentos y políticas para que 
            Sustenty analice tu nivel de cumplimiento con los principales marcos regulatorios.
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Score Principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <MainCard>
            <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
              <Typography variant="h6">Puntuación General</Typography>
              <ComplianceScoreCircle score={dashboardData.average_compliance_score} size={150} />
              <Typography variant="body2" color="text.secondary" align="center">
                Una puntuación alta atrae inversores y mejora tu reputación corporativa
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Métricas */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Frameworks"
                value={dashboardData.total_frameworks}
                icon={Policy}
                color="primary"
                infoKey="framework"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Documentos"
                value={dashboardData.total_documents}
                icon={Description}
                color="info"
                infoKey="documents"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Análisis"
                value={dashboardData.total_analyses}
                icon={Assessment}
                color="secondary"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Gaps Críticos"
                value={dashboardData.gaps_by_severity?.critical || 0}
                icon={Warning}
                color="error"
                infoKey="gap"
              />
            </Grid>
          </Grid>

          {/* Brechas por Estado */}
          <MainCard sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estado de Requisitos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Stack alignItems="center">
                  <Typography variant="h4" color="success.main">
                    {dashboardData.gaps_by_status?.compliant || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cumple
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack alignItems="center">
                  <Typography variant="h4" color="warning.main">
                    {dashboardData.gaps_by_status?.partial || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Parcial
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack alignItems="center">
                  <Typography variant="h4" color="error.main">
                    {dashboardData.gaps_by_status?.non_compliant || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No Cumple
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* Cumplimiento por Framework */}
        <Grid item xs={12} md={6}>
          <MainCard>
            <Typography variant="h6" gutterBottom>
              Cumplimiento por Framework
            </Typography>
            {dashboardData.compliance_by_framework?.length > 0 ? (
              <Stack spacing={2}>
                {dashboardData.compliance_by_framework.map((item, index) => (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">
                        {item.framework__name || item.framework__code}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {Math.round(item.avg_score || 0)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={item.avg_score || 0}
                      color={item.avg_score >= 80 ? 'success' : item.avg_score >= 60 ? 'warning' : 'error'}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No hay análisis realizados aún
              </Typography>
            )}
          </MainCard>
        </Grid>

        {/* Gaps Pendientes */}
        <Grid item xs={12} md={6}>
          <MainCard>
            <Typography variant="h6" gutterBottom>
              Brechas Pendientes (Críticas y Altas)
            </Typography>
            {dashboardData.pending_gaps?.length > 0 ? (
              <List dense>
                {dashboardData.pending_gaps.slice(0, 5).map((gap, index) => (
                  <Box key={gap.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(gap.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={gap.requirement_name || gap.requirement_code}
                        secondary={gap.finding?.substring(0, 80) + '...' || 'Sin descripción'}
                      />
                      <Chip
                        label={gap.severity}
                        size="small"
                        color={getSeverityColor(gap.severity)}
                      />
                    </ListItem>
                    {index < dashboardData.pending_gaps.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
                <CheckCircle color="success" sx={{ fontSize: 48 }} />
                <Typography variant="body2" color="text.secondary">
                  No hay brechas críticas pendientes
                </Typography>
              </Stack>
            )}
          </MainCard>
        </Grid>

        {/* Análisis Recientes */}
        <Grid item xs={12}>
          <MainCard>
            <Typography variant="h6" gutterBottom>
              Análisis Recientes
            </Typography>
            {dashboardData.recent_analyses?.length > 0 ? (
              <Grid container spacing={2}>
                {dashboardData.recent_analyses.map((analysis) => (
                  <Grid item xs={12} sm={6} md={4} key={analysis.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {analysis.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {analysis.framework_name}
                            </Typography>
                          </Box>
                          <ComplianceScoreCircle score={analysis.compliance_score} size={60} />
                        </Stack>
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={analysis.status}
                            size="small"
                            color={analysis.status === 'completed' ? 'success' : 'default'}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No hay análisis realizados. Sube documentos y ejecuta tu primer análisis.
              </Typography>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
