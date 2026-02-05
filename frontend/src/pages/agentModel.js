// Modelo y mocks para agentes IA sostenibles (MVP escalable)
export const AGENTE_TIPOS = [
  { value: 'medicion_huella', label: 'Medición de Huella' },
  { value: 'esg', label: 'Gestión ESG' },
  { value: 'buenas_practicas', label: 'Buenas Prácticas' },
  { value: 'personalizado', label: 'Personalizado' }
];

export const AGENTE_ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'responsable_esg', label: 'Responsable ESG' },
  { value: 'colaborador', label: 'Colaborador' }
];

export const AGENTE_TAREAS = [
  { value: 'medir_huella', label: 'Medir huella de carbono' },
  { value: 'mantener_esg', label: 'Mantener ESG' },
  { value: 'sugerir_buenas_practicas', label: 'Sugerir buenas prácticas' },
  { value: 'reportar', label: 'Reportar avances' }
];

export const mockAgentes = [
  {
    id: 1,
    nombre: 'Agente ESG',
    tipo: 'esg',
    descripcion: 'Gestiona el cumplimiento ESG de la organización.',
    estado: 'activo',
    tareas: ['mantener_esg', 'reportar'],
    roles: ['responsable_esg'],
    fecha_creacion: '2026-02-04T12:00:00Z'
  },
  {
    id: 2,
    nombre: 'Medidor de Huella',
    tipo: 'medicion_huella',
    descripcion: 'Calcula la huella de carbono periódicamente.',
    estado: 'pausado',
    tareas: ['medir_huella'],
    roles: ['admin', 'colaborador'],
    fecha_creacion: '2026-02-04T12:00:00Z'
  }
];
