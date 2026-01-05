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
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, Cancel, Lock, LockOpen } from '@mui/icons-material';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function Periods() {
  const { selectedOrganization, refreshPeriods } = useApp();
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: false,
  });

  useEffect(() => {
    if (selectedOrganization) {
      loadPeriods();
    }
  }, [selectedOrganization]);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      const response = await api.getESGPeriods();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      // Filtrar por organización seleccionada
      const orgPeriods = data.filter(p => p.organization === selectedOrganization?.id);
      setPeriods(orgPeriods);
      setError(null);
    } catch (err) {
      setError('Error al cargar los períodos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (period = null) => {
    if (period) {
      setEditingPeriod(period);
      setFormData({
        name: period.name,
        description: period.description || '',
        start_date: period.start_date,
        end_date: period.end_date,
        is_active: period.is_active,
      });
    } else {
      setEditingPeriod(null);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPeriod(null);
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      is_active: false,
    });
  };

  const handleSubmit = async () => {
    if (!selectedOrganization) {
      setError('Debes seleccionar una organización primero');
      return;
    }

    try {
      const payload = {
        ...formData,
        organization: selectedOrganization.id,
      };

      if (editingPeriod) {
        await api.put(`/esg/periods/${editingPeriod.id}/`, payload);
      } else {
        await api.post('/esg/periods/', payload);
      }

      await loadPeriods();
      refreshPeriods(); // Actualizar el contexto global
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar el período');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este período?')) {
      return;
    }

    try {
      await api.delete(`/esg/periods/${id}/`);
      await loadPeriods();
      refreshPeriods();
      setError(null);
    } catch (err) {
      setError('Error al eliminar el período');
      console.error(err);
    }
  };

  const handleToggleActive = async (period) => {
    try {
      await api.patch(`/esg/periods/${period.id}/`, {
        is_active: !period.is_active
      });
      await loadPeriods();
      refreshPeriods();
      setError(null);
    } catch (err) {
      setError('Error al cambiar el estado del período');
      console.error(err);
    }
  };

  const handleToggleClosed = async (period) => {
    if (!period.is_closed) {
      if (!window.confirm('¿Estás seguro de cerrar este período? Esta acción afectará los registros asociados.')) {
        return;
      }
    }

    try {
      await api.patch(`/esg/periods/${period.id}/`, {
        is_closed: !period.is_closed,
        is_active: period.is_closed ? period.is_active : false // Si se cierra, desactivar
      });
      await loadPeriods();
      refreshPeriods();
      setError(null);
    } catch (err) {
      setError('Error al cambiar el estado de cierre del período');
      console.error(err);
    }
  };

  if (!selectedOrganization) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Por favor selecciona una organización primero para gestionar sus períodos.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Períodos ESG</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Período
        </Button>
      </Stack>

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
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Cerrado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No hay períodos creados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => (
                    <TableRow key={period.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>{period.name}</Typography>
                          {period.is_closed && (
                            <Chip label="Cerrado" size="small" color="warning" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{period.description || '-'}</TableCell>
                      <TableCell>{period.start_date}</TableCell>
                      <TableCell>{period.end_date}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={period.is_active ? 'Desactivar período' : 'Activar período'}>
                          <Switch
                            checked={period.is_active}
                            onChange={() => handleToggleActive(period)}
                            color="success"
                            disabled={period.is_closed}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={period.is_closed ? 'Reabrir período' : 'Cerrar período'}>
                          <IconButton
                            size="small"
                            color={period.is_closed ? 'warning' : 'default'}
                            onClick={() => handleToggleClosed(period)}
                          >
                            {period.is_closed ? <Lock /> : <LockOpen />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(period)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(period.id)}
                              disabled={period.is_active}
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

      {/* Dialog para crear/editar período */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPeriod ? 'Editar Período' : 'Nuevo Período'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha Fin"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPeriod ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
