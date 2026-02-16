import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterIcon,
  Co2 as Co2Icon
} from '@mui/icons-material';
import InfoTooltip from '../../components/InfoTooltip';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

const Collection = () => {
  const { selectedOrganization, selectedPeriod } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [emissionFactors, setEmissionFactors] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [dataEntries, setDataEntries] = useState([]);
  const [formData, setFormData] = useState({
    period: '',
    factor: '',
    collection_date: new Date().toISOString().split('T')[0],
    quantity: '',
    uncertainty_percentage: '',
    notes: ''
  });
  const [formError, setFormError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedOrganization, selectedPeriod]);

  const loadData = async () => {
    try {
      const [factorsRes, periodsRes, dataRes] = await Promise.all([
        api.getCarbonFactors(),
        api.getCarbonPeriods(),
        api.getCarbonData()
      ]);

      setEmissionFactors(Array.isArray(factorsRes.data) ? factorsRes.data : factorsRes.data.results || []);
      setPeriods(Array.isArray(periodsRes.data) ? periodsRes.data : periodsRes.data.results || []);
      setDataEntries(Array.isArray(dataRes.data) ? dataRes.data : dataRes.data.results || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData(prev => ({
      ...prev,
      period: selectedPeriod?.id || ''
    }));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      period: '',
      factor: '',
      collection_date: new Date().toISOString().split('T')[0],
      quantity: '',
      uncertainty_percentage: '',
      notes: ''
    });
    setFormError({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getCalculatedEmission = () => {
    if (!formData.factor || !formData.quantity) return 0;
    const factor = emissionFactors.find(f => f.id === formData.factor);
    if (!factor || !factor.emission_factor) return 0;
    return (parseFloat(formData.quantity) * parseFloat(factor.emission_factor)).toFixed(4);
  };

  const getSelectedFactor = () => {
    return emissionFactors.find(f => f.id === formData.factor);
  };

  const handleSubmit = async () => {
    let errors = {};
    if (!formData.period) errors.period = 'El período es obligatorio';
    if (!formData.factor) errors.factor = 'El factor de emisión es obligatorio';
    if (!formData.collection_date) errors.collection_date = 'La fecha es obligatoria';
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) errors.quantity = 'La cantidad debe ser mayor a 0';
    setFormError(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      const dataToSend = {
        period: formData.period,
        factor: formData.factor,
        collection_date: formData.collection_date,
        quantity: parseFloat(formData.quantity),
        uncertainty_percentage: formData.uncertainty_percentage ? parseFloat(formData.uncertainty_percentage) : null,
        notes: formData.notes,
        status: 'completed',
        organization: selectedOrganization?.id
      };

      await api.post('/carbon/data/', dataToSend);
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error guardando dato:', error);
      alert('Error al guardar: ' + JSON.stringify(error.response?.data || error.message));
    } finally {
      setSubmitting(false);
    }
  };

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

  // Agrupar por scope para tarjetas de resumen
  const scope1Count = dataEntries.filter(d => d.factor_detail?.scope_detail?.code === 'scope_1').length;
  const scope2Count = dataEntries.filter(d => d.factor_detail?.scope_detail?.code === 'scope_2').length;
  const scope3Count = dataEntries.filter(d => d.factor_detail?.scope_detail?.code === 'scope_3').length;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" component="h1" gutterBottom>
                Registro de Emisiones
              </Typography>
              <InfoTooltip infoKey="dataCollection" />
            </Stack>
            <Typography variant="subtitle1" color="text.secondary">
              Registra y gestiona los datos de consumo y emisiones de tu organización
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
              Nuevo Registro
            </Button>
          </Stack>
        </Stack>
      </Box>

      {dataEntries.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }} icon={false}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🌱 ¡Bienvenido al registro de emisiones!
          </Typography>
          <Typography variant="body2">
            Aquí registrarás los consumos y actividades de tu empresa para calcular tu huella de carbono.
            Cada registro se asocia a un factor de emisión que convierte automáticamente la cantidad en emisiones de CO₂e.
            <strong> Comienza agregando tu primer registro.</strong>
          </Typography>
        </Alert>
      )}

      {/* Tarjetas de resumen por Scope */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Scope 1 - Directas
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {scope1Count}
                  </Typography>
                </Box>
                <Co2Icon sx={{ fontSize: 48, color: 'error.light', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Scope 2 - Energía
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {scope2Count}
                  </Typography>
                </Box>
                <Co2Icon sx={{ fontSize: 48, color: 'warning.light', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Scope 3 - Indirectas
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {scope3Count}
                  </Typography>
                </Box>
                <Co2Icon sx={{ fontSize: 48, color: 'info.light', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de registros */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Factor de Emisión</strong></TableCell>
                <TableCell><strong>Scope</strong></TableCell>
                <TableCell><strong>Cantidad</strong></TableCell>
                <TableCell><strong>Emisión Calculada</strong></TableCell>
                <TableCell><strong>Período</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Responsable</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataEntries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{entry.factor_detail?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.factor_detail?.scope_detail?.name || 'N/A'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <strong>{entry.quantity}</strong> {entry.factor_detail?.unit || ''}
                  </TableCell>
                  <TableCell>
                    <strong>{entry.calculated_emission}</strong> {entry.factor_detail?.emission_unit || 'kgCO₂e'}
                  </TableCell>
                  <TableCell>{entry.period_detail?.name || 'N/A'}</TableCell>
                  <TableCell>{entry.collection_date}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(entry.status)}
                      color={getStatusColor(entry.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {entry.responsible_detail ?
                      `${entry.responsible_detail.first_name} ${entry.responsible_detail.last_name}`.trim() || entry.responsible_detail.username
                      : 'Sin asignar'}
                  </TableCell>
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
      </Paper>

      {/* Diálogo para Nuevo Registro */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Registrar Dato de Emisión</Typography>
            {formData.factor && formData.quantity && (
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
                <FormControl fullWidth required error={!!formError.period}>
                  <InputLabel>Período</InputLabel>
                  <Select
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    label="Período"
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
                  label="Fecha*"
                  name="collection_date"
                  value={formData.collection_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!formError.collection_date}
                  helperText={formError.collection_date}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required error={!!formError.factor}>
                  <InputLabel>Factor de Emisión*</InputLabel>
                  <Select
                    name="factor"
                    value={formData.factor}
                    onChange={handleInputChange}
                    label="Factor de Emisión*"
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
                  {formError.factor && <Typography color="error" variant="caption">{formError.factor}</Typography>}
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
                  helperText={formData.factor ? `Unidad: ${getSelectedFactor()?.unit || ''}` : ''}
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
            disabled={!formData.period || !formData.factor || !formData.quantity || !formData.collection_date || submitting}
          >
            {submitting ? 'Guardando...' : 'Guardar Registro'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Collection;
