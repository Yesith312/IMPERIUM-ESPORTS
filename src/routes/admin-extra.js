const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { requireAuth, audit, flash, allRoles } = require('../middleware');

const mailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attendance = ['Invitado', 'Confirmado', 'Asistió', 'No asistió'];
const backupTables = ['pages', 'settings', 'news', 'players', 'staff', 'teams', 'tournaments', 'results', 'player_stats', 'sponsors', 'faqs', 'tryouts', 'applications', 'tryout_registrations', 'messages', 'data_requests', 'portal_posts', 'trainings', 'internal_docs', 'audit_log'];

async function target(req, res) {
  const r = await query('SELECT id, email, role FROM users WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  const t = r.rows[0];
  if (!t || t.id === req.session.user.id || (t.role === 'superadmin' && req.session.user.role !== 'superadmin')) {
    flash(req, 'error', 'No puedes modificar ese usuario.');
    res.redirect('/admin/usuarios');
    return null;
  }
  return t;
}

router.get('/admin/usuarios', requireAuth('usuarios'), async (req, res) => {
  const r = await query('SELECT id, email, role, active, full_name FROM users ORDER BY id');
  res.render('admin/users', { title: 'Usuarios y permisos', list: r.rows, roles: allRoles });
});

router.post('/admin/usuarios', requireAuth('usuarios'), async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const role = allRoles.includes(req.body.role) ? req.body.role : 'editor';
  const password = String(req.body.password || '');
  if (!mailRe.test(email) || password.length < 12) {
    flash(req, 'error', 'Correo válido y contraseña de al menos 12 caracteres.');
    return res.redirect('/admin/usuarios');
  }
  if (role === 'superadmin' && req.session.user.role !== 'superadmin') {
    flash(req, 'error', 'Solo un superadministrador puede crear otro.');
    return res.redirect('/admin/usuarios');
  }
  const existing = await query('SELECT role FROM users WHERE email = $1', [email]);
  if (existing.rows[0] && existing.rows[0].role === 'superadmin' && req.session.user.role !== 'superadmin') {
    flash(req, 'error', 'No puedes modificar a un superadministrador.');
    return res.redirect('/admin/usuarios');
  }
  const hash = await bcrypt.hash(password, 12);
  await query('INSERT INTO users (email, password_hash, role, full_name) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, active = true', [email, hash, role, String(req.body.full_name || '').trim().slice(0, 100) || null]);
  await audit(req, `Creó o actualizó usuario ${email} (${role})`);
  flash(req, 'ok', 'Usuario guardado.');
  res.redirect('/admin/usuarios');
});

router.post('/admin/usuarios/:id/estado', requireAuth('usuarios'), async (req, res) => {
  const t = await target(req, res);
  if (!t) return;
  await query('UPDATE users SET active = NOT active WHERE id = $1', [t.id]);
  await audit(req, `Cambió el estado del usuario ${t.email}`);
  flash(req, 'ok', 'Estado actualizado.');
  res.redirect('/admin/usuarios');
});

router.post('/admin/usuarios/:id/eliminar', requireAuth('usuarios'), async (req, res) => {
  const t = await target(req, res);
  if (!t) return;
  await query('DELETE FROM users WHERE id = $1', [t.id]);
  await audit(req, `Eliminó usuario ${t.email}`);
  flash(req, 'ok', 'Usuario eliminado.');
  res.redirect('/admin/usuarios');
});

router.post('/admin/solicitudes/:id/invitar', requireAuth('solicitudes'), async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const t = await query('SELECT id FROM tryouts WHERE id = $1', [parseInt(req.body.tryout_id, 10) || 0]);
  if (!t.rows[0]) {
    flash(req, 'error', 'Selecciona un tryout.');
    return res.redirect('/admin/solicitudes/' + id);
  }
  await query('INSERT INTO tryout_registrations (tryout_id, application_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [t.rows[0].id, id]);
  await query("UPDATE applications SET status = 'Invitado a tryout', updated_at = now() WHERE id = $1 AND status IN ('Recibida','En revisión','Preseleccionado')", [id]);
  await audit(req, `Invitó postulación ${id} al tryout ${t.rows[0].id}`);
  flash(req, 'ok', 'Aspirante invitado al tryout.');
  res.redirect('/admin/solicitudes/' + id);
});

router.get('/admin/inscritos', requireAuth('tryouts'), async (req, res) => {
  const r = await query(`SELECT g.id, g.attendance, t.title, t.starts_at, a.id AS app_id, a.code, a.status, a.data->>'nickname' AS nickname,
    (SELECT round(avg(e.value::numeric), 1) FROM jsonb_each_text(coalesce(a.evaluation, '{}'::jsonb)) e WHERE e.value ~ '^[0-9]+$') AS avg_score
    FROM tryout_registrations g JOIN tryouts t ON t.id = g.tryout_id JOIN applications a ON a.id = g.application_id
    ORDER BY t.starts_at DESC NULLS LAST, g.id`);
  res.render('admin/registrations', { title: 'Inscritos a tryouts', list: r.rows, attendance });
});

router.post('/admin/inscritos/:id', requireAuth('tryouts'), async (req, res) => {
  const value = attendance.includes(req.body.attendance) ? req.body.attendance : 'Invitado';
  await query('UPDATE tryout_registrations SET attendance = $1 WHERE id = $2', [value, parseInt(req.params.id, 10) || 0]);
  await audit(req, `Asistencia tryout ${req.params.id}: ${value}`);
  res.redirect('/admin/inscritos');
});

router.get('/admin/copia', requireAuth('copia'), (req, res) => {
  res.render('admin/backup', { title: 'Copia de seguridad' });
});

router.post('/admin/copia', requireAuth('copia'), async (req, res) => {
  if (req.session.user.role !== 'superadmin') {
    flash(req, 'error', 'Solo el superadministrador puede exportar copias.');
    return res.redirect('/admin/copia');
  }
  const out = { generado: new Date().toISOString() };
  for (const t of backupTables) out[t] = (await query(`SELECT * FROM ${t}`)).rows;
  out.users = (await query('SELECT id, email, role, full_name, active, created_at FROM users')).rows;
  out.media = (await query('SELECT id, filename, label, mime, press, created_at FROM media')).rows;
  await audit(req, 'Exportó copia de seguridad');
  res.set('Content-Type', 'application/json; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="imperium-copia-${new Date().toISOString().slice(0, 10)}.json"`);
  res.send(JSON.stringify(out, null, 2));
});

module.exports = router;
