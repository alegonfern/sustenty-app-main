import React, { useState, useEffect, useMemo } from 'react';
import { Autocomplete } from '@mui/material';
import { api } from '../../services/api';
import { useForm } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
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

  // Estado real de acciones
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAction, setEditAction] = useState(null);
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [metrics, setMetrics] = useState([]);
    // Cargar métricas ESG
    const fetchMetrics = async () => {
      try {
        const res = await api.getESGMetrics();
        setMetrics(res.data);
      } catch (e) {
        setMetrics([]);
      }
    };
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm();

  // Cargar acciones reales
  useEffect(() => {
    fetchActions();
    fetchOrganizations();
    fetchCurrentUser();
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchTeamMembers(selectedOrg.id);
    } else {
      setTeamMembers([]);
    }
  }, [selectedOrg]);

  // Cargar organizaciones
  const fetchOrganizations = async () => {
    try {
      const res = await api.getOrganizations();
      setOrganizations(res.data);
      if (res.data.length > 0) setSelectedOrg(res.data[0]);
    } catch (e) {
      setOrganizations([]);
    }
  };

  // Cargar usuario actual (Admin)
  const fetchCurrentUser = async () => {
    try {
      const res = await api.getCurrentUser();
      setCurrentUser(res.data);
    } catch (e) {
      setCurrentUser(null);
    }
  };

  // Cargar miembros de equipo por organización
  const fetchTeamMembers = async (orgId) => {
    try {
      const res = await api.get(`/team/members/by_organization/?organization_id=${orgId}`);
      setTeamMembers(res.data);
    } catch (e) {
      setTeamMembers([]);
    }
  };

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await api.getESGActions();
      // Asegura que siempre sea array
      let data = res.data;
      if (!Array.isArray(data)) {
        if (data && typeof data === 'object' && Array.isArray(data.results)) {
          data = data.results;
        } else {
          data = [];
        }
      }
      setActions(data);
    } catch (e) {
      setActions([]);
      toast.error('Error cargando acciones');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para nueva acción
  const handleOpenDialog = () => {
    setEditAction(null);
    reset();
    setValue('responsible', null);
    setValue('team_members', []);
    setSelectedOrg(organizations[0] || null);
    setOpenDialog(true);
  };

  // Abrir modal para editar acción
  const handleEditAction = (action) => {
    setEditAction(action);
    reset({ ...action });
    setValue('responsible', action.responsible || null);
    setValue('team_members', action.team_members || []);
    setValue('metric', action.metric || null);
    setValue('expected_impact', action.expected_impact || '');
    setValue('actual_result', action.actual_result || '');
    // Buscar la organización de la acción
    const org = organizations.find(o => o.id === action.organization) || organizations[0] || null;
    setSelectedOrg(org);
    setOpenDialog(true);
  };

  // Guardar acción (crear o editar)
  const onSubmit = async (data) => {
    // Adaptar datos para backend: responsable = id, team_members = [ids]
    const payload = {
      ...data,
      responsible: data.responsible ? data.responsible.id : null,
      team_members: (data.team_members || []).map(u => u.id),
      metric: data.metric || null,
      expected_impact: data.expected_impact || '',
      actual_result: data.actual_result || '',
    };
    try {
      if (editAction) {
        await api.patch(`/esg/actions/${editAction.id}/`, payload);
        toast.success('Acción actualizada');
      } else {
        await api.post('/esg/actions/', payload);
        toast.success('Acción creada');
      }
      setOpenDialog(false);
      fetchActions();
    } catch (e) {
      toast.error('Error guardando acción');
    }
  };

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

  // Adaptar categorías reales
  const filterActionsByTab = () => {
    switch (currentTab) {
      case 0: return actions;
      case 1: return actions.filter(a => a.category_detail?.name === 'Ambiental');
      case 2: return actions.filter(a => a.category_detail?.name === 'Social');
      case 3: return actions.filter(a => a.category_detail?.name === 'Gobernanza');
      default: return actions;
    }
  };

  // Estadísticas de acciones (usando estados reales)
  const stats = useMemo(() => ({
    total: actions.length,
    completed: actions.filter(a => a.status === 'completed').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    planned: actions.filter(a => a.status === 'planned').length
  }), [actions]);

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
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
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
        {loading ? (
          <Stack alignItems="center" py={6}><CircularProgress /></Stack>
        ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Acción</strong></TableCell>
                <TableCell><strong>Categoría</strong></TableCell>
                <TableCell><strong>Métrica</strong></TableCell>
                <TableCell><strong>Impacto Esperado</strong></TableCell>
                <TableCell><strong>Resultado Real</strong></TableCell>
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
                        label={action.category_detail?.name || '-'} 
                        color={getCategoryColor(action.category_detail?.name)} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {action.metric_detail?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {action.expected_impact || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {action.actual_result || '-'}
                      </Typography>
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
                          {action.responsible_detail?.first_name || action.responsible_detail?.username || '-'}
                        </Typography>
                        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                          {(action.team_members_detail || []).map((member, i) => (
                            <Avatar key={i}>{member.first_name?.[0] || member.username?.[0] || '?'}</Avatar>
                          ))}
                        </AvatarGroup>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        Inicio: {action.start_date}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Fin: {action.end_date}
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
                      <IconButton size="small" color="primary" onClick={() => handleEditAction(action)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Paper>

      {/* Modal para crear/editar acción */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editAction ? 'Editar Acción' : 'Nueva Acción'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField label="Título*" {...register('title', { required: true })} fullWidth error={!watch('title')} helperText={!watch('title') ? 'Campo obligatorio' : ''} />
              <TextField label="Descripción" {...register('description')} fullWidth multiline rows={2} />
              <TextField
                label="Organización"
                select
                value={selectedOrg ? selectedOrg.id : ''}
                onChange={e => {
                  const org = organizations.find(o => o.id === Number(e.target.value));
                  setSelectedOrg(org);
                  setValue('organization', org ? org.id : null);
                }}
                fullWidth
              >
                {organizations.map(org => (
                  <MenuItem key={org.id} value={org.id}>{org.nombre || org.name}</MenuItem>
                ))}
              </TextField>
              <TextField label="Prioridad" select {...register('priority')} fullWidth>
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="critical">Crítica</MenuItem>
              </TextField>
              <TextField label="Estado" select {...register('status')} fullWidth>
                <MenuItem value="planned">Planificado</MenuItem>
                <MenuItem value="in_progress">En Progreso</MenuItem>
                <MenuItem value="paused">Pausado</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </TextField>
              <Autocomplete
                options={[
                  ...(currentUser ? [{ ...currentUser, _role: 'Admin' }] : []),
                  ...teamMembers.map(m => ({ ...m, _role: 'Miembro' }))
                ]}
                getOptionLabel={u => u._role === 'Admin' ? `${u.first_name} ${u.last_name} (Admin)` : `${u.name || u.email || u.username} (Miembro)`}
                value={watch('responsible') || null}
                onChange={(_, value) => setValue('responsible', value)}
                renderInput={(params) => <TextField {...params} label="Responsable*" fullWidth error={!watch('responsible')} helperText={!watch('responsible') ? 'Selecciona un responsable' : ''} />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
              <Autocomplete
                multiple
                options={teamMembers}
                getOptionLabel={u => u.name || u.email || u.username}
                value={watch('team_members') || []}
                onChange={(_, value) => setValue('team_members', value)}
                renderInput={(params) => <TextField {...params} label="Miembros del Equipo" fullWidth />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
              <TextField label="Progreso (%)" type="number" {...register('progress')} fullWidth />
              <TextField label="Fecha de Inicio" type="date" {...register('start_date')} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Fecha de Fin" type="date" {...register('end_date')} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Presupuesto" type="number" {...register('budget')} fullWidth />
              <TextField
                label="Métrica Asociada*"
                select
                {...register('metric', { required: true })}
                fullWidth
                error={!Array.isArray(metrics) && !metrics ? true : !metrics || !metrics.length ? true : !watch('metric')}
                helperText={Array.isArray(metrics) || metrics ? (!metrics || !metrics.length ? 'No hay métricas disponibles' : (!watch('metric') ? 'Selecciona una métrica' : '')) : 'Error cargando métricas'}
              >
                <MenuItem value="">Ninguna</MenuItem>
                {Array.isArray(metrics) ? metrics.map(metric => (
                  <MenuItem key={metric.id} value={metric.id}>
                    {metric.name}
                  </MenuItem>
                )) : null}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} aria-label="Guardar acción">
              {isSubmitting ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Actions;
