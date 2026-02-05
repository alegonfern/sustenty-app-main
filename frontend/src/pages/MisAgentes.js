
import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import { Add, Edit, Delete, Pause, PlayArrow, Stop } from '@mui/icons-material';
import { AGENTE_TIPOS, AGENTE_ROLES, AGENTE_TAREAS, mockAgentes } from './agentModel';


export default function MisAgentes() {
  const [agents, setAgents] = useState(mockAgentes);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', tipo: '', descripcion: '', tareas: [], roles: [] });
  const [editId, setEditId] = useState(null);

  const handleOpen = () => {
    setForm({ nombre: '', tipo: '', descripcion: '', tareas: [], roles: [] });
    setEditId(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name) => (event) => {
    const { value } = event.target;
    setForm({ ...form, [name]: typeof value === 'string' ? value.split(',') : value });
  };

  const handleSave = () => {
    if (editId) {
      setAgents(agents.map(a => a.id === editId ? { ...a, ...form } : a));
    } else {
      setAgents([
        ...agents,
        {
          ...form,
          id: Date.now(),
          estado: 'activo',
          fecha_creacion: new Date().toISOString()
        }
      ]);
    }
    setOpen(false);
  };

  const handleEdit = (agent) => {
    setForm({
      nombre: agent.nombre,
      tipo: agent.tipo,
      descripcion: agent.descripcion,
      tareas: agent.tareas || [],
      roles: agent.roles || []
    });
    setEditId(agent.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setAgents(agents.filter(a => a.id !== id));
  };

  // Gestión de estado: pausar, reiniciar, detener
  const handleEstado = (id, nuevoEstado) => {
    setAgents(agents.map(a => a.id === id ? { ...a, estado: nuevoEstado } : a));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Mis agentes</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={handleOpen} sx={{ mb: 2 }}>
        Crear agente
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Tareas</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>{agent.nombre}</TableCell>
                <TableCell>{AGENTE_TIPOS.find(t => t.value === agent.tipo)?.label || agent.tipo}</TableCell>
                <TableCell>{agent.descripcion}</TableCell>
                <TableCell>
                  {agent.tareas?.map(t => (
                    <Chip key={t} label={AGENTE_TAREAS.find(tt => tt.value === t)?.label || t} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  {agent.roles?.map(r => (
                    <Chip key={r} label={AGENTE_ROLES.find(rr => rr.value === r)?.label || r} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip label={agent.estado} color={
                    agent.estado === 'activo' ? 'success' :
                    agent.estado === 'pausado' ? 'warning' :
                    agent.estado === 'detenido' ? 'default' : 'default'
                  } size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(agent)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(agent.id)} color="error"><Delete /></IconButton>
                  {agent.estado === 'activo' && (
                    <IconButton onClick={() => handleEstado(agent.id, 'pausado')} title="Pausar"><Pause /></IconButton>
                  )}
                  {agent.estado === 'pausado' && (
                    <IconButton onClick={() => handleEstado(agent.id, 'activo')} title="Reiniciar"><PlayArrow /></IconButton>
                  )}
                  {agent.estado !== 'detenido' && (
                    <IconButton onClick={() => handleEstado(agent.id, 'detenido')} title="Detener"><Stop /></IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Editar agente' : 'Crear agente'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nombre"
            label="Nombre"
            fullWidth
            value={form.nombre}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="tipo-label">Tipo</InputLabel>
            <Select
              labelId="tipo-label"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              input={<OutlinedInput label="Tipo" />}
            >
              {AGENTE_TIPOS.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="descripcion"
            label="Descripción"
            fullWidth
            multiline
            minRows={2}
            value={form.descripcion}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="tareas-label">Tareas</InputLabel>
            <Select
              labelId="tareas-label"
              multiple
              value={form.tareas}
              onChange={handleSelectChange('tareas')}
              input={<OutlinedInput label="Tareas" />}
              renderValue={(selected) => selected.map(val => AGENTE_TAREAS.find(t => t.value === val)?.label || val).join(', ')}
            >
              {AGENTE_TAREAS.map(t => (
                <MenuItem key={t.value} value={t.value}>
                  <Checkbox checked={form.tareas.indexOf(t.value) > -1} />
                  <ListItemText primary={t.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="roles-label">Roles</InputLabel>
            <Select
              labelId="roles-label"
              multiple
              value={form.roles}
              onChange={handleSelectChange('roles')}
              input={<OutlinedInput label="Roles" />}
              renderValue={(selected) => selected.map(val => AGENTE_ROLES.find(r => r.value === val)?.label || val).join(', ')}
            >
              {AGENTE_ROLES.map(r => (
                <MenuItem key={r.value} value={r.value}>
                  <Checkbox checked={form.roles.indexOf(r.value) > -1} />
                  <ListItemText primary={r.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
