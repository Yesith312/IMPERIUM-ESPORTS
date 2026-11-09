const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const resources = require('../src/resources');
const { can } = require("../src/middleware");

test('cada recurso del panel tiene tabla y campos', () => {
  for (const [key, cfg] of Object.entries(resources)) {
    assert.ok(cfg.table, key);
    assert.ok(cfg.fields.length > 0, key);
  }
});

test('permisos por rol', () => {
  assert.ok(can('superadmin', 'usuarios'));
  assert.ok(can('editor', 'noticias'));
  assert.ok(!can('editor', 'solicitudes'));
  assert.ok(can('reclutador', 'solicitudes'));
  assert.ok(!can('manager', 'usuarios'));
});

test('existen todas las vistas públicas obligatorias', () => {
  const views = ['home', 'page', 'faq', 'sponsors', 'contact', 'roster', 'staff', 'news', 'news-item', 'tournaments', 'tournament', 'results', 'tryouts', 'recruit', 'recruit-done', 'status', 'error'];
  for (const v of views) assert.ok(fs.existsSync(path.join(__dirname, '..', 'views', v + '.ejs')), v);
});
