const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { query } = require('./db');

const formLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: 'Demasiados envíos. Inténtalo más tarde.' });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: 'Demasiados intentos. Espera 15 minutos.' });

let settingsCache = { at: 0, value: {} };
async function loadSettings() {
  if (Date.now() - settingsCache.at < 30000) return settingsCache.value;
  const rows = await query('SELECT key, value FROM settings');
  settingsCache = { at: Date.now(), value: Object.fromEntries(rows.rows.map(r => [r.key, r.value])) };
  return settingsCache.value;
}
const clearSettingsCache = () => { settingsCache.at = 0; };

async function locals(req, res, next) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  res.locals.csrf = req.session.csrf;
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  res.locals.settings = await loadSettings();
  res.locals.siteUrl = process.env.SITE_URL || '';
  res.locals.path = req.path;
  res.locals.resources = require('./resources');
  res.locals.can = can;
  res.locals.barChart = require('./charts').barChart;
  res.locals.turnstileKey = process.env.TURNSTILE_SITE_KEY || '';
  res.locals.desc = 'IMPERIUM ESPORTS (IMPX): organización de esports de Free Fire en LATAM Norte. Juntos hacia la gloria.';
  res.locals.fmt = d => d ? new Date(d).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }) : '';
  res.locals.fmtDate = d => d ? new Date(d).toLocaleDateString('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' }) : '';
  next();
}

function csrf(req, res, next) {
  if (req.method === 'POST') {
    const sent = (req.body && req.body._csrf) || req.query._csrf;
    if (!sent || sent !== req.session.csrf) return res.status(403).render('error', { title: 'Solicitud no válida', message: 'La sesión expiró. Vuelve atrás y recarga la página.' });
  }
  next();
}

const permissions = {
  superadmin: ['*'],
  admin: ['*'],
  editor: ['noticias', 'paginas', 'faqs', 'patrocinadores', 'mensajes', 'medios'],
  manager: ['jugadores', 'staff', 'torneos', 'resultados', 'estadisticas', 'equipos', 'tryouts', 'comunicados', 'entrenamientos', 'docs', 'medios'],
  reclutador: ['solicitudes', 'tryouts', 'mensajes']
};
const adminRoles = ['superadmin', 'admin', 'editor', 'manager', 'reclutador'];
const allRoles = [...adminRoles, 'jugador', 'staff'];
const can = (role, area) => !!permissions[role] && (permissions[role].includes('*') || permissions[role].includes(area));

function requireAuth(area) {
  return (req, res, next) => {
    const u = req.session.user;
    if (!u) return res.redirect('/acceso');
    if (!adminRoles.includes(u.role)) return res.redirect('/portal');
    if (area && !can(u.role, area)) return res.status(403).render('error', { title: 'Sin permiso', message: 'Tu rol no tiene acceso a esta sección.' });
    next();
  };
}

function requirePortal(req, res, next) {
  if (!req.session.user) return res.redirect('/acceso');
  next();
}

async function audit(req, action) {
  const email = req.session.user ? req.session.user.email : null;
  await query('INSERT INTO audit_log (user_email, action) VALUES ($1, $2)', [email, action]);
}

function flash(req, type, text) { req.session.flash = { type, text }; }

module.exports = { formLimiter, loginLimiter, locals, csrf, requireAuth, requirePortal, can, audit, flash, clearSettingsCache, adminRoles, allRoles };
