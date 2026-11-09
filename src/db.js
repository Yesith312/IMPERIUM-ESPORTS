const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const seed = require('./seed');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
});

const query = (text, params) => pool.query(text, params);

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
  await pool.query(schema);

  for (const [key, value] of Object.entries(seed.settings)) {
    await pool.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, value]);
  }
  for (const p of seed.pages) {
    await pool.query('INSERT INTO pages (slug, title, body) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING', [p.slug, p.title, p.body]);
  }
  const faqCount = await pool.query('SELECT count(*)::int AS n FROM faqs');
  if (faqCount.rows[0].n === 0) {
    for (const [i, f] of seed.faqs.entries()) {
      await pool.query('INSERT INTO faqs (question, answer, sort) VALUES ($1, $2, $3)', [f[0], f[1], i]);
    }
  }
  const staffCount = await pool.query('SELECT count(*)::int AS n FROM staff');
  if (staffCount.rows[0].n === 0) {
    for (const [i, position] of seed.staffPositions.entries()) {
      await pool.query('INSERT INTO staff (position, vacant, sort) VALUES ($1, true, $2)', [position, i]);
    }
  }
  const users = await pool.query('SELECT count(*)::int AS n FROM users');
  if (users.rows[0].n === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)', [process.env.ADMIN_EMAIL.toLowerCase(), hash, 'superadmin']);
  }
}

module.exports = { pool, query, init };
