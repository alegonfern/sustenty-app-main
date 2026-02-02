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
  Checkbox,
  ListItemText,
  OutlinedInput,
  Tabs,
  Tab,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
  Layers as LayersIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import InfoTooltip from '../../components/InfoTooltip';

// Lista de estándares disponibles
const AVAILABLE_STANDARDS = [
  { code: 'GRI 305-1', name: 'GRI 305-1 - Emisiones directas de GEI', category: 'GRI' },
  { code: 'GRI 305-2', name: 'GRI 305-2 - Emisiones indirectas de GEI', category: 'GRI' },
  { code: 'GRI 305-3', name: 'GRI 305-3 - Otras emisiones indirectas de GEI', category: 'GRI' },
  { code: 'GRI 302-1', name: 'GRI 302-1 - Consumo energético dentro de la organización', category: 'GRI' },
  { code: 'GRI 302-2', name: 'GRI 302-2 - Consumo energético fuera de la organización', category: 'GRI' },
  { code: 'GRI 303-3', name: 'GRI 303-3 - Extracción de agua', category: 'GRI' },
  { code: 'GRI 306-3', name: 'GRI 306-3 - Residuos generados', category: 'GRI' },
  { code: 'SASB EM-IS-110a.1', name: 'SASB EM-IS-110a.1 - Emisiones GEI', category: 'SASB' },
  { code: 'SASB EM-IS-110a.2', name: 'SASB EM-IS-110a.2 - Objetivos de reducción', category: 'SASB' },
  { code: 'SASB EM-IS-130a.1', name: 'SASB EM-IS-130a.1 - Gestión energética', category: 'SASB' },
  { code: 'TCFD Metrics', name: 'TCFD - Métricas y objetivos climáticos', category: 'TCFD' },
  { code: 'TCFD Strategy', name: 'TCFD - Estrategia climática', category: 'TCFD' },
  { code: 'TCFD Risk', name: 'TCFD - Gestión de riesgos climáticos', category: 'TCFD' },
  { code: 'ISO 14064-1', name: 'ISO 14064-1 - Cuantificación de GEI', category: 'ISO' },
  { code: 'ISO 14001', name: 'ISO 14001 - Sistema de gestión ambiental', category: 'ISO' },
  { code: 'CDP Climate', name: 'CDP - Cambio climático', category: 'CDP' },
  { code: 'CDP Water', name: 'CDP - Seguridad hídrica', category: 'CDP' },
];

