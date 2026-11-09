const router = require('express').Router();
const { query } = require('../db');

router.get('/equipos', async (req, res, next) => {
  const [page, teams] = await Promise.all([query("SELECT * FROM pages WHERE slug = 'equipos'"), query('SELECT * FROM teams WHERE active ORDER BY id')]);
  if (!page.rows[0]) return next();
  res.render('teams', { title: 'Equipos competitivos | IMPERIUM ESPORTS', page: page.rows[0], teams: teams.rows });
});

router.get('/roster', async (req, res) => {
  const r = await query('SELECT * FROM players WHERE active ORDER BY category, id');
  const groups = {};
  for (const p of r.rows) (groups[p.category] = groups[p.category] || []).push(p);
  res.render('roster', { title: 'Roster oficial | IMPERIUM ESPORTS', groups });
});

router.get('/staff', async (req, res) => {
  const r = await query('SELECT * FROM staff ORDER BY sort, id');
  res.render('staff', { title: 'Staff y dirección | IMPERIUM ESPORTS', staff: r.rows });
});

module.exports = router;
