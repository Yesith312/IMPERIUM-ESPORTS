const crypto = require('crypto');
const router = require('express').Router();
const { query } = require('../db');
const { formLimiter, flash } = require('../middleware');

const roles = ['IGL', 'Fragger', 'Soporte', 'Flex', 'Sniper'];
const devices = ['Celular', 'Tablet', 'Emulador en PC'];
const text = (v, max) => String(v || '').trim().slice(0, max);

router.get('/reclutamiento', (req, res) => {
  res.render('recruit', { title: 'Reclutamiento oficial | IMPERIUM ESPORTS', roles, devices, form: {}, errors: [] });
});

router.post('/reclutamiento', formLimiter, async (req, res) => {
  const b = req.body;
  if (b.website) return res.redirect('/reclutamiento');
  const form = {
    name: text(b.name, 100), age: parseInt(b.age, 10), country: text(b.country, 60), city: text(b.city, 60),
    nickname: text(b.nickname, 60), player_id: text(b.player_id, 30), rank: text(b.rank, 60),
    main_role: b.main_role, second_role: b.second_role || '', experience: text(b.experience, 1000), previous_teams: text(b.previous_teams, 300),
    availability: text(b.availability, 300), schedule: text(b.schedule, 200), device: b.device, connection: text(b.connection, 200),
    discord: text(b.discord, 80), tiktok: text(b.tiktok, 120), instagram: text(b.instagram, 120), clips: text(b.clips, 300),
    about: text(b.about, 1500), motivation: text(b.motivation, 1500)
  };
  const errors = [];
  if (form.name.length < 3) errors.push('Escribe tu nombre.');
  if (!Number.isInteger(form.age) || form.age < 16 || form.age > 80) errors.push('La edad mínima para postularse es de 16 años.');
  if (!form.country) errors.push('Indica tu país.');
  if (!form.nickname) errors.push('Indica tu nickname de Free Fire.');
  if (!/^\d{5,15}$/.test(form.player_id)) errors.push('El ID de jugador debe tener solo números (5 a 15 dígitos).');
  if (!form.rank) errors.push('Indica tu nivel y rango.');
  if (!roles.includes(form.main_role)) errors.push('Selecciona tu rol principal.');
  if (form.second_role && !roles.includes(form.second_role)) errors.push('Rol secundario no válido.');
  if (!devices.includes(form.device)) errors.push('Selecciona tu dispositivo.');
  if (!form.availability) errors.push('Indica tu disponibilidad de entrenamiento.');
  if (!form.discord) errors.push('Indica tu usuario de Discord.');
  if (form.about.length < 20) errors.push('Cuéntanos un poco más sobre ti.');
  if (form.motivation.length < 20) errors.push('Cuéntanos tu motivación para ingresar a IMPERIUM.');
  if (!b.terms) errors.push('Debes aceptar los términos de postulación.');
  if (!b.privacy) errors.push('Debes aceptar el aviso de privacidad.');
  if (!b.data_consent) errors.push('Debes autorizar el tratamiento de datos.');
  const minor = Number.isInteger(form.age) && form.age < 18;
  if (minor && !b.guardian) errors.push('Los menores de 18 años necesitan la autorización de su representante legal.');
  if (errors.length) return res.status(400).render('recruit', { title: 'Reclutamiento oficial | IMPERIUM ESPORTS', roles, devices, form: { ...form, age: b.age }, errors });

  const code = 'IMP-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  await query('INSERT INTO applications (code, data, player_id, guardian_consent) VALUES ($1,$2,$3,$4)', [code, JSON.stringify(form), form.player_id, minor ? true : false]);

  if (process.env.NOTIFY_WEBHOOK_URL) {
    fetch(process.env.NOTIFY_WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `Nueva postulación ${code} · ${form.nickname} (${form.main_role})` })
    }).catch(() => {});
  }
  res.render('recruit-done', { title: 'Solicitud recibida | IMPERIUM ESPORTS', code });
});

router.get('/reclutamiento/estado', (req, res) => {
  res.render('status', { title: 'Estado de postulación | IMPERIUM ESPORTS', result: null, searched: false });
});

router.post('/reclutamiento/estado', formLimiter, async (req, res) => {
  const code = text(req.body.code, 20).toUpperCase();
  const playerId = text(req.body.player_id, 30);
  const r = await query('SELECT code, status, updated_at FROM applications WHERE code = $1 AND player_id = $2', [code, playerId]);
  res.render('status', { title: 'Estado de postulación | IMPERIUM ESPORTS', result: r.rows[0] || null, searched: true });
});

router.get('/tryouts', async (req, res) => {
  const r = await query('SELECT * FROM tryouts ORDER BY open DESC, starts_at DESC NULLS LAST');
  res.render('tryouts', { title: 'Tryouts | IMPERIUM ESPORTS', list: r.rows });
});

module.exports = router;
