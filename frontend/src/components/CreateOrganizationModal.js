import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  LinearProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Close, ArrowBack, ArrowForward, Check } from '@mui/icons-material';

const SECTORS = [
  { value: 'manufactura', label: 'Manufactura' },
  { value: 'tecnologia', label: 'Tecnología/Software' },
  { value: 'retail', label: 'Retail/Comercio' },
  { value: 'servicios', label: 'Servicios profesionales' },
  { value: 'alimentos', label: 'Alimentos y bebidas' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'logistica', label: 'Logística/Transporte' },
  { value: 'energia', label: 'Energía' },
  { value: 'turismo', label: 'Turismo/Hospitalidad' }
];

const MODES = [
  { value: 'cumplimiento', label: 'Cumplimiento', description: 'Enfocado en normativas y regulaciones' },
  { value: 'accion', label: 'Acción', description: 'Orientado a resultados y ejecución' },
  { value: 'liderazgo', label: 'Liderazgo', description: 'Centrado en gestión y desarrollo de equipos' }
];

const EMPLOYEE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  'Más de 1000'
];

export default function CreateOrganizationModal({ open, onClose, onSubmit, initialData = null, isEditing = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    empleados: '',
    rut: '',
    sector: '',
    modo: ''
  });

  // Cargar datos iniciales cuando se abre en modo edición
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        rol: initialData.rol || '',
        empleados: initialData.empleados || '',
        rut: initialData.rut || '',
        sector: initialData.sector || '',
        modo: initialData.modo || ''
      });
    }
  }, [open, initialData]);

  const steps = [
    'Información Básica',
    'Detalles de la Empresa',
    'Configuración'
  ];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({
      nombre: '',
      rol: '',
      empleados: '',
      rut: '',
      sector: '',
      modo: ''
    });
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.nombre && formData.rol;
      case 1:
        return formData.empleados && formData.rut && formData.sector;
      case 2:
        return formData.modo;
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                ¿Cómo se llama tu organización?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Este será el nombre principal de tu empresa en la plataforma
              </Typography>
              <TextField
                fullWidth
                placeholder="Ej: Mi Empresa S.A."
                value={formData.nombre}
                onChange={handleChange('nombre')}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.2rem'
                  }
                }}
              />
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                ¿Cuál es tu rol?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tu posición dentro de la organización
              </Typography>
              <TextField
                fullWidth
                placeholder="Ej: Gerente General, CEO, Director de Operaciones"
                value={formData.rol}
                onChange={handleChange('rol')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.2rem'
                  }
                }}
              />
            </Box>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                ¿Cuántos empleados tiene tu organización?
              </Typography>
              <TextField
                select
                fullWidth
                value={formData.empleados}
                onChange={handleChange('empleados')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.2rem'
                  }
                }}
              >
                {EMPLOYEE_RANGES.map((range) => (
                  <MenuItem key={range} value={range}>
                    {range} empleados
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                RUT de la empresa
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Identificador tributario de tu organización
              </Typography>
              <TextField
                fullWidth
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={handleChange('rut')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.2rem'
                  }
                }}
              />
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                ¿A qué sector pertenece?
              </Typography>
              <TextField
                select
                fullWidth
                value={formData.sector}
                onChange={handleChange('sector')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.2rem'
                  }
                }}
              >
                {SECTORS.map((sector) => (
                  <MenuItem key={sector.value} value={sector.value}>
                    {sector.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Selecciona el modo de operación
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Define cómo quieres gestionar tu organización
              </Typography>

              <Stack spacing={2}>
                {MODES.map((mode) => (
                  <Box
                    key={mode.value}
                    onClick={() => setFormData({ ...formData, modo: mode.value })}
                    sx={{
                      p: 3,
                      border: 2,
                      borderColor: formData.modo === mode.value ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: formData.modo === mode.value ? 'primary.lighter' : 'transparent',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.lighter'
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {mode.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mode.description}
                        </Typography>
                      </Box>
                      {formData.modo === mode.value && (
                        <Check color="primary" sx={{ fontSize: 28 }} />
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '60vh'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: '3px 3px 0 0'
          }}
        />

        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 16,
            color: 'grey.500'
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 3, sm: 5 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {isEditing ? 'Editar Organización' : 'Nueva Organización'}
          </Typography>
          <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {renderStepContent()}

        <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
          {currentStep > 0 && (
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              variant="outlined"
              size="large"
            >
              Atrás
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button
            endIcon={currentStep === 2 ? <Check /> : <ArrowForward />}
            onClick={handleNext}
            variant="contained"
            size="large"
            disabled={!isStepValid()}
            sx={{ minWidth: 120 }}
          >
            {currentStep === 2 ? (isEditing ? 'Actualizar' : 'Crear') : 'Siguiente'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

CreateOrganizationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isEditing: PropTypes.bool
};
