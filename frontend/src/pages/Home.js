import { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Business,
  People,
  Assignment,
  CheckCircle
} from '@mui/icons-material';
import MainCard from '../components/MainCard';

// Componente de tarjeta analítica
function AnalyticCard({ title, count, percentage, isLoss = false, color = 'primary', icon: Icon }) {
  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack spacing={0.5}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
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
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Tarjetas de estadísticas */}
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Total Organizaciones"
          count="5"
          percentage={45}
          color="primary"
          icon={Business}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Usuarios Activos"
          count="128"
          percentage={65}
          color="success"
          icon={People}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Tareas Completadas"
          count="342"
          percentage={82}
          color="info"
          icon={CheckCircle}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <AnalyticCard
          title="Proyectos Activos"
          count="12"
          percentage={28}
          isLoss
          color="warning"
          icon={Assignment}
        />
      </Grid>

      {/* Sección de bienvenida */}
      <Grid item xs={12} md={7} lg={8}>
        <MainCard>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3" gutterBottom>
                Bienvenido a Sustenty 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestiona tus organizaciones de manera eficiente y sostenible
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">Organizaciones</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Gestiona tus empresas
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                        <People />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">Usuarios</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Administra tu equipo
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">Proyectos</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Seguimiento de avances
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                        <CheckCircle />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">Reportes</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Análisis y métricas
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </MainCard>
      </Grid>

      {/* Panel lateral */}
      <Grid item xs={12} md={5} lg={4}>
        <Stack spacing={3}>
          <MainCard>
            <Stack spacing={2}>
              <Typography variant="h5">Actividad Reciente</Typography>
              <Box>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main' }}>
                      <CheckCircle />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">Nueva organización creada</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hace 2 horas
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                      <People />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">Usuario añadido al equipo</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hace 5 horas
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main' }}>
                      <Assignment />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">Proyecto actualizado</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hace 1 día
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </MainCard>

          <MainCard>
            <Stack spacing={2}>
              <Typography variant="h5">Progreso General</Typography>
              <Box>
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Tareas Completadas</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        75%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={75} color="success" />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Proyectos en Curso</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        60%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={60} color="primary" />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Objetivos Mensuales</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        45%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={45} color="warning" />
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}
