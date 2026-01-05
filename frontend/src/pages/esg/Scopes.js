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
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Layers as LayersIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const Scopes = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
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

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/esg/scopes/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newScope = await response.json();
        setScopes([...scopes, newScope]);
        handleCloseDialog();
        // Recargar datos para obtener metrics_count actualizado
        loadData();
      } else {
        const error = await response.json();
        console.error('Error creando scope:', error);
        alert('Error al crear el scope: ' + JSON.stringify(error));
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

  const totalMetrics = scopes.reduce((sum, scope) => sum + (scope.metrics_count || 0), 0);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Configuración de Scopes
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gestión de alcances de emisiones y orígenes de datos ESG
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Nuevo Scope
          </Button>
        </Stack>
      </Box>

      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Scopes
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {scopes.length}
                  </Typography>
                </Box>
                <LayersIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.3 }} />
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
                    Factores Configurados
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {totalMetrics}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'success.light', opacity: 0.3 }} />
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
                    Scopes Activos
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {scopes.filter(s => s.is_active).length}
                  </Typography>
                </Box>
                <LayersIcon sx={{ fontSize: 48, color: 'info.light', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Código</strong></TableCell>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Descripción</strong></TableCell>
                <TableCell><strong>Categoría</strong></TableCell>
                <TableCell align="center"><strong>Factores</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scopes.map((scope) => (
                <TableRow key={scope.id} hover>
                  <TableCell><code>{scope.code}</code></TableCell>
                  <TableCell><strong>{scope.name}</strong></TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {scope.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getCategoryName(scope.category)} 
                      size="small" 
                      color="success"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={scope.metrics_count || 0} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={scope.is_active ? 'Activo' : 'Inactivo'} 
                      color={scope.is_active ? 'success' : 'default'} 
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

      {/* Diálogo para Nuevo Scope */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LayersIcon />
            <Typography variant="h6">Nuevo Scope/Origen</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nombre del Scope"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ej: Scope 1 - Emisiones Directas"
              />

              <FormControl fullWidth required>
                <InputLabel>Código</InputLabel>
                <Select
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  label="Código"
                >
                  <MenuItem value="scope_1">scope_1</MenuItem>
                  <MenuItem value="scope_2">scope_2</MenuItem>
                  <MenuItem value="scope_3">scope_3</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el alcance y tipo de emisiones que cubre este scope..."
              />

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

              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                }
                label="Scope Activo"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.code || !formData.category}
          >
            Crear Scope
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Scopes;
