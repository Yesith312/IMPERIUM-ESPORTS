const applicationStatuses = [
  { value: 'recibida', label: 'Recibida' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'preseleccionado', label: 'Preseleccionado' },
  { value: 'pendiente_tryout', label: 'Pendiente de tryout' },
  { value: 'tryout_programado', label: 'Tryout programado' },
  { value: 'tryout_realizado', label: 'Tryout realizado' },
  { value: 'en_evaluacion', label: 'En evaluación' },
  { value: 'seleccionado', label: 'Seleccionado' },
  { value: 'no_seleccionado', label: 'No seleccionado' },
  { value: 'lista_espera', label: 'Lista de espera' }
];

const applicationStatusValues = applicationStatuses.map(status => status.value);

const applicationStatusLabels = Object.fromEntries(
  applicationStatuses.map(status => [status.value, status.label])
);

module.exports = {
  applicationStatuses,
  applicationStatusValues,
  applicationStatusLabels
};
