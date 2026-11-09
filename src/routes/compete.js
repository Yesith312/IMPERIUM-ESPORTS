const router = require('express').Router();
const { query } = require('../db');

const newsCats = ['Anuncios oficiales', 'Fichajes', 'Despedidas', 'Torneos', 'Resultados', 'Comunicados', 'Comunidad'];

router.get('/noticias', async (req, res) => {
  const q = (req.query.q || '').trim().slice(0, 80);
  const cat = newsCats.includes(req.query.categoria) ? req.query.categoria : '';
  const r = await query(
    `SELECT slug, title, summary, image, category, created_at FROM news
     WHERE published AND ($1 = '' OR category = $1) AND ($2 = '' OR title ILIKE '%' || $2 || '%' OR summary ILIKE '%' || $2 || '%' OR tags ILIKE '%' || $2 || '%')
     ORDER BY featured DESC, created_at DESC LIMIT 60`, [cat, q]);
  res.render('news', { title: 'Noticias y comunicados | IMPERIUM ESPORTS', news: r.rows, cats: newsCats, q, cat });
});

router.get('/noticias/:slug', async (req, res, next) => {
  const r = await query('SELECT * FROM news WHERE slug = $1 AND published', [req.params.slug]);
  if (!r.rows[0]) return next();
  const n = r.rows[0];
  res.render('news-item', { title: n.title + ' | IMPERIUM ESPORTS', desc: n.summary || res.locals.desc, ogImage: n.image, n });
});

router.get('/torneos', async (req, res) => {
  const r = await query('SELECT * FROM tournaments ORDER BY starts_at DESC NULLS LAST');
  res.render('tournaments', { title: 'Torneos y competiciones | IMPERIUM ESPORTS', list: r.rows });
});

router.get('/torneos/:slug', async (req, res, next) => {
  const r = await query('SELECT * FROM tournaments WHERE slug = $1', [req.params.slug]);
  if (!r.rows[0]) return next();
  res.render('tournament', { title: r.rows[0].name + ' | IMPERIUM ESPORTS', t: r.rows[0] });
});

router.get('/resultados', async (req, res) => {
  const [rows, totals, players] = await Promise.all([
    query('SELECT * FROM results ORDER BY season DESC NULLS LAST, id DESC'),
    query('SELECT coalesce(sum(points),0)::int AS points, coalesce(sum(booyahs),0)::int AS booyahs, coalesce(sum(kills),0)::int AS kills, coalesce(sum(matches),0)::int AS matches FROM results'),
    query("SELECT nick, stats FROM players WHERE active AND stats IS NOT NULL AND stats <> '' ORDER BY nick")
  ]);
  res.render('results', { title: 'Resultados y estadísticas | IMPERIUM ESPORTS', rows: rows.rows, totals: totals.rows[0], players: players.rows });
});

module.exports = router;
