const router = require('express').Router();
const { query } = require('../db');
const { formLimiter, flash } = require('../middleware');
const { guard } = require('../captcha');

const reasons = ['Consultas generales', 'Patrocinios', 'Prensa', 'Reclutamiento', 'Colaboraciones', 'Asuntos administrativos', 'Derechos sobre datos personales'];
const pageRoutes = { nosotros: 'nosotros', comunidad: 'comunidad', terminos: 'terminos', privacidad: 'privacidad', cookies: 'cookies', conducta: 'conducta', 'politica-reclutamiento': 'politica-reclutamiento' };

router.get('/', async (req, res) => {
  const [news, tournaments, results, players, sponsors, tryouts] = await Promise.all([
    query('SELECT slug, title, summary, image, category, created_at FROM news WHERE published ORDER BY featured DESC, created_at DESC LIMIT 3'),
    query("SELECT slug, name, status, starts_at FROM tournaments WHERE status IN ('Próximamente','Inscripción abierta','En curso') ORDER BY starts_at NULLS LAST LIMIT 3"),
    query('SELECT * FROM results ORDER BY id DESC LIMIT 3'),
    query("SELECT nick, role, photo, flag FROM players WHERE active AND category = 'Jugadores titulares' ORDER BY id LIMIT 6"),
    query('SELECT name, logo, website FROM sponsors ORDER BY id LIMIT 8'),
    query('SELECT title, starts_at FROM tryouts WHERE open ORDER BY starts_at NULLS LAST LIMIT 2')
  ]);
  const s = res.locals.settings;
  const jsonld = { '@context': 'https://schema.org', '@type': 'SportsOrganization', name: 'IMPERIUM ESPORTS', alternateName: 'IMPX', slogan: 'Juntos hacia la gloria', sport: 'Free Fire', url: res.locals.siteUrl, logo: res.locals.siteUrl + '/img/logo.png', address: { '@type': 'PostalAddress', addressCountry: 'CO' }, sameAs: ['instagram', 'tiktok', 'youtube', 'discord'].map(k => s[k]).filter(Boolean) };
  res.render('home', { jsonld, title: 'IMPERIUM ESPORTS | IMPX · Free Fire LATAM Norte', news: news.rows, tournaments: tournaments.rows, results: results.rows, players: players.rows, sponsors: sponsors.rows, tryouts: tryouts.rows });
});

for (const [url, slug] of Object.entries(pageRoutes)) {
  router.get('/' + url, async (req, res, next) => {
    const r = await query('SELECT * FROM pages WHERE slug = $1', [slug]);
    if (!r.rows[0]) return next();
    res.render('page', { title: r.rows[0].title + ' | IMPERIUM ESPORTS', page: r.rows[0] });
  });
}

router.get('/preguntas-frecuentes', async (req, res) => {
  const r = await query('SELECT * FROM faqs ORDER BY sort, id');
  res.render('faq', { title: 'Preguntas frecuentes | IMPERIUM ESPORTS', faqs: r.rows });
});

router.get('/patrocinadores', async (req, res) => {
  const r = await query('SELECT * FROM sponsors ORDER BY id');
  res.render('sponsors', { title: 'Patrocinadores y alianzas | IMPERIUM ESPORTS', sponsors: r.rows });
});

router.get('/contacto', (req, res) => {
  res.render('contact', { title: 'Contacto | IMPERIUM ESPORTS', reasons, form: { reason: req.query.motivo || '' }, errors: [] });
});

router.post('/contacto', formLimiter, async (req, res) => {
  const b = req.body;
  const form = { name: (b.name || '').trim(), email: (b.email || '').trim(), reason: b.reason || '', message: (b.message || '').trim() };
  const errors = [];
  if (b.website) return res.redirect('/contacto');
  if (form.name.length < 2 || form.name.length > 100) errors.push('Escribe tu nombre.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.email.length > 150) errors.push('Correo no válido.');
  if (!reasons.includes(form.reason)) errors.push('Selecciona un motivo.');
  if (form.message.length < 10 || form.message.length > 3000) errors.push('El mensaje debe tener entre 10 y 3000 caracteres.');
  const blocked = await guard(req);
  if (blocked) errors.push(blocked);
  if (errors.length) return res.status(400).render('contact', { title: 'Contacto | IMPERIUM ESPORTS', reasons, form, errors });
  await query('INSERT INTO messages (name, email, reason, message) VALUES ($1,$2,$3,$4)', [form.name, form.email, form.reason, form.message]);
  flash(req, 'ok', 'Mensaje enviado. Te responderemos pronto.');
  res.redirect('/contacto');
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /acceso\nSitemap: ${res.locals.siteUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', async (req, res) => {
  const base = res.locals.siteUrl;
  const fixed = ['', '/nosotros', '/equipos', '/roster', '/staff', '/noticias', '/torneos', '/resultados', '/reclutamiento', '/tryouts', '/patrocinadores', '/comunidad', '/prensa', '/contacto', '/derechos', '/preguntas-frecuentes', '/terminos', '/privacidad', '/cookies', '/conducta', '/politica-reclutamiento'];
  const news = await query('SELECT slug FROM news WHERE published');
  const t = await query('SELECT slug FROM tournaments');
  const urls = [...fixed, ...news.rows.map(r => '/noticias/' + r.slug), ...t.rows.map(r => '/torneos/' + r.slug)];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
});

module.exports = router;
