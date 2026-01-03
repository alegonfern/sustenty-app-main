import { useEffect, useState } from 'react';
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
  Settings as SettingsIcon
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
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
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
  }, []);

  const handleCreateOrganization = async (data) => {
    try {
      await api.createOrganization(data);
      toast.success('¡Organización creada exitosamente!');
      setOpenModal(false);
      fetchOrganizations();
    } catch (error) {
      console.error('Error al crear organización:', error);
      toast.error('Error al crear la organización');
    }
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
                      <IconButton size="small" color="primary">
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
                  <Button size="small" fullWidth variant="outlined">
                    Ver Detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de creación */}
      <CreateOrganizationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateOrganization}
      />

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
