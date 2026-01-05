import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as CompleteIcon,
  Schedule as ScheduleIcon,
  PlayArrow as InProgressIcon,
  Pause as PausedIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import InfoTooltip from '../../components/InfoTooltip';

const Actions = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Planes de acción de ejemplo
  const actions = [
    {
      id: 1,
      title: 'Reducción de Emisiones - Planta Norte',
      category: 'Ambiental',
      priority: 'Alta',
      status: 'En progreso',
      progress: 65,
      responsible: 'Operaciones',
      startDate: '01/01/2024',
      endDate: '31/12/2024',
      budget: '€150,000',
      team: 4
    },
    {
      id: 2,
      title: 'Programa de Capacitación en Diversidad',
      category: 'Social',
      priority: 'Media',
      status: 'Planificado',
      progress: 30,
      responsible: 'RRHH',
      startDate: '15/02/2024',
      endDate: '30/06/2024',
      budget: '€45,000',
      team: 2
    },
    {
      id: 3,
      title: 'Implementación Código de Ética',
      category: 'Gobernanza',
      priority: 'Alta',
      status: 'En progreso',
      progress: 85,
      responsible: 'Legal',
      startDate: '01/01/2024',
      endDate: '31/03/2024',
      budget: '€25,000',
      team: 3
    },
    {
      id: 4,
      title: 'Instalación Paneles Solares',
      category: 'Ambiental',
      priority: 'Alta',
      status: 'Completado',
      progress: 100,
      responsible: 'Infraestructura',
      startDate: '01/09/2023',
      endDate: '31/12/2023',
      budget: '€300,000',
      team: 6
    },
    {
      id: 5,
      title: 'Programa Salud Mental Empleados',
      category: 'Social',
      priority: 'Media',
      status: 'En progreso',
      progress: 50,
      responsible: 'RRHH',
      startDate: '01/03/2024',
      endDate: '31/12/2024',
      budget: '€35,000',
      team: 2
    },
    {
      id: 6,
      title: 'Auditoría Cumplimiento GDPR',
      category: 'Gobernanza',
      priority: 'Alta',
      status: 'Pausado',
      progress: 40,
      responsible: 'IT Security',
      startDate: '01/02/2024',
      endDate: '30/06/2024',
      budget: '€60,000',
      team: 4
    }
  ];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Completado':
        return { color: 'success', icon: <CompleteIcon fontSize="small" /> };
      case 'En progreso':
        return { color: 'info', icon: <InProgressIcon fontSize="small" /> };
      case 'Planificado':
        return { color: 'warning', icon: <ScheduleIcon fontSize="small" /> };
      case 'Pausado':
        return { color: 'primary', icon: <PausedIcon fontSize="small" /> };
      default:
        return { color: 'primary', icon: null };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'error';
      case 'Media': return 'warning';
      case 'Baja': return 'success';
      default: return 'primary';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Ambiental': return 'success';
      case 'Social': return 'info';
      case 'Gobernanza': return 'warning';
      default: return 'primary';
    }
  };

  const filterActionsByTab = () => {
    switch (currentTab) {
      case 0: return actions;
      case 1: return actions.filter(a => a.category === 'Ambiental');
      case 2: return actions.filter(a => a.category === 'Social');
      case 3: return actions.filter(a => a.category === 'Gobernanza');
      default: return actions;
    }
  };

  // Estadísticas de acciones
  const stats = {
    total: actions.length,
    completed: actions.filter(a => a.status === 'Completado').length,
    inProgress: actions.filter(a => a.status === 'En progreso').length,
    planned: actions.filter(a => a.status === 'Planificado').length
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" component="h1" gutterBottom>
                Planes de Acción ESG
              </Typography>
              <InfoTooltip infoKey="actions" />
            </Stack>
            <Typography variant="subtitle1" color="text.secondary">
              Gestión y seguimiento de iniciativas de sostenibilidad
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />}>
            Nueva Acción
          </Button>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        🎯 <strong>¿Cómo funcionan las acciones?</strong> Cada acción representa una iniciativa concreta para mejorar tu desempeño ESG. 
        Puedes crear acciones para reducir emisiones (<strong>Ambiental</strong>), mejorar el bienestar de empleados (<strong>Social</strong>), 
        o fortalecer la gobernanza (<strong>Gobernanza</strong>). El seguimiento del progreso te ayuda a demostrar mejoras continuas.
      </Alert>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Acciones
              </Typography>
              <Typography variant="h3" color="primary">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Completadas
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                En Progreso
              </Typography>
              <Typography variant="h3" color="info.main">
                {stats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Planificadas
              </Typography>
              <Typography variant="h3" color="warning.main">
                {stats.planned}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs por categoría */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Todas" />
          <Tab label="Ambiental" />
          <Tab label="Social" />
          <Tab label="Gobernanza" />
        </Tabs>
      </Paper>

      {/* Tabla de acciones */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Acción</strong></TableCell>
                <TableCell><strong>Categoría</strong></TableCell>
                <TableCell><strong>Prioridad</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Progreso</strong></TableCell>
                <TableCell><strong>Responsable</strong></TableCell>
                <TableCell><strong>Fechas</strong></TableCell>
                <TableCell><strong>Presupuesto</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterActionsByTab().map((action) => {
                const statusInfo = getStatusInfo(action.status);
                return (
                  <TableRow key={action.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {action.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={action.category} 
                        color={getCategoryColor(action.category)} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={action.priority} 
                        color={getPriorityColor(action.priority)} 
                        size="small"
                        icon={<FlagIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={action.status} 
                        color={statusInfo.color} 
                        size="small"
                        icon={statusInfo.icon}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            {action.progress}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={action.progress} 
                          color={statusInfo.color}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          {action.responsible}
                        </Typography>
                        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                          {[...Array(action.team)].map((_, i) => (
                            <Avatar key={i}>{i + 1}</Avatar>
                          ))}
                        </AvatarGroup>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        Inicio: {action.startDate}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Fin: {action.endDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {action.budget}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Actions;
