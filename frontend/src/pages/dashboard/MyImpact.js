import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Stack, Paper } from '@mui/material';
import { EmojiEvents, TrendingUp, CheckCircle, Nature } from '@mui/icons-material';
import { api } from '../../services/api';

export default function MyImpact() {
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImpact = async () => {
      setLoading(true);
      try {
        // Simulación: reemplazar por endpoint real de resumen de impacto
        const [actionsRes, metricsRes] = await Promise.all([
          api.getESGActions(),
          api.getESGMetrics()
        ]);
        const actions = Array.isArray(actionsRes.data) ? actionsRes.data : actionsRes.data.results || [];
        const metrics = Array.isArray(metricsRes.data) ? metricsRes.data : metricsRes.data.results || [];
        const completed = actions.filter(a => a.status === 'completed').length;
        const total = actions.length;
        // Simulación de reducción de emisiones
        const emissionReduction = metrics.reduce((acc, m) => acc + (m.reduction || 0), 0);
        setImpact({
          completed,
          total,
          emissionReduction,
        });
        setError(null);
      } catch (e) {
        setError('Error al cargar el impacto');
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);

  if (loading) return <Box py={6} textAlign="center"><CircularProgress /></Box>;
  if (error) return <Box py={6} textAlign="center"><Typography color="error">{error}</Typography></Box>;

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
      <Typography variant="h4" gutterBottom color="primary.main">Mi Impacto ESG</Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        ¡Felicidades! Aquí puedes ver tu contribución y progreso en sostenibilidad.
      </Typography>
      {impact ? (
        <Grid container spacing={3} sx={{ my: 2 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ boxShadow: 0 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CheckCircle color="success" fontSize="large" />
                  <Box>
                    <Typography variant="h5">{impact.completed}</Typography>
                    <Typography variant="body2">Acciones completadas</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ boxShadow: 0 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUp color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h5">{impact.total}</Typography>
                    <Typography variant="body2">Acciones totales</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ boxShadow: 0 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Nature color="success" fontSize="large" />
                  <Box>
                    <Typography variant="h5">{impact.emissionReduction} kg CO₂</Typography>
                    <Typography variant="body2">Reducción de emisiones</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Box py={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            No hay datos de impacto disponibles.
          </Typography>
        </Box>
      )}
      {/* Aquí puedes agregar más gráficos, mensajes motivacionales, etc. */}
    </Paper>
  );
}
