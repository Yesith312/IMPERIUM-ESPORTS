const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { requirePortal, flash, adminRoles } = require('../middleware');

const audiences = role => (role === 'jugador' ? ['todos', 'jugadores'] : role === 'staff' ? ['todos', 'staff'] : ['todos', 'jugadores', 'staff']);
const clean = (v, n) => String(v || '').trim().slice(0, n) || null;

router.get('/portal', requirePortal, async (req, res) => {
  const aud = audiences(req.session.user.role);
  const [me, posts, trainings, docs, tournaments] = await Promise.all([
    query('SELECT email, role, full_name, discord, phone FROM users WHERE id = $1', [req.session.user.id]),
    query('SELECT * FROM portal_posts WHERE audience = ANY($1) ORDER BY created_at DESC LIMIT 20', [aud]),
    query('SELECT * FROM trainings WHERE audience = ANY($1) AND (starts_at IS NULL OR starts_at >= now() - interval \'1 day\') ORDER BY starts_at NULLS LAST LIMIT 20', [aud]),
    query('SELECT * FROM internal_docs WHERE audience = ANY($1) ORDER BY id DESC', [aud]),
    query("SELECT slug, name, status, starts_at FROM tournaments WHERE status IN ('Próximamente','Inscripción abierta','En curso') ORDER BY starts_at NULLS LAST LIMIT 10")
  ]);
  res.render('portal/home', { title: 'Portal privado | IMPERIUM ESPORTS', me: me.rows[0], posts: posts.rows, trainings: trainings.rows, docs: docs.rows, tournaments: tournaments.rows, isAdmin: adminRoles.includes(req.session.user.role) });
});

router.get('/portal/perfil', requirePortal, async (req, res) => {
  const me = await query('SELECT email, role, full_name, discord, phone FROM users WHERE id = $1', [req.session.user.id]);
  res.render('portal/profile', { title: 'Mi perfil | IMPERIUM ESPORTS', me: me.rows[0] });
});

router.post('/portal/perfil', requirePortal, async (req, res) => {
  await query('UPDATE users SET full_name = $1, discord = $2, phone = $3 WHERE id = $4', [clean(req.body.full_name, 100), clean(req.body.discord, 80), clean(req.body.phone, 30), req.session.user.id]);
  flash(req, 'ok', 'Datos actualizados.');
  res.redirect('/portal/perfil');
});

router.post('/portal/clave', requirePortal, async (req, res) => {
  const r = await query('SELECT password_hash FROM users WHERE id = $1', [req.session.user.id]);
  const current = String(req.body.current || '');
  const next = String(req.body.next || '');
  if (!r.rows[0] || !(await bcrypt.compare(current, r.rows[0].password_hash))) {
    flash(req, 'error', 'La contraseña actual no es correcta.');
    return res.redirect('/portal/perfil');
  }
  if (next.length < 12 || next !== req.body.confirm) {
    flash(req, 'error', 'La nueva contraseña debe tener al menos 12 caracteres y coincidir con la confirmación.');
    return res.redirect('/portal/perfil');
  }
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(next, 12), req.session.user.id]);
  flash(req, 'ok', 'Contraseña actualizada.');
  res.redirect('/portal/perfil');
});

module.exports = router;
