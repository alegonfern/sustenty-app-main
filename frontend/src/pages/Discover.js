import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Stack, CircularProgress } from '@mui/material';
import { EmojiEvents, Lightbulb, Star, TrendingUp } from '@mui/icons-material';
import { api } from '../services/api';

export default function Discover() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        // Endpoint futuro: /api/v1/discover/
        // Por ahora, datos mock
        const data = [
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
        ];
        setFeed(data);
        setError(null);
      } catch (e) {
        setError('Error al cargar el feed');
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom color="primary.main">Discover ESG</Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Acciones destacadas, sugerencias y recomendaciones para potenciar tu impacto.
      </Typography>
      {loading ? (
        <Box py={6} textAlign="center"><CircularProgress /></Box>
      ) : error ? (
        <Box py={6} textAlign="center"><Typography color="error">{error}</Typography></Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {feed.map(item => (
            <Grid item xs={12} md={4} key={item.id}>
              <Card variant="outlined" sx={{ boxShadow: 0 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    {item.type === 'highlight' && <Star color="warning" fontSize="large" />}
                    {item.type === 'suggestion' && <Lightbulb color="info" fontSize="large" />}
                    {item.type === 'recommendation' && <TrendingUp color="success" fontSize="large" />}
                    <Typography variant="h6">{item.title}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={2}>{item.description}</Typography>
                  <Stack direction="row" spacing={1}>
                    {item.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
