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
  OutlinedInput
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon
} from '@mui/icons-material';

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

const EmissionFactors = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [factors, setFactors] = useState([]);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar categorías
      const categoriesRes = await fetch('http://localhost:8000/api/v1/esg/categories/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      // Cargar scopes
      const scopesRes = await fetch('http://localhost:8000/api/v1/esg/scopes/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (scopesRes.ok) {
        const scopesData = await scopesRes.json();
        setScopes(scopesData);
      }

      // Cargar factores
      const factorsRes = await fetch('http://localhost:8000/api/v1/esg/metrics/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (factorsRes.ok) {
        const factorsData = await factorsRes.json();
        setFactors(factorsData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
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
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStandardsChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      standards: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Separar estándares por categoría para enviar al backend
      const gri = formData.standards.filter(s => s.startsWith('GRI')).join(', ');
      const sasb = formData.standards.filter(s => s.startsWith('SASB')).join(', ');
      const tcfd = formData.standards.filter(s => s.startsWith('TCFD')).join(', ');
      const other = formData.standards.filter(s => !s.startsWith('GRI') && !s.startsWith('SASB') && !s.startsWith('TCFD')).join(', ');
      
      const dataToSend = {
        ...formData,
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
        const newFactor = await response.json();
        setFactors([...factors, newFactor]);
        handleCloseDialog();
        loadData(); // Recargar para ver datos completos
      } else {
        const error = await response.json();
        console.error('Error creando factor:', error);
        alert('Error al crear el factor: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  const getScopeName = (scopeId) => {
    const scope = scopes.find(s => s.id === scopeId);
    return scope ? scope.name : 'N/A';
  };

  const filteredScopes = formData.category 
    ? scopes.filter(s => s.category === formData.category)
    : scopes;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Factores de Emisión
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Configuración de métricas y factores de conversión para cálculo de emisiones
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Nuevo Factor
          </Button>
        </Stack>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Código</strong></TableCell>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Categoría</strong></TableCell>
                <TableCell><strong>Scope</strong></TableCell>
                <TableCell><strong>Factor</strong></TableCell>
                <TableCell><strong>Unidad</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factors.map((factor) => (
                <TableRow key={factor.id} hover>
                  <TableCell><code>{factor.code}</code></TableCell>
                  <TableCell>{factor.name}</TableCell>
                  <TableCell>{getCategoryName(factor.category)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getScopeName(factor.scope)} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <strong>{factor.emission_factor}</strong> {factor.emission_unit}
                  </TableCell>
                  <TableCell>{factor.unit}</TableCell>
                  <TableCell>
                    <Chip 
                      label={factor.is_active ? 'Activo' : 'Inactivo'} 
                      color={factor.is_active ? 'success' : 'default'} 
                      size="small" 
                    />
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

      {/* Diálogo para Nuevo Factor */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Transporte en autobús"
                />
                <TextField
                  fullWidth
                  label="Código"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
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
                value={formData.description}
                onChange={handleInputChange}
              />

              <Stack direction="row" spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Categoría"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!formData.category}>
                  <InputLabel>Scope/Origen</InputLabel>
                  <Select
                    name="scope"
                    value={formData.scope}
                    onChange={handleInputChange}
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
                  value={formData.emission_factor}
                  onChange={handleInputChange}
                  required
                  inputProps={{ step: '0.000001', min: 0 }}
                  placeholder="0.10"
                />
                <TextField
                  fullWidth
                  label="Unidad de Emisión"
                  name="emission_unit"
                  value={formData.emission_unit}
                  onChange={handleInputChange}
                  required
                  placeholder="kgCO₂e"
                />
                <FormControl fullWidth>
                  <InputLabel>Unidad Base</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
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
                  value={formData.standards}
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
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {AVAILABLE_STANDARDS.map((standard) => (
                    <MenuItem key={standard.code} value={standard.code}>
                      <Checkbox checked={formData.standards.indexOf(standard.code) > -1} />
                      <ListItemText 
                        primary={standard.code} 
                        secondary={standard.name}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_mandatory"
                      checked={formData.is_mandatory}
                      onChange={handleInputChange}
                    />
                  }
                  label="Métrica Obligatoria"
                />
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                  }
                  label="Activo"
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.code || !formData.category || !formData.emission_factor}
          >
            Crear Factor
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmissionFactors;
