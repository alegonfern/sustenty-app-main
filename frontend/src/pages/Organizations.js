import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import {
  Business,
  Edit,
  Delete,
  Add,
  People,
  Category,
  Settings as SettingsIcon,
  Close
} from '@mui/icons-material';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import CreateOrganizationModal from '../components/CreateOrganizationModal';

const SECTOR_MAP = {
  manufactura: 'Manufactura',
  tecnologia: 'Tecnología/Software',
  retail: 'Retail/Comercio',
  servicios: 'Servicios profesionales',
  alimentos: 'Alimentos y bebidas',
  construccion: 'Construcción',
  logistica: 'Logística/Transporte',
  energia: 'Energía',
  turismo: 'Turismo/Hospitalidad'
};

const MODO_MAP = {
  cumplimiento: 'Cumplimiento',
  accion: 'Acción',
  liderazgo: 'Liderazgo'
};

export default function Organizations() {
  const location = useLocation();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [viewingOrg, setViewingOrg] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.getOrganizations();
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error al cargar organizaciones:', error);
      toast.error('Error al cargar las organizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [location]);

  const handleCreateOrganization = async (data) => {
    try {
      if (editingOrg) {
        // Actualizar organización existente
        await api.updateOrganization(editingOrg.id, data);
        toast.success('¡Organización actualizada exitosamente!');
      } else {
        // Crear nueva organización
        await api.createOrganization(data);
        toast.success('¡Organización creada exitosamente!');
      }
      setOpenModal(false);
      setEditingOrg(null);
      fetchOrganizations();
    } catch (error) {
      console.error('Error al guardar organización:', error);
      toast.error('Error al guardar la organización');
    }
  };

  const handleEditClick = (org) => {
    setEditingOrg(org);
    setOpenModal(true);
  };

  const handleViewClick = (org) => {
    setViewingOrg(org);
  };

  const handleCloseView = () => {
    setViewingOrg(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingOrg(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteOrganization(deleteDialog.id);
      toast.success('Organización eliminada exitosamente');
      setDeleteDialog({ open: false, id: null });
      fetchOrganizations();
    } catch (error) {
      console.error('Error al eliminar organización:', error);
      toast.error('Error al eliminar la organización');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Cargando organizaciones...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Mis Organizaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona todas tus organizaciones en un solo lugar
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          size="large"
        >
          Nueva Organización
        </Button>
      </Stack>

      {organizations.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No tienes organizaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea tu primera organización para comenzar
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenModal(true)}
          >
            Crear Organización
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {organizations.map((org) => (
            <Grid item xs={12} md={6} lg={4} key={org.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Business color="primary" sx={{ fontSize: 40 }} />
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" color="primary" onClick={() => handleEditClick(org)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(org.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {org.nombre}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {org.rol}
                  </Typography>

                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2">{org.empleados} empleados</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="body2">{SECTOR_MAP[org.sector] || org.sector}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SettingsIcon fontSize="small" color="action" />
                      <Chip 
                        label={MODO_MAP[org.modo] || org.modo} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      RUT: {org.rut}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" fullWidth variant="outlined" onClick={() => handleViewClick(org)}>
                    Ver Detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de creación/edición */}
      <CreateOrganizationModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateOrganization}
        initialData={editingOrg}
        isEditing={!!editingOrg}
      />

      {/* Modal de ver detalles */}
      <Dialog
        open={!!viewingOrg}
        onClose={handleCloseView}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Detalles de la Organización
            </Typography>
            <IconButton onClick={handleCloseView}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {viewingOrg && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nombre de la Organización
                </Typography>
                <Typography variant="h6">{viewingOrg.nombre}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rol en la empresa
                </Typography>
                <Typography variant="body1">{viewingOrg.rol}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Cantidad de empleados
                </Typography>
                <Typography variant="body1">{viewingOrg.empleados} empleados</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  RUT
                </Typography>
                <Typography variant="body1">{viewingOrg.rut}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Sector/Industria
                </Typography>
                <Typography variant="body1">{SECTOR_MAP[viewingOrg.sector] || viewingOrg.sector}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Modo de operación
                </Typography>
                <Chip 
                  label={MODO_MAP[viewingOrg.modo] || viewingOrg.modo}
                  color="primary"
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Fecha de creación
                </Typography>
                <Typography variant="body2">
                  {new Date(viewingOrg.created_at).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Cerrar</Button>
          <Button 
            variant="contained" 
            startIcon={<Edit />}
            onClick={() => {
              handleCloseView();
              handleEditClick(viewingOrg);
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>¿Eliminar organización?</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta organización?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
