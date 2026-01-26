import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const NOTIFICATION_LEVELS = [
  { value: 'all', label: 'Todo' },
  { value: 'relevant', label: 'Relevante' },
  { value: 'emergency', label: 'Emergencia' },
];

export default function TeamMembers() {
  const { organizations } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamFilter = searchParams.get('team');

  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    organization: '',
    team: '',
    notification_level: 'relevant',
    is_active: true,
  });

  useEffect(() => {
    loadMembers();
    loadTeams();
  }, [teamFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      let url = '/team/members/';
      if (teamFilter) {
        url += `?team=${teamFilter}`;
      }
      const response = await api.get(url);
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los miembros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await api.get('/team/teams/');
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setTeams(data);
    } catch (err) {
      console.error('Error al cargar equipos:', err);
    }
  };

  const handleOpenDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        position: member.position,
        email: member.email,
        organization: member.organization,
        team: member.team,
        notification_level: member.notification_level,
        is_active: member.is_active,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        position: '',
        email: '',
        organization: organizations[0]?.id || '',
        team: teamFilter || '',
        notification_level: 'relevant',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMember(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingMember) {
        await api.put(`/team/members/${editingMember.id}/`, formData);
      } else {
        await api.post('/team/members/', formData);
      }

      await loadMembers();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data;
      if (typeof errorMsg === 'object') {
        const errors = Object.entries(errorMsg).map(([key, value]) => 
          `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
        ).join('\n');
        setError(errors);
      } else {
        setError('Error al guardar el miembro');
      }
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este miembro?')) {
      return;
    }

    try {
      await api.delete(`/team/members/${id}/`);
      await loadMembers();
      setError(null);
    } catch (err) {
      setError('Error al eliminar el miembro');
      console.error(err);
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await api.post(`/team/members/${member.id}/toggle_active/`);
      await loadMembers();
      setError(null);
    } catch (err) {
      setError('Error al cambiar el estado del miembro');
      console.error(err);
    }
  };

  const getNotificationColor = (level) => {
    switch (level) {
      case 'all':
        return 'info';
      case 'relevant':
        return 'warning';
      case 'emergency':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          {teamFilter && (
            <IconButton onClick={() => navigate('/team/teams')}>
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h4">Miembros del Equipo</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Miembro
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell>Organización</TableCell>
                  <TableCell align="center">Notificaciones</TableCell>
                  <TableCell align="center">Activo</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No hay miembros registrados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.team_name}</TableCell>
                      <TableCell>{member.organization_name}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={member.notification_level_display}
                          size="small"
                          color={getNotificationColor(member.notification_level)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={member.is_active}
                          onChange={() => handleToggleActive(member)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(member)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar miembro */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cargo"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Organización</InputLabel>
                <Select
                  value={formData.organization}
                  label="Organización"
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                >
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Equipo</InputLabel>
                <Select
                  value={formData.team}
                  label="Equipo"
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                >
                  {teams
                    .filter(t => t.organization === formData.organization)
                    .map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Nivel de Notificación</InputLabel>
                <Select
                  value={formData.notification_level}
                  label="Nivel de Notificación"
                  onChange={(e) => setFormData({ ...formData, notification_level: e.target.value })}
                >
                  {NOTIFICATION_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMember ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
