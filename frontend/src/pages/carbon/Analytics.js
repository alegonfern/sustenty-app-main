import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  LinearProgress,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Co2 as Co2Icon,
  Layers as LayersIcon
} from '@mui/icons-material';
import InfoTooltip from '../../components/InfoTooltip';

const CarbonAnalytics = () => {
  const [period, setPeriod] = useState('2024');

  // KPIs de huella de carbono (datos de ejemplo - se conectarán al API /carbon/periods/{id}/summary/)
  const kpis = [
    {
      title: 'Emisiones Totales',
      value: '1,250 tCO₂e',
      target: '1,500 tCO₂e',
      progress: 83,
      trend: 'down',
      trendValue: '-12%',
      status: 'success'
    },
    {
      title: 'Scope 1 - Directas',
      value: '420 tCO₂e',
      target: '500 tCO₂e',
      progress: 84,
      trend: 'down',
      trendValue: '-8%',
      status: 'success'
    },
    {
      title: 'Scope 2 - Energía',
      value: '380 tCO₂e',
      target: '350 tCO₂e',
      progress: 92,
      trend: 'down',
      trendValue: '-5%',
      status: 'warning'
    },
    {
      title: 'Scope 3 - Indirectas',
      value: '450 tCO₂e',
      target: '650 tCO₂e',
      progress: 69,
      trend: 'down',
      trendValue: '-18%',
      status: 'success'
    }
  ];

  // Distribución por fuente
  const emissionSources = [
    { name: 'Electricidad de Red', scope: 'Scope 2', value: '380 tCO₂e', percentage: 30 },
    { name: 'Gas Natural', scope: 'Scope 1', value: '250 tCO₂e', percentage: 20 },
    { name: 'Flota de Vehículos', scope: 'Scope 1', value: '170 tCO₂e', percentage: 14 },
    { name: 'Viajes de Negocio', scope: 'Scope 3', value: '200 tCO₂e', percentage: 16 },
    { name: 'Transporte Empleados', scope: 'Scope 3', value: '150 tCO₂e', percentage: 12 },
    { name: 'Residuos', scope: 'Scope 3', value: '100 tCO₂e', percentage: 8 }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" component="h1" gutterBottom>
                Analítica de Huella de Carbono
              </Typography>
              <InfoTooltip infoKey="analytics" />
            </Stack>
            <Typography variant="subtitle1" color="text.secondary">
              Visualización y análisis de emisiones de gases de efecto invernadero
            </Typography>
          </Box>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Período</InputLabel>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Período">
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        📊 <strong>¿Cómo leer estos datos?</strong> Las emisiones se clasifican en 3 scopes según el GHG Protocol.
        Los indicadores muestran tu progreso respecto a las metas de reducción definidas.
      </Alert>

      {/* KPIs principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      {kpi.title}
                    </Typography>
                    {getStatusIcon(kpi.status)}
                  </Stack>

                  <Typography variant="h4">
                    {kpi.value}
                  </Typography>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Meta: {kpi.target}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {kpi.progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={kpi.progress}
                      color={kpi.status}
                    />
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingDownIcon fontSize="small" color="success" />
                    <Typography
                      variant="caption"
                      color="success.main"
                      fontWeight={600}
                    >
                      {kpi.trendValue} vs período anterior
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Distribución por fuente */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Co2Icon color="primary" />
              <Typography variant="h6">
                Distribución de Emisiones por Fuente
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {emissionSources.map((source, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">{source.name}</Typography>
                      <Chip label={source.scope} size="small" variant="outlined" color="primary" />
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {source.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                        {source.percentage}%
                      </Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={source.percentage}
                    color="primary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CarbonAnalytics;
