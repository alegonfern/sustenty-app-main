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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Nature as NatureIcon,
  People as PeopleIcon,
  Gavel as GavelIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import InfoTooltip from '../../components/InfoTooltip';

const Analytics = () => {
  const [period, setPeriod] = useState('2024');
  const [category, setCategory] = useState('all');

  // KPIs principales
  const kpis = [
    {
      title: 'Emisiones CO2',
      value: '1,250 ton',
      target: '1,500 ton',
      progress: 83,
      trend: 'down',
      trendValue: '-12%',
      status: 'success',
      category: 'environmental'
    },
    {
      title: 'Diversidad de Género',
      value: '48%',
      target: '50%',
      progress: 96,
      trend: 'up',
      trendValue: '+3%',
      status: 'success',
      category: 'social'
    },
    {
      title: 'Políticas Implementadas',
      value: '12/15',
      target: '15',
      progress: 80,
      trend: 'up',
      trendValue: '+4',
      status: 'warning',
      category: 'governance'
    },
    {
      title: 'Consumo Energético',
      value: '45,000 kWh',
      target: '40,000 kWh',
      progress: 88,
      trend: 'down',
      trendValue: '-8%',
      status: 'warning',
      category: 'environmental'
    }
  ];

  // Indicadores de cumplimiento
  const complianceIndicators = [
    { standard: 'GRI Standards', completion: 85, status: 'success' },
    { standard: 'SASB Metrics', completion: 72, status: 'warning' },
    { standard: 'TCFD Framework', completion: 65, status: 'warning' },
    { standard: 'CDP Climate', completion: 90, status: 'success' }
  ];

  // Objetivos ESG
  const esgGoals = [
    { 
      name: 'Reducir emisiones 30% para 2025',
      progress: 67,
      status: 'on-track',
      icon: <NatureIcon />
    },
    { 
      name: 'Alcanzar 50% diversidad en liderazgo',
      progress: 45,
      status: 'at-risk',
      icon: <PeopleIcon />
    },
    { 
      name: 'Implementar código de ética en todas las áreas',
      progress: 85,
      status: 'on-track',
      icon: <GavelIcon />
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return null;
    }
  };

  const getGoalStatusColor = (status) => {
    switch (status) {
      case 'on-track': return 'success';
      case 'at-risk': return 'warning';
      case 'delayed': return 'error';
      default: return 'inherit';
    }
  };

  const getGoalStatusLabel = (status) => {
    switch (status) {
      case 'on-track': return 'En camino';
      case 'at-risk': return 'En riesgo';
      case 'delayed': return 'Retrasado';
      default: return 'Sin definir';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" component="h1" gutterBottom>
                Analítica ESG
              </Typography>
              <InfoTooltip infoKey="analytics" />
            </Stack>
            <Typography variant="subtitle1" color="text.secondary">
              Análisis de indicadores y cumplimiento de objetivos de sostenibilidad
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Período</InputLabel>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Período">
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2022">2022</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Categoría</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Categoría">
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="environmental">Ambiental</MenuItem>
                <MenuItem value="social">Social</MenuItem>
                <MenuItem value="governance">Gobernanza</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        📊 <strong>¿Cómo usar la analítica?</strong> Aquí puedes visualizar el progreso de tus KPIs de sostenibilidad. 
        Los indicadores muestran si vas <strong>por encima</strong> o <strong>por debajo</strong> de tus objetivos. 
        Usa los filtros para analizar períodos específicos y categorías ESG.
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
                    {kpi.trend === 'up' ? (
                      <TrendingUpIcon fontSize="small" color={kpi.status === 'success' ? 'success' : 'error'} />
                    ) : (
                      <TrendingDownIcon fontSize="small" color={kpi.status === 'success' ? 'success' : 'error'} />
                    )}
                    <Typography 
                      variant="caption" 
                      color={kpi.status === 'success' ? 'success.main' : 'error.main'}
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

      <Grid container spacing={3}>
        {/* Cumplimiento de Estándares */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Cumplimiento de Estándares
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={3}>
              {complianceIndicators.map((indicator, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">{indicator.standard}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {indicator.completion}%
                      </Typography>
                      {getStatusIcon(indicator.status)}
                    </Stack>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={indicator.completion} 
                    color={indicator.status}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Objetivos ESG */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TrophyIcon color="primary" />
              <Typography variant="h6">
                Objetivos ESG 2025
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <List>
              {esgGoals.map((goal, index) => (
                <ListItem 
                  key={index}
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    py: 2,
                    borderBottom: index < esgGoals.length - 1 ? 1 : 0,
                    borderColor: 'divider'
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      {goal.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={goal.name}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                    <Chip 
                      label={getGoalStatusLabel(goal.status)}
                      color={getGoalStatusColor(goal.status)}
                      size="small"
                    />
                  </Stack>
                  <Box sx={{ width: '100%', pl: 5 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progreso
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {goal.progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={goal.progress} 
                      color={getGoalStatusColor(goal.status)}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
