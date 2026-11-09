const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ejs = require('ejs');
const resources = require('../src/resources');
const { can } = require('../src/middleware');
const { barChart } = require('../src/charts');

const viewsDir = path.join(__dirname, '..', 'views');

function listViews(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? listViews(path.join(dir, e.name)) : e.name.endsWith('.ejs') ? [path.join(dir, e.name)] : []));
}

test('todas las plantillas compilan', () => {
  for (const file of listViews(viewsDir)) {
    assert.doesNotThrow(() => ejs.compile(fs.readFileSync(file, 'utf8'), { filename: file }), file);
  }
});

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
  assert.ok(!can('jugador', 'noticias'));
});

test('gráfico de barras escapa texto y omite datos vacíos', () => {
  assert.strictEqual(barChart([], 'x'), '');
  const svg = barChart([{ label: '<b>', value: 5 }], 'Prueba');
  assert.ok(svg.includes('&lt;b&gt;'));
  assert.ok(svg.startsWith('<svg'));
});

test('existen los archivos públicos obligatorios', () => {
  for (const f of ['img/logo.png', 'img/banner.jpg', 'css/style.css', 'js/main.js']) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', f)), f);
  }
});
