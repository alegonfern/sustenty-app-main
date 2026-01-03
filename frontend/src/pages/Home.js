import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { api } from '../services/api';

const Home = () => {
  const { data: healthData, isLoading } = useQuery('health', api.healthCheck);

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Bienvenido a Sustenty
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Tu aplicación para un futuro más sostenible
        </Typography>
        
        <Box sx={{ mt: 4, mb: 8 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/dashboard"
            sx={{ mr: 2 }}
          >
            Ir al Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/login"
          >
            Iniciar Sesión
          </Button>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                🌱 Sostenibilidad
              </Typography>
              <Typography>
                Gestiona y monitorea tus iniciativas de sostenibilidad
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                📊 Análisis
              </Typography>
              <Typography>
                Obtén insights detallados sobre tu impacto ambiental
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                🎯 Objetivos
              </Typography>
              <Typography>
                Define y alcanza tus metas de sostenibilidad
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* API Status */}
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 2, backgroundColor: isLoading ? '#f5f5f5' : (healthData ? '#e8f5e8' : '#ffebee') }}>
            <Typography variant="body2">
              Estado de la API: {' '}
              {isLoading ? 'Verificando...' : (
                healthData ? 
                `✅ ${healthData.data.message} (v${healthData.data.version})` : 
                '❌ API no disponible'
              )}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;