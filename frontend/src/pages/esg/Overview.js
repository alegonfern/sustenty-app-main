import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Nature as NatureIcon,
  People as PeopleIcon,
  Gavel as GavelIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import InfoTooltip from '../../components/InfoTooltip';
import { api } from '../../services/api';

const ESGOverview = () => {
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, goalsRes, actionsRes] = await Promise.all([
        api.getESGCategories(),
        api.getESGGoals(),
        api.getESGActions()
      ]);

      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.results || []);
      setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.results || []);
      setActions(Array.isArray(actionsRes.data) ? actionsRes.data : actionsRes.data.results || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const getCategoryIcon = (code) => {
    switch (code) {
      case 'environmental': return <NatureIcon sx={{ fontSize: 48, color: 'success.light', opacity: 0.3 }} />;
      case 'social': return <PeopleIcon sx={{ fontSize: 48, color: 'info.light', opacity: 0.3 }} />;
      case 'governance': return <GavelIcon sx={{ fontSize: 48, color: 'warning.light', opacity: 0.3 }} />;
      default: return <TrophyIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.3 }} />;
    }
  };

  const getCategoryColor = (code) => {
    switch (code) {
      case 'environmental': return 'success.main';
      case 'social': return 'info.main';
      case 'governance': return 'warning.main';
      default: return 'primary.main';
    }
  };

  const getGoalStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'success';
      case 'at_risk': return 'warning';
      case 'delayed': return 'error';
      case 'achieved': return 'success';
      default: return 'default';
    }
  };

  const getGoalStatusLabel = (status) => {
    switch (status) {
      case 'on_track': return 'En camino';
      case 'at_risk': return 'En riesgo';
      case 'delayed': return 'Retrasado';
      case 'achieved': return 'Alcanzado';
      default: return 'Sin definir';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4" component="h1" gutterBottom>
            Marco Estratégico ESG
          </Typography>
          <InfoTooltip infoKey="dataCollection" />
        </Stack>
        <Typography variant="subtitle1" color="text.secondary">
          Visión general de categorías, metas y acciones de sostenibilidad
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }} icon={false}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          🌍 Marco ESG (Environmental, Social &amp; Governance)
        </Typography>
        <Typography variant="body2">
          Aquí gestionas la estrategia de sostenibilidad: categorías ESG, metas y planes de acción.
          Para el registro detallado de emisiones y huella de carbono, consulta el módulo de <strong>Huella de Carbono</strong>.
        </Typography>
      </Alert>

      {/* Tarjetas de categorías */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {categories.map((cat) => (
          <Grid item xs={12} md={4} key={cat.id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {cat.name}
                    </Typography>
                    <Typography variant="h4" color={getCategoryColor(cat.code)}>
                      {goals.filter(g => g.category === cat.id).length} metas
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {actions.filter(a => a.category === cat.id).length} acciones
                    </Typography>
                  </Box>
                  {getCategoryIcon(cat.code)}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {categories.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="warning">
              No hay categorías ESG configuradas. Ejecuta la carga inicial de datos.
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Metas ESG */}
      {goals.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <TrophyIcon color="primary" />
            <Typography variant="h6">Metas ESG</Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {goals.map((goal) => (
              <Box key={goal.id}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={500}>{goal.name}</Typography>
                    <Chip
                      label={goal.category_detail?.name || ''}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={getGoalStatusLabel(goal.status)}
                      color={getGoalStatusColor(goal.status)}
                      size="small"
                    />
                    <Typography variant="caption" fontWeight={600}>
                      {goal.current_progress || 0}%
                    </Typography>
                  </Stack>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={goal.current_progress || 0}
                  color={getGoalStatusColor(goal.status)}
                />
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Container>
  );
};

export default ESGOverview;
