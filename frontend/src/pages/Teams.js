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
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, People, Visibility } from '@mui/icons-material';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import InfoTooltip from '../components/InfoTooltip';

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization: '',
    is_active: true,
  });

  useEffect(() => {
    loadTeams();
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const response = await api.getOrganizations();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setOrganizations(data);
    } catch (err) {
      console.error('Error al cargar organizaciones:', err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/team/teams/');
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los equipos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description || '',
        organization: team.organization,
        is_active: team.is_active,
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        description: '',
        organization: organizations[0]?.id || '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeam(null);
    setFormData({
      name: '',
      description: '',
      organization: '',
      is_active: true,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingTeam) {
        await api.put(`/team/teams/${editingTeam.id}/`, formData);
      } else {
        await api.post('/team/teams/', formData);
      }

      await loadTeams();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar el equipo');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este equipo?')) {
      return;
    }

    try {
      await api.delete(`/team/teams/${id}/`);
      await loadTeams();
      setError(null);
    } catch (err) {
      setError('Error al eliminar el equipo');
      console.error(err);
    }
  };

  const handleToggleActive = async (team) => {
    try {
      await api.post(`/team/teams/${team.id}/toggle_active/`);
      await loadTeams();
      setError(null);
    } catch (err) {
      setError('Error al cambiar el estado del equipo');
      console.error(err);
    }
  };

  const viewMembers = (teamId) => {
    navigate(`/team/members?team=${teamId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4">Equipos de Trabajo</Typography>
          <InfoTooltip infoKey="teams" />
        </Stack>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Equipo
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        👥 <strong>¿Por qué crear equipos?</strong> Los equipos permiten organizar a las personas responsables de distintas áreas ESG. 
        Puedes asignar miembros a equipos como "Sostenibilidad", "Operaciones" o "RRHH" para distribuir responsabilidades y hacer seguimiento de quién trabaja en cada iniciativa.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Organización</TableCell>
                  <TableCell align="center">Miembros</TableCell>
                  <TableCell align="center">Activo</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No hay equipos creados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id} hover>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.description || '-'}</TableCell>
                      <TableCell>{team.organization_name}</TableCell>
                      <TableCell align="center">
                        <Chip label={team.members_count} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={team.is_active}
                          onChange={() => handleToggleActive(team)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Ver miembros">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => viewMembers(team.id)}
                            >
                              <People />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(team)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(team.id)}
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

      {/* Dialog para crear/editar equipo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTeam ? 'Editar Equipo' : 'Nuevo Equipo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Equipo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Organización</InputLabel>
                <Select
                  value={formData.organization}
                  label="Organización"
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  disabled={loadingOrgs}
                >
                  {loadingOrgs ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} /> Cargando...
                    </MenuItem>
                  ) : organizations.length === 0 ? (
                    <MenuItem disabled>No hay organizaciones disponibles</MenuItem>
                  ) : (
                    organizations.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.nombre || org.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTeam ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
