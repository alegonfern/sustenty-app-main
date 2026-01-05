import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterIcon,
  Nature as NatureIcon,
  People as PeopleIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import InfoTooltip, { InfoCard } from '../../components/InfoTooltip';

const Collection = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [emissionFactors, setEmissionFactors] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [dataCollections, setDataCollections] = useState([]);
  const [formData, setFormData] = useState({
    period: '',
    metric: '', // Factor de emisión seleccionado
    collection_date: new Date().toISOString().split('T')[0],
    quantity: '',
    uncertainty_percentage: '',
    notes: ''
  });

  // Cargar factores de emisión y períodos disponibles
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar factores de emisión
      const factorsRes = await fetch('http://localhost:8000/api/v1/esg/metrics/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (factorsRes.ok) {
        const factorsData = await factorsRes.json();
        setEmissionFactors(factorsData);
      }

      // Cargar períodos
      const periodsRes = await fetch('http://localhost:8000/api/v1/esg/periods/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (periodsRes.ok) {
        const periodsData = await periodsRes.json();
        setPeriods(periodsData);
      }

      // Cargar datos de colección
      const dataRes = await fetch('http://localhost:8000/api/v1/esg/data-collection/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (dataRes.ok) {
        const collectionsData = await dataRes.json();
        setDataCollections(collectionsData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Resetear formulario
    setFormData({
      period: '',
      metric: '',
      collection_date: new Date().toISOString().split('T')[0],
      quantity: '',
      uncertainty_percentage: '',
      notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCalculatedEmission = () => {
    if (!formData.metric || !formData.quantity) return 0;
    const factor = emissionFactors.find(f => f.id === formData.metric);
    if (!factor || !factor.emission_factor) return 0;
    return (parseFloat(formData.quantity) * parseFloat(factor.emission_factor)).toFixed(4);
  };

  const getSelectedFactor = () => {
    return emissionFactors.find(f => f.id === formData.metric);
  };

  const handleSubmit = async () => {
    try {
      const selectedFactor = getSelectedFactor();
      const token = localStorage.getItem('token');
      
      const dataToSend = {
        period: formData.period,
        metric: formData.metric,
        collection_date: formData.collection_date,
        quantity: parseFloat(formData.quantity),
        uncertainty_percentage: formData.uncertainty_percentage ? parseFloat(formData.uncertainty_percentage) : null,
        notes: formData.notes,
        status: 'completed'
      };

      const response = await fetch('http://localhost:8000/api/v1/esg/data-collection/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const newData = await response.json();
        console.log('Dato guardado:', newData);
        handleCloseDialog();
        // Recargar datos
        loadData();
      } else {
        const error = await response.json();
        console.error('Error guardando dato:', error);
        alert('Error al guardar: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    }
  };

  // Datos de ejemplo para métricas ESG
  const environmentalMetrics = [
    { id: 1, name: 'Emisiones CO2', value: '1,250 ton', period: '2024', status: 'Completado', responsible: 'Juan Pérez' },
    { id: 2, name: 'Consumo Energético', value: '45,000 kWh', period: '2024', status: 'En proceso', responsible: 'María García' },
    { id: 3, name: 'Consumo de Agua', value: '12,500 m³', period: '2024', status: 'Pendiente', responsible: 'Carlos López' },
    { id: 4, name: 'Generación de Residuos', value: '85 ton', period: '2024', status: 'Completado', responsible: 'Ana Martínez' }
  ];

  const socialMetrics = [
    { id: 1, name: 'Diversidad de Género', value: '48% F / 52% M', period: '2024', status: 'Completado', responsible: 'RRHH' },
    { id: 2, name: 'Horas de Capacitación', value: '2,400 hrs', period: '2024', status: 'En proceso', responsible: 'RRHH' },
    { id: 3, name: 'Accidentes Laborales', value: '3 incidentes', period: '2024', status: 'Completado', responsible: 'Seguridad' }
  ];

  const governanceMetrics = [
    { id: 1, name: 'Políticas de Compliance', value: '12 políticas', period: '2024', status: 'Completado', responsible: 'Legal' },
    { id: 2, name: 'Auditorías Internas', value: '4 auditorías', period: '2024', status: 'En proceso', responsible: 'Auditoría' },
    { id: 3, name: 'Capacitación en Ética', value: '95% personal', period: '2024', status: 'Completado', responsible: 'Compliance' }
  ];

  const getStatusColor = (status) => {
    const statusMap = {
      'completed': 'success',
      'approved': 'success',
      'in_progress': 'warning',
      'reviewed': 'info',
      'pending': 'error'
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'completed': 'Completado',
      'approved': 'Aprobado',
      'in_progress': 'En Proceso',
      'reviewed': 'Revisado',
      'pending': 'Pendiente'
    };
    return labelMap[status] || status;
  };

  const getCurrentMetrics = () => {
    // Filtrar por categoría según el tab activo
    const categoryMap = {
      0: 'environmental', // Ambiental
      1: 'social',        // Social
      2: 'governance'     // Gobernanza
    };
    
    const currentCategory = categoryMap[currentTab];
    
    return dataCollections
      .filter(data => {
        if (!data.metric_detail) return false;
        return data.metric_detail.category_detail?.code === currentCategory;
      })
      .map(data => ({
        id: data.id,
        name: data.metric_detail?.name || 'N/A',
        value: `${data.calculated_emission || data.quantity} ${data.metric_detail?.emission_unit || data.metric_detail?.unit || ''}`,
        period: data.period_detail?.name || 'N/A',
        status: getStatusLabel(data.status),
        statusCode: data.status,
        responsible: data.responsible_detail ? 
          `${data.responsible_detail.first_name} ${data.responsible_detail.last_name}`.trim() || data.responsible_detail.username 
          : 'Sin asignar'
      }));
  };

  const renderMetricsTable = (metrics) => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Métrica</strong></TableCell>
            <TableCell><strong>Valor</strong></TableCell>
            <TableCell><strong>Período</strong></TableCell>
            <TableCell><strong>Estado</strong></TableCell>
            <TableCell><strong>Responsable</strong></TableCell>
            <TableCell align="right"><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.id} hover>
              <TableCell>{metric.name}</TableCell>
              <TableCell><strong>{metric.value}</strong></TableCell>
              <TableCell>{metric.period}</TableCell>
              <TableCell>
                <Chip 
                  label={metric.status} 
                  color={getStatusColor(metric.statusCode)} 
                  size="small" 
                />
              </TableCell>
              <TableCell>{metric.responsible}</TableCell>
              <TableCell align="right">
                <IconButton size="small" color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" component="h1" gutterBottom>
                Colección de Datos ESG
              </Typography>
              <InfoTooltip infoKey="dataCollection" />
            </Stack>
            <Typography variant="subtitle1" color="text.secondary">
              Registra y gestiona las métricas de sostenibilidad de tu empresa para medir tu impacto real
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<FilterIcon />}>
              Filtros
            </Button>
            <Button variant="outlined" startIcon={<UploadIcon />}>
              Importar
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
              Nueva Métrica
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Información contextual para nuevos usuarios */}
      {dataCollections.length === 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={false}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🌱 ¡Bienvenido a tu centro de datos ESG!
          </Typography>
          <Typography variant="body2">
            Aquí registrarás información sobre consumos, emisiones y actividades de tu empresa. 
            Estos datos son la base para medir tu huella de carbono y demostrar tu compromiso con la sostenibilidad.
            <strong> Comienza agregando tu primera métrica.</strong>
          </Typography>
        </Alert>
      )}

      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Métricas Ambientales
                    </Typography>
                    <InfoTooltip infoKey="environmental" size={14} />
                  </Stack>
                  <Typography variant="h4" color="success.main">
                    {dataCollections.filter(d => d.metric_detail?.category_detail?.code === 'environmental').length}
                  </Typography>
                </Box>
                <NatureIcon sx={{ fontSize: 48, color: 'success.light', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Métricas Sociales
                    </Typography>
                    <InfoTooltip infoKey="social" size={14} />
                  </Stack>
                  <Typography variant="h4" color="info.main">
                    {dataCollections.filter(d => d.metric_detail?.category_detail?.code === 'social').length}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, color: 'info.light', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Métricas de Gobernanza
                    </Typography>
                    <InfoTooltip infoKey="governance" size={14} />
                  </Stack>
                  <Typography variant="h4" color="warning.main">
                    {dataCollections.filter(d => d.metric_detail?.category_detail?.code === 'governance').length}
                  </Typography>
                </Box>
                <GavelIcon sx={{ fontSize: 48, color: 'warning.light', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs por categoría ESG */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab 
            label="Ambiental (E)" 
            icon={<NatureIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Social (S)" 
            icon={<PeopleIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Gobernanza (G)" 
            icon={<GavelIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tabla de métricas */}
      <Paper>
        {renderMetricsTable(getCurrentMetrics())}
      </Paper>

      {/* Diálogo para Registrar Nueva Métrica (Dato ESG) */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Registrar Dato ESG</Typography>
            {formData.metric && formData.quantity && (
              <Chip 
                label={`${getCalculatedEmission()} ${getSelectedFactor()?.emission_unit || 'kgCO₂e'}`}
                color="success" 
                size="large"
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Período ESG</InputLabel>
                  <Select
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    label="Período ESG"
                  >
                    {periods.map((period) => (
                      <MenuItem key={period.id} value={period.id}>
                        {period.name} ({period.start_date} - {period.end_date})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha"
                  name="collection_date"
                  value={formData.collection_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Factor de Emisión</InputLabel>
                  <Select
                    name="metric"
                    value={formData.metric}
                    onChange={handleInputChange}
                    label="Factor de Emisión"
                  >
                    {emissionFactors.map((factor) => (
                      <MenuItem key={factor.id} value={factor.id}>
                        <Box>
                          <Typography variant="body1">{factor.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {factor.scope_detail?.name || `Scope ${factor.scope}`} - {factor.emission_factor} {factor.emission_unit}/{factor.unit}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cantidad"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ step: '0.01', min: 0 }}
                  helperText={formData.metric ? `Unidad: ${getSelectedFactor()?.unit || ''}` : ''}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Incertidumbre (%)"
                  name="uncertainty_percentage"
                  value={formData.uncertainty_percentage}
                  onChange={handleInputChange}
                  inputProps={{ step: '0.1', min: 0, max: 100 }}
                  placeholder="0%"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Nota"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Observaciones adicionales sobre este registro..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.period || !formData.metric || !formData.quantity || !formData.collection_date}
          >
            Guardar Registro
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Collection;
