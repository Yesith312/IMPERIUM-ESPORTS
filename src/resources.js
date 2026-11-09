const roles = ['IGL', 'Fragger', 'Soporte', 'Flex', 'Sniper'];
const playerCats = ['Jugadores titulares', 'Suplentes', 'Staff técnico', 'Management'];
const newsCats = ['Anuncios oficiales', 'Fichajes', 'Despedidas', 'Torneos', 'Resultados', 'Comunicados', 'Comunidad'];
const statuses = ['Próximamente', 'Inscripción abierta', 'En curso', 'Finalizado', 'Clasificado', 'Eliminado'];
const tiers = ['Patrocinador oficial', 'Socio comercial', 'Colaborador', 'Marca aliada'];

module.exports = {
  noticias: { table: 'news', label: 'Noticias', cols: ['title', 'category', 'published'], order: 'created_at DESC', slugFrom: 'title', fields: [
    { n: 'title', l: 'Título', t: 'text', req: true }, { n: 'summary', l: 'Descripción corta', t: 'textarea' },
    { n: 'body', l: 'Contenido (HTML permitido)', t: 'textarea', big: true }, { n: 'category', l: 'Categoría', t: 'select', o: newsCats },
    { n: 'tags', l: 'Etiquetas (separadas por coma)', t: 'text' }, { n: 'image', l: 'URL de imagen', t: 'text' },
    { n: 'author', l: 'Autor', t: 'text' }, { n: 'featured', l: 'Destacada', t: 'checkbox' }, { n: 'published', l: 'Publicada', t: 'checkbox' }] },
  jugadores: { table: 'players', label: 'Roster', cols: ['nick', 'role', 'category', 'active'], order: 'id DESC', fields: [
    { n: 'nick', l: 'Nickname', t: 'text', req: true }, { n: 'public_name', l: 'Nombre público (opcional)', t: 'text' },
    { n: 'country', l: 'País', t: 'text' }, { n: 'flag', l: 'Bandera (emoji)', t: 'text' }, { n: 'game_id', l: 'ID de jugador (opcional)', t: 'text' },
    { n: 'role', l: 'Rol', t: 'select', o: roles }, { n: 'category', l: 'Categoría', t: 'select', o: playerCats },
    { n: 'bio', l: 'Biografía', t: 'textarea' }, { n: 'photo', l: 'URL de fotografía', t: 'text' },
    { n: 'instagram', l: 'Instagram (URL)', t: 'text' }, { n: 'tiktok', l: 'TikTok (URL)', t: 'text' },
    { n: 'joined', l: 'Fecha de incorporación', t: 'text' }, { n: 'stats', l: 'Estadísticas', t: 'textarea' },
    { n: 'history', l: 'Historial de equipos', t: 'textarea' }, { n: 'active', l: 'Activo (desmarcar para archivar)', t: 'checkbox' }] },
  staff: { table: 'staff', label: 'Staff', cols: ['position', 'name', 'vacant'], order: 'sort, id', fields: [
    { n: 'position', l: 'Cargo', t: 'text', req: true }, { n: 'name', l: 'Nombre', t: 'text' }, { n: 'bio', l: 'Descripción', t: 'textarea' },
    { n: 'photo', l: 'URL de fotografía', t: 'text' }, { n: 'social', l: 'Red social pública (URL)', t: 'text' },
    { n: 'vacant', l: 'Vacante', t: 'checkbox' }, { n: 'sort', l: 'Orden', t: 'number' }] },
  torneos: { table: 'tournaments', label: 'Torneos', cols: ['name', 'status', 'starts_at'], order: 'starts_at DESC NULLS LAST', slugFrom: 'name', fields: [
    { n: 'name', l: 'Nombre', t: 'text', req: true }, { n: 'region', l: 'Región', t: 'text' }, { n: 'format', l: 'Formato', t: 'text' },
    { n: 'starts_at', l: 'Fecha y hora (AAAA-MM-DD HH:MM)', t: 'text' }, { n: 'status', l: 'Estado', t: 'select', o: statuses },
    { n: 'description', l: 'Descripción', t: 'textarea' }, { n: 'result', l: 'Resultado / clasificación', t: 'textarea' },
    { n: 'confirmed', l: 'Participación de IMPERIUM confirmada', t: 'checkbox' }] },
  resultados: { table: 'results', label: 'Resultados y estadísticas', cols: ['tournament', 'season', 'position', 'points'], order: 'id DESC', fields: [
    { n: 'tournament', l: 'Torneo', t: 'text', req: true }, { n: 'season', l: 'Temporada', t: 'text' }, { n: 'position', l: 'Posición', t: 'number' },
    { n: 'points', l: 'Puntos', t: 'number' }, { n: 'booyahs', l: 'Booyahs', t: 'number' }, { n: 'kills', l: 'Eliminaciones', t: 'number' }, { n: 'matches', l: 'Partidas', t: 'number' }] },
  patrocinadores: { table: 'sponsors', label: 'Patrocinadores', cols: ['name', 'tier'], order: 'id DESC', fields: [
    { n: 'name', l: 'Nombre', t: 'text', req: true }, { n: 'tier', l: 'Tipo', t: 'select', o: tiers }, { n: 'description', l: 'Descripción', t: 'textarea' },
    { n: 'website', l: 'Sitio web (URL)', t: 'text' }, { n: 'social', l: 'Redes (URL)', t: 'text' }, { n: 'logo', l: 'URL del logo', t: 'text' }] },
  faqs: { table: 'faqs', label: 'Preguntas frecuentes', cols: ['question', 'sort'], order: 'sort, id', fields: [
    { n: 'question', l: 'Pregunta', t: 'text', req: true }, { n: 'answer', l: 'Respuesta', t: 'textarea', req: true }, { n: 'sort', l: 'Orden', t: 'number' }] },
  tryouts: { table: 'tryouts', label: 'Tryouts', cols: ['title', 'starts_at', 'open'], order: 'starts_at DESC NULLS LAST', fields: [
    { n: 'title', l: 'Título', t: 'text', req: true }, { n: 'starts_at', l: 'Fecha y hora (AAAA-MM-DD HH:MM)', t: 'text' },
    { n: 'roles', l: 'Roles solicitados', t: 'text' }, { n: 'requirements', l: 'Requisitos', t: 'textarea' }, { n: 'open', l: 'Convocatoria abierta', t: 'checkbox' }] },
  paginas: { table: 'pages', key: 'slug', label: 'Páginas', cols: ['slug', 'title'], order: 'slug', noCreate: true, fields: [
    { n: 'title', l: 'Título', t: 'text', req: true }, { n: 'body', l: 'Contenido (HTML)', t: 'textarea', big: true }] }
};

