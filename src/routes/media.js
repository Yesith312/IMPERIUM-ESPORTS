const router = require('express').Router();
const multer = require('multer');
const { query } = require('../db');
const { requireAuth, audit, flash } = require('../middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(file.mimetype))
});

function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return 'image/png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 0, 4) === '%PDF') return 'application/pdf';
  return null;
}

router.get('/media/:id', async (req, res, next) => {
  const r = await query('SELECT mime, data, filename FROM media WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  const m = r.rows[0];
  if (!m) return next();
  res.set('Content-Type', m.mime);
  res.set('Cache-Control', 'public, max-age=604800');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  if (m.mime === 'application/pdf') res.set('Content-Disposition', `attachment; filename="${m.filename.replace(/[^\w.-]/g, '_')}"`);
  res.send(m.data);
});

router.get('/admin/medios', requireAuth('medios'), async (req, res) => {
  const r = await query('SELECT id, filename, label, mime, press, created_at, length(data) AS size FROM media ORDER BY id DESC LIMIT 200');
  res.render('admin/media', { title: 'Biblioteca de archivos', list: r.rows });
});

router.post('/admin/medios', requireAuth('medios'), (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) {
      flash(req, 'error', err.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera 4 MB.' : 'No se pudo subir el archivo.');
      return res.redirect('/admin/medios');
    }
    next();
  });
}, async (req, res) => {
  const f = req.file;
  const real = f ? sniff(f.buffer) : null;
  if (!f || !real) {
    flash(req, 'error', 'Sube una imagen PNG, JPG, WEBP o un PDF válido.');
    return res.redirect('/admin/medios');
  }
  const label = String(req.body.label || '').slice(0, 120) || f.originalname.slice(0, 120);
  const r = await query('INSERT INTO media (filename, label, mime, data, press) VALUES ($1,$2,$3,$4,$5) RETURNING id', [f.originalname.slice(0, 150), label, real, f.buffer, !!req.body.press]);
  await audit(req, `Subió archivo ${r.rows[0].id}`);
  flash(req, 'ok', `Archivo subido. Usa la dirección /media/${r.rows[0].id}`);
  res.redirect('/admin/medios');
});

router.post('/admin/medios/:id/eliminar', requireAuth('medios'), async (req, res) => {
  await query('DELETE FROM media WHERE id = $1', [parseInt(req.params.id, 10) || 0]);
  await audit(req, `Eliminó archivo ${req.params.id}`);
  flash(req, 'ok', 'Archivo eliminado.');
  res.redirect('/admin/medios');
});

router.get('/prensa', async (req, res, next) => {
  const [page, files] = await Promise.all([
    query("SELECT * FROM pages WHERE slug = 'prensa'"),
    query('SELECT id, label, mime, filename FROM media WHERE press ORDER BY id DESC')
  ]);
  if (!page.rows[0]) return next();
  res.render('press', { title: 'Prensa y medios | IMPERIUM ESPORTS', page: page.rows[0], files: files.rows });
});

module.exports = router;
