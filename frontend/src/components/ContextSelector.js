import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Refresh, Settings, Business, Add } from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ContextSelector() {
  const {
    selectedOrganization,
    selectedPeriod,
    organizations,
    periods,
    changeOrganization,
    changePeriod,
    refreshOrganizations,
    refreshPeriods,
  } = useApp();

  const navigate = useNavigate();
  const [showNoOrgDialog, setShowNoOrgDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshOrganizations(), refreshPeriods()]);
      toast.success('Datos actualizados');
    } catch (err) {
      console.error('Error refrescando:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Mostrar diálogo solo si no hay organizaciones y ya se cargaron
    if (organizations.length === 0 && !selectedOrganization) {
      const timer = setTimeout(() => {
        setShowNoOrgDialog(true);
      }, 1000); // Esperar 1 segundo para evitar mostrar en carga inicial
      return () => clearTimeout(timer);
    }
  }, [organizations, selectedOrganization]);

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mr: 2 }}>
      {/* Selector de Organización */}
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Organización</InputLabel>
        <Select
          value={selectedOrganization?.id || ''}
          label="Organización"
          onChange={(e) => {
            const org = organizations.find(o => o.id === e.target.value);
            if (org) changeOrganization(org);
          }}
        >
          {organizations.length === 0 && (
            <MenuItem disabled>
              <em>No hay organizaciones</em>
            </MenuItem>
          )}
          {organizations.map((org) => (
            <MenuItem key={org.id} value={org.id}>
              {org.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip title="Gestionar organizaciones">
        <IconButton
          size="small"
          onClick={() => navigate('/organizations')}
          color="primary"
        >
          <Settings fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Selector de Período */}
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Período</InputLabel>
        <Select
          value={selectedPeriod?.id || ''}
          label="Período"
          onChange={(e) => {
            const period = periods.find(p => p.id === e.target.value);
            if (period) changePeriod(period);
          }}
          disabled={!selectedOrganization}
        >
          {periods.length === 0 && (
            <MenuItem disabled>
              <em>No hay períodos</em>
            </MenuItem>
          )}
          {periods.map((period) => (
            <MenuItem key={period.id} value={period.id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{period.name}</span>
                {period.is_active && (
                  <Chip label="Activo" color="success" size="small" />
                )}
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip title="Gestionar períodos">
        <IconButton
          size="small"
          onClick={() => navigate('/esg/periods')}
          color="primary"
          disabled={!selectedOrganization}
        >
          <Settings fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Recargar datos">
        <IconButton
          size="small"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <CircularProgress size={18} />
          ) : (
            <Refresh fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      {!selectedOrganization && organizations.length > 0 && (
        <Alert severity="info" sx={{ py: 0, px: 2 }}>
          <Typography variant="caption">
            Selecciona una organización para comenzar
          </Typography>
        </Alert>
      )}
      {selectedOrganization && !selectedPeriod && (
        <Alert severity="warning" sx={{ py: 0, px: 2 }}>
          <Typography variant="caption">
            Selecciona un período
          </Typography>
        </Alert>
      )}

      {/* Diálogo cuando no hay organizaciones */}
      <Dialog 
        open={showNoOrgDialog} 
        onClose={() => setShowNoOrgDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business color="primary" />
          Crea tu primera organización
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Para comenzar a usar Sustenty, primero necesitas crear una organización.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Una organización te permite gestionar tus datos ESG, períodos de reporte, 
            equipos y más. Puedes crear múltiples organizaciones si gestionas diferentes empresas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNoOrgDialog(false)}>
            Ahora no
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => {
              setShowNoOrgDialog(false);
              navigate('/organizations');
            }}
          >
            Crear organización
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
