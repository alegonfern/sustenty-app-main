import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import { authService } from '../services/auth';

const Dashboard = () => {
  const { data: healthData } = useQuery('health', api.healthCheck);
  const currentUser = authService.getCurrentUser();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenido de vuelta, {currentUser?.username || 'Usuario'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Estadísticas principales */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Proyectos Activos
              </Typography>
              <Typography variant="h3" color="primary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Proyectos en curso
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Impacto Total
              </Typography>
              <Typography variant="h3" color="secondary">
                0%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reducción de CO2
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Objetivos Alcanzados
              </Typography>
              <Typography variant="h3" color="success.main">
                0/0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este mes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sección de contenido principal */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No hay actividad reciente. Comienza creando tu primer proyecto de sostenibilidad.
            </Typography>
          </Paper>
        </Grid>

        {/* Estado del sistema */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estado del Sistema
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: healthData ? 'success.main' : 'error.main',
                }}
              />
              <Typography variant="body2">
                API: {healthData ? 'Conectada' : 'Desconectada'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;