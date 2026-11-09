const crypto = require('crypto');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const resources = require('../resources');
const { loginLimiter, requireAuth, audit, flash, clearSettingsCache, adminRoles } = require('../middleware');

const appStatuses = ['Recibida', 'En revisión', 'Preseleccionado', 'Invitado a tryout', 'En evaluación', 'Aceptado', 'No seleccionado'];
const evalKeys = ['mecanicas', 'comunicacion', 'trabajo_equipo', 'rotaciones', 'decisiones', 'conocimiento', 'disciplina', 'potencial'];
const settingKeys = [['instagram', 'Instagram (URL)'], ['tiktok', 'TikTok (URL)'], ['youtube', 'YouTube (URL)'], ['discord', 'Discord (URL de invitación)'], ['email', 'Correo oficial'], ['ceo', 'CEO y fundador'], ['legal_name', 'Razón social'], ['legal_id', 'NIT'], ['legal_address', 'Domicilio'], ['privacy_email', 'Correo para datos personales'], ['updated', 'Fecha de última actualización legal']];
const dummyHash = bcrypt.hashSync('no-existe', 10);

const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) + '-' + crypto.randomBytes(3).toString('hex');

function readValues(res, body) {
  return res.fields.map(f => {
    let v = body[f.n];
    if (f.t === 'checkbox') return !!v;
    if (v === undefined || String(v).trim() === '') return f.t === 'number' || f.n === 'starts_at' ? null : (f.req ? '' : null);
    if (f.n === 'starts_at') {
      const raw = String(v).trim();
      return /\d:\d\d.*(Z|[+-]\d\d(:?\d\d)?)$/.test(raw) ? raw : raw + ' -05:00';
    }
    return f.t === 'number' ? parseInt(v, 10) || 0 : String(v).trim();
  });
}

router.get('/acceso', (req, res) => {
  if (req.session.user) return res.redirect(adminRoles.includes(req.session.user.role) ? '/admin' : '/portal');
  res.render('admin/login', { title: 'Acceso privado | IMPERIUM ESPORTS' });
});

router.post('/acceso', loginLimiter, async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const r = await query('SELECT * FROM users WHERE email = $1 AND active', [email]);
  const user = r.rows[0];
  const ok = await bcrypt.compare(String(req.body.password || ''), user ? user.password_hash : dummyHash);
  if (!user || !ok) {
    flash(req, 'error', 'Credenciales incorrectas.');
    return res.redirect('/acceso');
  }
  req.session.regenerate(async err => {
    if (err) return res.redirect('/acceso');
    req.session.user = { id: user.id, email: user.email, role: user.role };
    try { await audit(req, 'Inicio de sesión'); } catch (e) { console.error(e); }
    req.session.save(() => res.redirect(adminRoles.includes(user.role) ? '/admin' : '/portal'));
  });
});

