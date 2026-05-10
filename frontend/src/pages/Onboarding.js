import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Building2,
  Pencil,
  Plus,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import { useApp } from '../context/AppContext';

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

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshOrganizations } = useApp();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await api.getOrganizations();
      setOrganizations(res.data);
    } catch {
      toast.error('Error al cargar organizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleOpenEdit = (org) => {
    setEditingOrg(org);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingOrg(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingOrg(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingOrg) {
        await api.updateOrganization(editingOrg.id, data);
        toast.success('¡Organización actualizada!');
      } else {
        await api.createOrganization(data);
        toast.success('¡Organización creada!');
      }
      handleCloseModal();
      fetchOrgs();
      refreshOrganizations();
    } catch (error) {
      if (error.response?.data && typeof error.response.data === 'object') {
        Object.entries(error.response.data).forEach(([field, msg]) => {
          toast.error(`${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
        });
      } else {
        toast.error('Error al guardar la organización');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: 4, px: 2 }}>
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 5 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
          Configuración inicial
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2e29' }}>
          Tu organización
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Revisa o actualiza los datos de tu empresa. Puedes editar lo que configuraste anteriormente o crear una nueva organización.
        </Typography>
      </Stack>

      {/* Lista de organizaciones existentes */}
      {organizations.length > 0 ? (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {organizations.map((org) => (
            <Card
              key={org.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                border: '1.5px solid',
                borderColor: 'divider',
                '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                transition: 'all 0.2s'
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Building2 size={24} color="#10b981" />
                    </Box>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {org.nombre}
                        </Typography>
                        <CheckCircle2 size={16} color="#10b981" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {org.rol}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    startIcon={<Pencil size={16} />}
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenEdit(org)}
                    sx={{ flexShrink: 0, borderRadius: 1.5 }}
                  >
                    Editar
                  </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Chip label={`${org.empleados} empleados`} size="small" variant="outlined" />
                  <Chip label={SECTOR_MAP[org.sector] || org.sector} size="small" variant="outlined" />
                  <Chip label={MODO_MAP[org.modo] || org.modo} size="small" color="primary" variant="outlined" />
                  {org.rut && (
                    <Chip label={`RUT: ${org.rut}`} size="small" variant="outlined" />
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider',
            textAlign: 'center',
            py: 6,
            mb: 4
          }}
        >
          <Building2 size={48} color="#9ca3af" style={{ marginBottom: 12 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No tienes organizaciones creadas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea tu primera empresa para comenzar
          </Typography>
        </Card>
      )}

      {/* Acciones */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="outlined"
          startIcon={<Plus size={18} />}
          onClick={handleOpenCreate}
          size="large"
          sx={{ borderRadius: 2 }}
        >
          Crear otra empresa
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="text"
          endIcon={<ArrowRight size={18} />}
          onClick={() => navigate('/app/organizations')}
          size="large"
          sx={{ color: 'text.secondary' }}
        >
          Gestionar en Organizaciones
        </Button>
      </Stack>

      {/* Modal */}
      <CreateOrganizationModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingOrg}
        isEditing={!!editingOrg}
      />
    </Box>
  );
}
