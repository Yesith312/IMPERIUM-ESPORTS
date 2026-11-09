const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function barChart(items, title) {
  const data = items.filter(i => Number(i.value) > 0).slice(0, 10);
  if (!data.length) return '';
  const max = Math.max(...data.map(i => Number(i.value)));
  const row = 30;
  const height = data.length * row + 34;
  const bars = data.map((it, i) => {
    const y = 30 + i * row;
    const w = Math.max(4, Math.round((Number(it.value) / max) * 340));
    const label = esc(String(it.label).slice(0, 22));
    return `<text x="0" y="${y + 15}" fill="#f4f4f4" font-size="12">${label}</text><rect x="150" y="${y}" width="${w}" height="20" rx="4" fill="#d4af37"/><text x="${156 + w}" y="${y + 15}" fill="#f5d77a" font-size="12" font-weight="700">${esc(it.value)}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 600 ${height}" role="img" aria-label="${esc(title)}"><text x="0" y="14" fill="#d4af37" font-size="13" font-weight="700">${esc(title)}</text>${bars}</svg>`;
}

module.exports = { barChart, esc };
