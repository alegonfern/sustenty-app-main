import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Chip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
  Layers as LayersIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import InfoTooltip from '../../components/InfoTooltip';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`config-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CarbonConfig = () => {
  const { selectedOrganization, refreshPeriods } = useApp();
  const [currentTab, setCurrentTab] = useState(0);

  // Estados para Factores de Emisión
  const [factors, setFactors] = useState([]);
  const [openFactorDialog, setOpenFactorDialog] = useState(false);
  const [factorFormData, setFactorFormData] = useState({
    name: '',
    code: '',
    description: '',
    scope: '',
    unit: 'kg',
    emission_factor: '',
    emission_unit: 'kgCO₂e',
    source: '',
    is_active: true
  });

  // Estados para Scopes
  const [scopes, setScopes] = useState([]);

  // Estados para Períodos
  const [periods, setPeriods] = useState([]);
  const [openPeriodDialog, setOpenPeriodDialog] = useState(false);
  const [periodFormData, setPeriodFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, [selectedOrganization]);

  const loadData = async () => {
    try {
      const [scopesRes, factorsRes, periodsRes] = await Promise.all([
        api.getCarbonScopes(),
        api.getCarbonFactors(),
        api.getCarbonPeriods()
      ]);

      setScopes(Array.isArray(scopesRes.data) ? scopesRes.data : scopesRes.data.results || []);
      setFactors(Array.isArray(factorsRes.data) ? factorsRes.data : factorsRes.data.results || []);

      const periodsData = Array.isArray(periodsRes.data) ? periodsRes.data : periodsRes.data.results || [];
      const orgPeriods = selectedOrganization
        ? periodsData.filter(p => p.organization === selectedOrganization.id)
        : periodsData;
      setPeriods(orgPeriods);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // ==================== FACTORES DE EMISIÓN ====================

  const handleOpenFactorDialog = () => {
    setFactorFormData({
      name: '', code: '', description: '', scope: '',
      unit: 'kg', emission_factor: '', emission_unit: 'kgCO₂e',
      source: '', is_active: true
    });
    setOpenFactorDialog(true);
  };

  const handleFactorInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFactorFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFactorSubmit = async () => {
    try {
      const dataToSend = {
        ...factorFormData,
        organization: selectedOrganization?.id
      };
      await api.post('/carbon/factors/', dataToSend);
      setOpenFactorDialog(false);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el factor: ' + JSON.stringify(error.response?.data || error.message));
    }
  };

  const handleDeleteFactor = async (id) => {
    if (!window.confirm('¿Eliminar este factor de emisión?')) return;
    try {
      await api.delete(`/carbon/factors/${id}/`);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ==================== PERÍODOS ====================

  const handleOpenPeriodDialog = () => {
    setPeriodFormData({ name: '', description: '', start_date: '', end_date: '', is_active: true });
    setOpenPeriodDialog(true);
  };

  const handlePeriodInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPeriodFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePeriodSubmit = async () => {
    try {
      const payload = {
        ...periodFormData,
        organization: selectedOrganization?.id
      };
      await api.post('/carbon/periods/', payload);
      setOpenPeriodDialog(false);
      loadData();
      refreshPeriods();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el período: ' + JSON.stringify(error.response?.data || error.message));
    }
  };

  const handleDeletePeriod = async (id) => {
    if (!window.confirm('¿Eliminar este período?')) return;
    try {
      await api.delete(`/carbon/periods/${id}/`);
      loadData();
      refreshPeriods();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Helpers
  const getScopeName = (scopeId) => {
    const scope = scopes.find(s => s.id === scopeId);
    return scope ? scope.name : 'N/A';
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h4" component="h1">
            Configuración de Huella de Carbono
          </Typography>
          <InfoTooltip infoKey="esg" />
        </Stack>
        <Typography variant="subtitle1" color="text.secondary">
          Gestiona los factores de emisión, scopes y períodos de medición
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 <strong>¿Nuevo en huella de carbono?</strong> Los <strong>factores de emisión</strong> convierten tus actividades en emisiones de CO₂e,
        los <strong>scopes</strong> clasifican las fuentes (Scope 1: directas, Scope 2: energía, Scope 3: cadena de valor),
        y los <strong>períodos</strong> definen los rangos de tiempo para tus reportes.
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ScienceIcon />} label="Factores de Emisión" iconPosition="start" />
          <Tab icon={<LayersIcon />} label="Scopes" iconPosition="start" />
          <Tab icon={<CalendarIcon />} label="Períodos" iconPosition="start" />
        </Tabs>

        {/* TAB: Factores de Emisión */}
        <TabPanel value={currentTab} index={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Factores de Emisión ({factors.length})</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenFactorDialog}>
              Nuevo Factor
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell align="center">Factor</TableCell>
                  <TableCell align="center">Unidad</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {factors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No hay factores de emisión configurados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  factors.map((factor) => (
                    <TableRow key={factor.id} hover>
                      <TableCell><Chip label={factor.code} size="small" variant="outlined" /></TableCell>
                      <TableCell>{factor.name}</TableCell>
                      <TableCell>
                        <Chip label={getScopeName(factor.scope)} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">{factor.emission_factor} {factor.emission_unit}</TableCell>
                      <TableCell align="center">{factor.unit}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={factor.is_active ? 'Activo' : 'Inactivo'}
                          color={factor.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDeleteFactor(factor.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TAB: Scopes */}
        <TabPanel value={currentTab} index={1}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Los Scopes clasifican las emisiones según su origen: <strong>Scope 1</strong> (emisiones directas),
            <strong> Scope 2</strong> (electricidad), <strong>Scope 3</strong> (cadena de valor).
            Esta clasificación sigue el estándar GHG Protocol. Los scopes se crean automáticamente.
          </Alert>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="center">Factores</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scopes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No hay scopes configurados. Ejecuta la carga inicial de datos.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  scopes.map((scope) => (
                    <TableRow key={scope.id} hover>
                      <TableCell><Chip label={scope.code} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell><strong>{scope.name}</strong></TableCell>
                      <TableCell>{scope.description || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip label={scope.factors_count || 0} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={scope.is_active ? 'Activo' : 'Inactivo'}
                          color={scope.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TAB: Períodos */}
        <TabPanel value={currentTab} index={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Períodos de Medición ({periods.length})</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenPeriodDialog}>
              Nuevo Período
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No hay períodos configurados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => (
                    <TableRow key={period.id} hover>
                      <TableCell>{period.name}</TableCell>
                      <TableCell>{period.description || '-'}</TableCell>
                      <TableCell>{period.start_date}</TableCell>
                      <TableCell>{period.end_date}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={period.is_active ? 'Activo' : 'Inactivo'}
                          color={period.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDeletePeriod(period.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* ==================== DIÁLOGOS ==================== */}

      {/* Diálogo: Nuevo Factor de Emisión */}
      <Dialog open={openFactorDialog} onClose={() => setOpenFactorDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ScienceIcon />
            <Typography variant="h6">Nuevo Factor de Emisión</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth label="Nombre del Factor" name="name"
                  value={factorFormData.name} onChange={handleFactorInputChange}
                  required placeholder="Ej: Transporte en autobús"
                />
                <TextField
                  fullWidth label="Código" name="code"
                  value={factorFormData.code} onChange={handleFactorInputChange}
                  required placeholder="Ej: BUS_TRANSPORT"
                />
              </Stack>

              <TextField
                fullWidth multiline rows={2} label="Descripción" name="description"
                value={factorFormData.description} onChange={handleFactorInputChange}
              />

              <FormControl fullWidth required>
                <InputLabel>Scope</InputLabel>
                <Select name="scope" value={factorFormData.scope} onChange={handleFactorInputChange} label="Scope">
                  {scopes.map((scope) => (
                    <MenuItem key={scope.id} value={scope.id}>{scope.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="subtitle2" color="text.secondary">
                Factor de Conversión
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth type="number" label="Factor de Emisión" name="emission_factor"
                  value={factorFormData.emission_factor} onChange={handleFactorInputChange}
                  required inputProps={{ step: '0.000001', min: 0 }} placeholder="0.10"
                />
                <TextField
                  fullWidth label="Unidad de Emisión" name="emission_unit"
                  value={factorFormData.emission_unit} onChange={handleFactorInputChange}
                  required placeholder="kgCO₂e"
                />
                <FormControl fullWidth>
                  <InputLabel>Unidad Base</InputLabel>
                  <Select name="unit" value={factorFormData.unit} onChange={handleFactorInputChange} label="Unidad Base">
                    <MenuItem value="kg">Kilogramos (kg)</MenuItem>
                    <MenuItem value="ton">Toneladas (ton)</MenuItem>
                    <MenuItem value="kwh">Kilovatios-hora (kWh)</MenuItem>
                    <MenuItem value="m3">Metros cúbicos (m³)</MenuItem>
                    <MenuItem value="l">Litros (l)</MenuItem>
                    <MenuItem value="km">Kilómetros (km)</MenuItem>
                    <MenuItem value="count">Cantidad</MenuItem>
                    <MenuItem value="hours">Horas</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <TextField
                fullWidth label="Fuente del factor" name="source"
                value={factorFormData.source} onChange={handleFactorInputChange}
                placeholder="Ej: IPCC 2021, EPA 2023"
              />

              <FormControlLabel
                control={
                  <Switch name="is_active" checked={factorFormData.is_active} onChange={handleFactorInputChange} />
                }
                label="Activo"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFactorDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleFactorSubmit}
            variant="contained"
            disabled={!factorFormData.name || !factorFormData.code || !factorFormData.scope || !factorFormData.emission_factor}
          >
            Crear Factor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: Nuevo Período */}
      <Dialog open={openPeriodDialog} onClose={() => setOpenPeriodDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarIcon />
            <Typography variant="h6">Nuevo Período de Medición</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth label="Nombre del Período" name="name"
                value={periodFormData.name} onChange={handlePeriodInputChange}
                required placeholder="Ej: Q1 2026"
              />
              <TextField
                fullWidth multiline rows={2} label="Descripción" name="description"
                value={periodFormData.description} onChange={handlePeriodInputChange}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth type="date" label="Fecha Inicio" name="start_date"
                  value={periodFormData.start_date} onChange={handlePeriodInputChange}
                  required InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth type="date" label="Fecha Fin" name="end_date"
                  value={periodFormData.end_date} onChange={handlePeriodInputChange}
                  required InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <FormControlLabel
                control={
                  <Switch name="is_active" checked={periodFormData.is_active} onChange={handlePeriodInputChange} />
                }
                label="Activo"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPeriodDialog(false)}>Cancelar</Button>
          <Button
            onClick={handlePeriodSubmit}
            variant="contained"
            disabled={!periodFormData.name || !periodFormData.start_date || !periodFormData.end_date}
          >
            Crear Período
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarbonConfig;
