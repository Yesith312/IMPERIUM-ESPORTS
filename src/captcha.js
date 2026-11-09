async function verifyCaptcha(req) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const token = req.body['cf-turnstile-response'];
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: req.ip })
    });
    const j = await r.json();
    return !!j.success;
  } catch (e) {
    return false;
  }
}

async function guard(req) {
  const t = parseInt(req.body._t, 10);
  const age = Date.now() - t;
  if (!Number.isFinite(t) || age < 3000 || age > 6 * 3600 * 1000) return 'Espera unos segundos e inténtalo de nuevo.';
  if (!(await verifyCaptcha(req))) return 'No pudimos verificar que eres una persona. Inténtalo de nuevo.';
  return null;
}

module.exports = { guard };
