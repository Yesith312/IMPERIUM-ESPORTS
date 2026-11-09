const crypto = require('crypto');
const router = require('express').Router();
const { query } = require('../db');
const { formLimiter, requireAuth, audit, flash } = require('../middleware');
const { guard } = require('../captcha');

const types = ['Consulta de datos', 'Actualización', 'Corrección', 'Supresión', 'Revocación de la autorización'];
const statuses = ['Recibida', 'En trámite', 'Resuelta', 'Rechazada'];
const mailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/derechos', (req, res) => {
  res.render('rights', { title: 'Derechos sobre tus datos | IMPERIUM ESPORTS', types, form: {}, errors: [] });
});

router.post('/derechos', formLimiter, async (req, res) => {
  const b = req.body;
  const form = { type: b.type || '', name: String(b.name || '').trim().slice(0, 100), email: String(b.email || '').trim().slice(0, 150), details: String(b.details || '').trim().slice(0, 3000) };
  const errors = [];
  if (!types.includes(form.type)) errors.push('Selecciona el tipo de solicitud.');
  if (form.name.length < 3) errors.push('Escribe tu nombre completo.');
  if (!mailRe.test(form.email)) errors.push('Correo no válido.');
  if (form.details.length < 15) errors.push('Describe tu solicitud con más detalle.');
  if (!b.identity) errors.push('Debes confirmar que eres el titular de los datos o su representante.');
  if (b.website) return res.redirect('/derechos');
  const blocked = await guard(req);
  if (blocked) errors.push(blocked);
  if (errors.length) return res.status(400).render('rights', { title: 'Derechos sobre tus datos | IMPERIUM ESPORTS', types, form, errors });
  const code = 'DER-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  await query('INSERT INTO data_requests (code, type, name, email, details) VALUES ($1,$2,$3,$4,$5)', [code, form.type, form.name, form.email, form.details]);
  res.render('done', { title: 'Solicitud recibida | IMPERIUM ESPORTS', heading: 'Solicitud recibida', code, text: 'Guarda este número. Para consultar el estado necesitarás este número y tu correo.', href: '/derechos/estado', link: 'Consultar estado' });
});

router.get('/derechos/estado', (req, res) => {
  res.render('rights-status', { title: 'Estado de tu solicitud | IMPERIUM ESPORTS', result: null, searched: false });
});

router.post('/derechos/estado', formLimiter, async (req, res) => {
  const r = await query('SELECT code, type, status, answer, created_at FROM data_requests WHERE code = $1 AND lower(email) = lower($2)', [String(req.body.code || '').trim().toUpperCase().slice(0, 20), String(req.body.email || '').trim().slice(0, 150)]);
  res.render('rights-status', { title: 'Estado de tu solicitud | IMPERIUM ESPORTS', result: r.rows[0] || null, searched: true });
});

router.get('/admin/derechos', requireAuth('derechos'), async (req, res) => {
  const r = await query('SELECT * FROM data_requests ORDER BY created_at DESC LIMIT 300');
  res.render('admin/rights', { title: 'Solicitudes de derechos', list: r.rows, statuses });
});

router.post('/admin/derechos/:id', requireAuth('derechos'), async (req, res) => {
  const status = statuses.includes(req.body.status) ? req.body.status : 'Recibida';
  await query('UPDATE data_requests SET status = $1, answer = $2 WHERE id = $3', [status, String(req.body.answer || '').slice(0, 3000) || null, parseInt(req.params.id, 10) || 0]);
  await audit(req, `Actualizó solicitud de derechos ${req.params.id} a ${status}`);
  flash(req, 'ok', 'Solicitud actualizada.');
  res.redirect('/admin/derechos');
});

module.exports = router;