router.post('/salir', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

router.get('/admin', requireAuth(), async (req, res) => {
  const [apps, msgs, news] = await Promise.all([
    query("SELECT count(*)::int AS n FROM applications WHERE status = 'Recibida'"),
    query('SELECT count(*)::int AS n FROM messages WHERE NOT read'),
    query('SELECT count(*)::int AS n FROM news')
  ]);
  const rights = await query("SELECT count(*)::int AS n FROM data_requests WHERE status = 'Recibida'");
  res.render('admin/dashboard', { title: 'Panel | IMPERIUM ESPORTS', counts: { apps: apps.rows[0].n, msgs: msgs.rows[0].n, news: news.rows[0].n, rights: rights.rows[0].n } });
});

router.get('/admin/solicitudes', requireAuth('solicitudes'), async (req, res) => {
  const r = await query('SELECT id, code, status, created_at, data->>\'nickname\' AS nickname, data->>\'main_role\' AS main_role, data->>\'country\' AS country FROM applications ORDER BY created_at DESC LIMIT 300');
  res.render('admin/applications', { title: 'Postulaciones', list: r.rows });
});

router.get('/admin/solicitudes/:id', requireAuth('solicitudes'), async (req, res, next) => {
  const r = await query('SELECT * FROM applications WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  if (!r.rows[0]) return next();
  const [tryouts, regs] = await Promise.all([
    query('SELECT id, title, starts_at FROM tryouts WHERE open ORDER BY starts_at NULLS LAST'),
    query('SELECT t.title, g.attendance FROM tryout_registrations g JOIN tryouts t ON t.id = g.tryout_id WHERE g.application_id = $1', [r.rows[0].id])
  ]);
  res.render('admin/application', { title: 'Postulación ' + r.rows[0].code, a: r.rows[0], statuses: appStatuses, evalKeys, tryouts: tryouts.rows, regs: regs.rows });
});

router.post('/admin/solicitudes/:id', requireAuth('solicitudes'), async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const status = appStatuses.includes(req.body.status) ? req.body.status : 'Recibida';
  const evaluation = {};
  for (const k of evalKeys) {
    const n = parseInt(req.body['ev_' + k], 10);
    evaluation[k] = n >= 1 && n <= 10 ? n : null;
  }
  await query('UPDATE applications SET status = $1, notes = $2, evaluation = $3, updated_at = now() WHERE id = $4', [status, String(req.body.notes || '').slice(0, 4000), JSON.stringify(evaluation), id]);
  await audit(req, `Actualizó postulación ${id} a ${status}`);
  flash(req, 'ok', 'Postulación actualizada.');
  res.redirect('/admin/solicitudes/' + id);
});

router.get('/admin/mensajes', requireAuth('mensajes'), async (req, res) => {
  const r = await query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 200');
  res.render('admin/messages', { title: 'Mensajes', list: r.rows });
});

router.post('/admin/mensajes/:id/leido', requireAuth('mensajes'), async (req, res) => {
  await query('UPDATE messages SET read = true WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  res.redirect('/admin/mensajes');
});

router.get('/admin/ajustes', requireAuth('ajustes'), (req, res) => {
  res.render('admin/settings', { title: 'Ajustes y enlaces', keys: settingKeys });
});

router.post('/admin/ajustes', requireAuth('ajustes'), async (req, res) => {
  for (const [k] of settingKeys) {
    await query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [k, String(req.body[k] || '').trim().slice(0, 300)]);
  }
  clearSettingsCache();
  await audit(req, 'Actualizó ajustes');
  flash(req, 'ok', 'Ajustes guardados.');
  res.redirect('/admin/ajustes');
});

router.get('/admin/registro', requireAuth('registro'), async (req, res) => {
  const r = await query('SELECT * FROM audit_log ORDER BY id DESC LIMIT 200');
  res.render('admin/audit', { title: 'Registro de actividad', list: r.rows });
});

router.use('/admin/r/:res', (req, res, next) => {
  const cfg = resources[req.params.res];
  if (!cfg) return res.status(404).render('error', { title: 'Página no encontrada', message: 'La sección no existe.' });
  res.locals.cfg = cfg;
  res.locals.resKey = req.params.res;
  next();
}, (req, res, next) => requireAuth(req.params.res)(req, res, next));

router.get('/admin/r/:res', async (req, res) => {
  const cfg = res.locals.cfg;
  const r = await query(`SELECT * FROM ${cfg.table} ORDER BY ${cfg.order} LIMIT 300`);
  res.render('admin/list', { title: cfg.label, list: r.rows, pk: cfg.key || 'id' });
});

router.get('/admin/r/:res/nuevo', (req, res, next) => {
  if (res.locals.cfg.noCreate) return next();
  res.render('admin/form', { title: 'Nuevo · ' + res.locals.cfg.label, item: {}, isNew: true });
});

router.post('/admin/r/:res/nuevo', async (req, res, next) => {
  const cfg = res.locals.cfg;
  if (cfg.noCreate) return next();
  const values = readValues(cfg, req.body);
  const cols = cfg.fields.map(f => f.n);
  if (cfg.slugFrom) {
    cols.push('slug');
    values.push(slugify(String(req.body[cfg.slugFrom] || 'item')));
  }
  await query(`INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${cols.map((_, i) => '$' + (i + 1)).join(',')})`, values);
  await audit(req, `Creó en ${cfg.label}`);
  flash(req, 'ok', 'Creado correctamente.');
  res.redirect('/admin/r/' + req.params.res);
});

router.get('/admin/r/:res/:id', async (req, res, next) => {
  const cfg = res.locals.cfg;
  const r = await query(`SELECT * FROM ${cfg.table} WHERE ${cfg.key || 'id'} = $1`, [cfg.key ? req.params.id : parseInt(req.params.id, 10) || 0]);
  if (!r.rows[0]) return next();
  res.render('admin/form', { title: 'Editar · ' + cfg.label, item: r.rows[0], isNew: false });
});

router.post('/admin/r/:res/:id', async (req, res) => {
  const cfg = res.locals.cfg;
  const values = readValues(cfg, req.body);
  const sets = cfg.fields.map((f, i) => `${f.n} = $${i + 1}`).join(', ');
  const extra = cfg.table === 'pages' ? ', updated_at = now()' : '';
  await query(`UPDATE ${cfg.table} SET ${sets}${extra} WHERE ${cfg.key || 'id'} = $${values.length + 1}`, [...values, cfg.key ? req.params.id : parseInt(req.params.id, 10) || 0]);
  await audit(req, `Editó ${req.params.id} en ${cfg.label}`);
  flash(req, 'ok', 'Cambios guardados.');
  res.redirect('/admin/r/' + req.params.res);
});

router.post('/admin/r/:res/:id/eliminar', async (req, res, next) => {
  const cfg = res.locals.cfg;
  if (cfg.noCreate) return next();
  await query(`DELETE FROM ${cfg.table} WHERE id = $1`, [parseInt(req.params.id, 10) || 0]);
  await audit(req, `Eliminó ${req.params.id} en ${cfg.label}`);
  flash(req, 'ok', 'Eliminado.');
  res.redirect('/admin/r/' + req.params.res);
});

module.exports = router;