const audiences = ['todos', 'jugadores', 'staff'];
Object.assign(module.exports, {
  equipos: { table: 'teams', label: 'Equipos', cols: ['name', 'game', 'status', 'active'], order: 'id', fields: [
    { n: 'name', l: 'Nombre', t: 'text', req: true }, { n: 'logo', l: 'URL del logo', t: 'text' }, { n: 'region', l: 'Región', t: 'text' },
    { n: 'game', l: 'Juego', t: 'text' }, { n: 'manager', l: 'Manager', t: 'text' }, { n: 'coach', l: 'Coach', t: 'text' },
    { n: 'status', l: 'Estado competitivo', t: 'select', o: ['En formación', 'Activo', 'Inactivo'] },
    { n: 'history', l: 'Historial de resultados', t: 'textarea' }, { n: 'active', l: 'Visible', t: 'checkbox' }] },
  estadisticas: { table: 'player_stats', label: 'Estadísticas por jugador', cols: ['player', 'tournament', 'season', 'kills'], order: 'id DESC', fields: [
    { n: 'player', l: 'Jugador (nickname)', t: 'text', req: true }, { n: 'tournament', l: 'Torneo', t: 'text' }, { n: 'season', l: 'Temporada', t: 'text' },
    { n: 'kills', l: 'Eliminaciones', t: 'number' }, { n: 'booyahs', l: 'Booyahs', t: 'number' }, { n: 'matches', l: 'Partidas', t: 'number' }, { n: 'points', l: 'Puntos', t: 'number' }] },
  comunicados: { table: 'portal_posts', label: 'Comunicados internos', cols: ['title', 'audience', 'created_at'], order: 'created_at DESC', fields: [
    { n: 'title', l: 'Título', t: 'text', req: true }, { n: 'body', l: 'Mensaje (HTML permitido)', t: 'textarea', big: true }, { n: 'audience', l: 'Dirigido a', t: 'select', o: audiences }] },
  entrenamientos: { table: 'trainings', label: 'Entrenamientos', cols: ['title', 'starts_at', 'audience'], order: 'starts_at DESC NULLS LAST', fields: [
    { n: 'title', l: 'Título', t: 'text', req: true }, { n: 'starts_at', l: 'Fecha y hora (AAAA-MM-DD HH:MM, hora Colombia)', t: 'text' },
    { n: 'details', l: 'Detalles', t: 'textarea' }, { n: 'audience', l: 'Dirigido a', t: 'select', o: audiences }] },
  docs: { table: 'internal_docs', label: 'Documentos internos', cols: ['title', 'audience'], order: 'id DESC', fields: [
    { n: 'title', l: 'Título', t: 'text', req: true }, { n: 'url', l: 'URL o /media/ID', t: 'text', req: true }, { n: 'audience', l: 'Dirigido a', t: 'select', o: audiences }] }
});