// Panel de contenido con tab
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ESGConfig = () => {
  const [currentTab, setCurrentTab] = useState(0);
  
  // Estados para Factores de Emisión
  const [factors, setFactors] = useState([]);
  const [openFactorDialog, setOpenFactorDialog] = useState(false);
  const [factorFormData, setFactorFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    scope: '',
    data_type: 'numeric',
    unit: 'kg',
    emission_factor: '',
    emission_unit: 'kgCO₂e',
    standards: [],
    is_mandatory: false,
    is_active: true
  });
  
  // Estados para Scopes
  const [scopes, setScopes] = useState([]);
  const [openScopeDialog, setOpenScopeDialog] = useState(false);
  const [scopeFormData, setScopeFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    order: 0,
    is_active: true
  });
  
  // Estados para Períodos
  const [periods, setPeriods] = useState([]);
  const [openPeriodDialog, setOpenPeriodDialog] = useState(false);
  const [periodFormData, setPeriodFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  
  // Estados compartidos
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Token ${token}` };
      
      // Cargar categorías
      const categoriesRes = await fetch('http://localhost:8000/api/v1/esg/categories/', { headers });
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json());
      }

      // Cargar scopes
      const scopesRes = await fetch('http://localhost:8000/api/v1/esg/scopes/', { headers });
      if (scopesRes.ok) {
        setScopes(await scopesRes.json());
      }

      // Cargar factores
      const factorsRes = await fetch('http://localhost:8000/api/v1/esg/metrics/', { headers });
      if (factorsRes.ok) {
        setFactors(await factorsRes.json());
      }

      // Cargar períodos
      const periodsRes = await fetch('http://localhost:8000/api/v1/esg/periods/', { headers });
      if (periodsRes.ok) {
        setPeriods(await periodsRes.json());
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // ==================== FACTORES DE EMISIÓN ====================
  
  const handleOpenFactorDialog = () => {
    setFactorFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      scope: '',
      data_type: 'numeric',
      unit: 'kg',
      emission_factor: '',
      emission_unit: 'kgCO₂e',
      standards: [],
      is_mandatory: false,
      is_active: true
    });
    setOpenFactorDialog(true);
  };

  const handleFactorInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFactorFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStandardsChange = (event) => {
    const { value } = event.target;
    setFactorFormData(prev => ({
      ...prev,
      standards: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleFactorSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const gri = factorFormData.standards.filter(s => s.startsWith('GRI')).join(', ');
      const sasb = factorFormData.standards.filter(s => s.startsWith('SASB')).join(', ');
      const tcfd = factorFormData.standards.filter(s => s.startsWith('TCFD')).join(', ');
      const other = factorFormData.standards.filter(s => !s.startsWith('GRI') && !s.startsWith('SASB') && !s.startsWith('TCFD')).join(', ');
      
      const dataToSend = {
        ...factorFormData,
        gri_standard: gri,
        sasb_standard: sasb,
        tcfd_standard: tcfd || other,
      };
      delete dataToSend.standards;
      
      const response = await fetch('http://localhost:8000/api/v1/esg/metrics/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setOpenFactorDialog(false);
        loadData();
      } else {
        const error = await response.json();
        alert('Error al crear el factor: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDeleteFactor = async (id) => {
    if (!window.confirm('¿Eliminar este factor de emisión?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/v1/esg/metrics/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ==================== SCOPES ====================
  
  const handleOpenScopeDialog = () => {
    setScopeFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      order: 0,
      is_active: true
    });
    setOpenScopeDialog(true);
  };

  const handleScopeInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setScopeFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleScopeSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/esg/scopes/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scopeFormData)
      });

      if (response.ok) {
        setOpenScopeDialog(false);
        loadData();
      } else {
        const error = await response.json();
        alert('Error al crear el scope: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDeleteScope = async (id) => {
    if (!window.confirm('¿Eliminar este scope?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/v1/esg/scopes/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ==================== PERÍODOS ====================
  
  const handleOpenPeriodDialog = () => {
    setPeriodFormData({
      name: '',
      start_date: '',
      end_date: '',
      is_active: true
    });
    setOpenPeriodDialog(true);
  };

  const handlePeriodInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPeriodFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePeriodSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/esg/periods/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(periodFormData)
      });

      if (response.ok) {
        setOpenPeriodDialog(false);
        loadData();
      } else {
        const error = await response.json();
        alert('Error al crear el período: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDeletePeriod = async (id) => {
    if (!window.confirm('¿Eliminar este período?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/v1/esg/periods/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Helpers
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  const getScopeName = (scopeId) => {
    const scope = scopes.find(s => s.id === scopeId);
    return scope ? scope.name : 'N/A';
  };

  const filteredScopes = factorFormData.category 
    ? scopes.filter(s => s.category === factorFormData.category)
    : scopes;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h4" component="h1">
            Configuración ESG
          </Typography>
          <InfoTooltip infoKey="esg" />
        </Stack>
        <Typography variant="subtitle1" color="text.secondary">
          Gestiona los factores de emisión, scopes y períodos de reporte
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 <strong>¿Nuevo en configuración ESG?</strong> Aquí puedes personalizar los parámetros fundamentales para medir tu huella ambiental. 
        Los <strong>factores de emisión</strong> convierten tus actividades en emisiones de CO₂, los <strong>scopes</strong> clasifican las fuentes de emisiones, 
        y los <strong>períodos</strong> definen los rangos de tiempo para tus reportes. Pasa el cursor sobre los iconos ℹ️ para más información.
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, val) => setCurrentTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<ScienceIcon />} 
            label="Factores de Emisión" 
            iconPosition="start"
          />
          <Tab 
            icon={<LayersIcon />} 
            label="Scopes" 
            iconPosition="start"
          />
          <Tab 
            icon={<CalendarIcon />} 
            label="Períodos" 
            iconPosition="start"
          />
        </Tabs>

        {/* TAB: Factores de Emisión */}
        <TabPanel value={currentTab} index={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">Factores de Emisión ({factors.length})</Typography>
              <InfoTooltip infoKey="emissionFactor" />
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenFactorDialog}
            >
              Nuevo Factor
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
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
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No hay factores de emisión configurados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  factors.map((factor) => (
                    <TableRow key={factor.id} hover>
                      <TableCell>
                        <Chip label={factor.code} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{factor.name}</TableCell>
                      <TableCell>{getCategoryName(factor.category)}</TableCell>
                      <TableCell>{getScopeName(factor.scope)}</TableCell>
                      <TableCell align="center">{factor.emission_factor || '-'}</TableCell>
                      <TableCell align="center">{factor.emission_unit}</TableCell>
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
            Esta clasificación sigue el estándar GHG Protocol.
          </Alert>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">Scopes ({scopes.length})</Typography>
              <InfoTooltip infoKey="scope1" />
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenScopeDialog}
            >
              Nuevo Scope
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="center">Orden</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scopes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No hay scopes configurados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  scopes.map((scope) => (
                    <TableRow key={scope.id} hover>
                      <TableCell>
                        <Chip label={scope.code} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{scope.name}</TableCell>
                      <TableCell>{getCategoryName(scope.category)}</TableCell>
                      <TableCell>{scope.description || '-'}</TableCell>
                      <TableCell align="center">{scope.order}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={scope.is_active ? 'Activo' : 'Inactivo'}
                          color={scope.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDeleteScope(scope.id)}>
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

        {/* TAB: Períodos */}
        <TabPanel value={currentTab} index={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">Períodos de Reporte ({periods.length})</Typography>
              <InfoTooltip infoKey="period" />
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenPeriodDialog}
            >
              Nuevo Período
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No hay períodos configurados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => (
                    <TableRow key={period.id} hover>
                      <TableCell>{period.name}</TableCell>
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
                  fullWidth
                  label="Nombre del Factor"
                  name="name"
                  value={factorFormData.name}
                  onChange={handleFactorInputChange}
                  required
                  placeholder="Ej: Transporte en autobús"
                />
                <TextField
                  fullWidth
                  label="Código"
                  name="code"
                  value={factorFormData.code}
                  onChange={handleFactorInputChange}
                  required
                  placeholder="Ej: BUS_TRANSPORT"
                />
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción"
                name="description"
                value={factorFormData.description}
                onChange={handleFactorInputChange}
              />

              <Stack direction="row" spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="category"
                    value={factorFormData.category}
                    onChange={handleFactorInputChange}
                    label="Categoría"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!factorFormData.category}>
                  <InputLabel>Scope/Origen</InputLabel>
                  <Select
                    name="scope"
                    value={factorFormData.scope}
                    onChange={handleFactorInputChange}
                    label="Scope/Origen"
                  >
                    {filteredScopes.map((scope) => (
                      <MenuItem key={scope.id} value={scope.id}>{scope.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Typography variant="subtitle2" color="text.secondary">
                Factor de Conversión
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Factor de Emisión"
                  name="emission_factor"
                  value={factorFormData.emission_factor}
                  onChange={handleFactorInputChange}
                  required
                  inputProps={{ step: '0.000001', min: 0 }}
                  placeholder="0.10"
                />
                <TextField
                  fullWidth
                  label="Unidad de Emisión"
                  name="emission_unit"
                  value={factorFormData.emission_unit}
                  onChange={handleFactorInputChange}
                  required
                  placeholder="kgCO₂e"
                />
                <FormControl fullWidth>
                  <InputLabel>Unidad Base</InputLabel>
                  <Select
                    name="unit"
                    value={factorFormData.unit}
                    onChange={handleFactorInputChange}
                    label="Unidad Base"
                  >
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

              <Typography variant="subtitle2" color="text.secondary">
                Estándares de Cumplimiento (Opcional)
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Estándares Aplicables</InputLabel>
                <Select
                  multiple
                  name="standards"
                  value={factorFormData.standards}
                  onChange={handleStandardsChange}
                  input={<OutlinedInput label="Estándares Aplicables" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: { style: { maxHeight: 300 } },
                  }}
                >
                  {AVAILABLE_STANDARDS.map((standard) => (
                    <MenuItem key={standard.code} value={standard.code}>
                      <Checkbox checked={factorFormData.standards.indexOf(standard.code) > -1} />
                      <ListItemText primary={standard.code} secondary={standard.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_mandatory"
                      checked={factorFormData.is_mandatory}
                      onChange={handleFactorInputChange}
                    />
                  }
                  label="Métrica Obligatoria"
                />
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={factorFormData.is_active}
                      onChange={handleFactorInputChange}
                    />
                  }
                  label="Activo"
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFactorDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleFactorSubmit} 
            variant="contained"
            disabled={!factorFormData.name || !factorFormData.code || !factorFormData.category || !factorFormData.emission_factor}
          >
            Crear Factor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: Nuevo Scope */}
      <Dialog open={openScopeDialog} onClose={() => setOpenScopeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LayersIcon />
            <Typography variant="h6">Nuevo Scope</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={scopeFormData.name}
                  onChange={handleScopeInputChange}
                  required
                  placeholder="Ej: Alcance 1 - Emisiones Directas"
                />
                <TextField
                  fullWidth
                  label="Código"
                  name="code"
                  value={scopeFormData.code}
                  onChange={handleScopeInputChange}
                  required
                  placeholder="Ej: SCOPE_1"
                />
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción"
                name="description"
                value={scopeFormData.description}
                onChange={handleScopeInputChange}
              />

              <Stack direction="row" spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="category"
                    value={scopeFormData.category}
                    onChange={handleScopeInputChange}
                    label="Categoría"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="number"
                  label="Orden"
                  name="order"
                  value={scopeFormData.order}
                  onChange={handleScopeInputChange}
                  inputProps={{ min: 0 }}
                />
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={scopeFormData.is_active}
                    onChange={handleScopeInputChange}
                  />
                }
                label="Activo"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScopeDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleScopeSubmit} 
            variant="contained"
            disabled={!scopeFormData.name || !scopeFormData.code || !scopeFormData.category}
          >
            Crear Scope
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: Nuevo Período */}
      <Dialog open={openPeriodDialog} onClose={() => setOpenPeriodDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarIcon />
            <Typography variant="h6">Nuevo Período</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nombre del Período"
                name="name"
                value={periodFormData.name}
                onChange={handlePeriodInputChange}
                required
                placeholder="Ej: Q1 2026"
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Inicio"
                  name="start_date"
                  value={periodFormData.start_date}
                  onChange={handlePeriodInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Fin"
                  name="end_date"
                  value={periodFormData.end_date}
                  onChange={handlePeriodInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={periodFormData.is_active}
                    onChange={handlePeriodInputChange}
                  />
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

export default ESGConfig;
