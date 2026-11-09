const router = require('express').Router();
const { query } = require('../db');

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
