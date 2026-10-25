// «Ладно»: меню, конструктор кухни с ценой, фильтр работ и заявка на замер (сообщение уходит в WhatsApp).
// Цены и номер — в блоках SHOP и RATES: поменяйте здесь, и конструктор пересчитает всё сам.
const SHOP = { whatsapp: '74950000000' };
const RATES = {
  facade: { ldsp: 38000, mdf: 58000, veneer: 78000 },   // нижние шкафы за метр, с фурнитурой
  top: { ldsp: 0, quartz: 18000, ceramic: 26000 },       // доплата за метр столешницы
  upper: 0.45,                                           // верхний ряд: доля от цены нижнего
  island: 1.8,                                           // длина острова, м
};
const NAMES = {
  layout: { line: 'прямая', corner: 'угловая', u: 'П-образная', island: 'с островом' },
  facade: { ldsp: 'ЛДСП', mdf: 'МДФ эмаль', veneer: 'шпон дуба' },
  top: { ldsp: 'ЛДСП', quartz: 'кварц', ceramic: 'керамика' },
};

// Меню на телефоне
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
if (header && toggle) {
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  header.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => header.classList.remove('open')));
}

const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';
const metres = (n) => n.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' м';
const round5k = (n) => Math.round(n / 5000) * 5000;

// Конструктор кухни
const form = document.getElementById('builder');
const svg = document.getElementById('plan-svg');
let lastSummary = '';

function runs(layout, L) {
  const snap = (x) => Math.max(1.2, Math.round(x / 0.3) * 0.3);
  if (layout === 'corner') { const a = snap(L * 0.6); return { a, b: +(L - a).toFixed(1) }; }
  if (layout === 'u') { const a = snap(L * 0.4); const b = snap((L - a) / 2); return { a, b, c: +(L - a - b).toFixed(1) }; }
  return { a: L };
}

function draw(layout, L, upper) {
  const r = runs(layout, L);
  const d = 0.6;
  const vertical = Math.max(r.b || 0, r.c || 0, layout === 'island' ? d + 1.1 + 0.9 : d);
  const k = Math.min(560 / r.a, 380 / vertical, 190);
  const x0 = 40, y0 = 48;
  const s = [];

  // стены
  let wall = `M${x0 - 4},${y0 - 4}H${x0 + r.a * k + 4}`;
  if (r.b) wall = `M${x0 - 4},${y0 + r.b * k}V${y0 - 4}H${x0 + r.a * k + 4}`;
  if (r.c) wall += `V${y0 + r.c * k}`;
  s.push(`<path class="wall" d="${wall}"/>`);

  const modules = (len, place) => {
    let pos = 0;
    while (pos < len - 0.05) {
      const w = Math.min(0.6, len - pos);
      place(pos, w);
      pos += w;
    }
  };
  // нижние модули по 60 см
  modules(r.a, (p, w) => s.push(`<rect class="module" x="${x0 + p * k}" y="${y0}" width="${w * k}" height="${d * k}"/>`));
  if (r.b) modules(r.b - d, (p, w) => s.push(`<rect class="module" x="${x0}" y="${y0 + (d + p) * k}" width="${d * k}" height="${w * k}"/>`));
  if (r.c) modules(r.c - d, (p, w) => s.push(`<rect class="module" x="${x0 + (r.a - d) * k}" y="${y0 + (d + p) * k}" width="${d * k}" height="${w * k}"/>`));
  // верхний ряд — пунктиром поверх нижнего, глубина 35 см
  if (upper) {
    s.push(`<rect class="module upper" x="${x0}" y="${y0}" width="${r.a * k}" height="${0.35 * k}"/>`);
    if (r.b) s.push(`<rect class="module upper" x="${x0}" y="${y0 + d * k}" width="${0.35 * k}" height="${(r.b - d) * k}"/>`);
    if (r.c) s.push(`<rect class="module upper" x="${x0 + r.a * k - 0.35 * k}" y="${y0 + d * k}" width="${0.35 * k}" height="${(r.c - d) * k}"/>`);
  }

  // мойка и варочная панель на основной стене
  const sinkX = x0 + Math.max(0.9, r.a * 0.3) * k;
  s.push(`<rect class="sink" x="${sinkX - 0.25 * k}" y="${y0 + 0.12 * k}" width="${0.5 * k}" height="${0.38 * k}" rx="${0.08 * k}"/>`);
  const hobX = x0 + Math.min(r.a - 0.5, r.a * 0.72) * k;
  [[-0.12, 0.2], [0.12, 0.2], [-0.12, 0.42], [0.12, 0.42]].forEach(([dx, dy]) =>
    s.push(`<circle class="hob" cx="${hobX + dx * k}" cy="${y0 + dy * k}" r="${0.075 * k}"/>`));

  // остров
  if (layout === 'island') {
    const iw = RATES.island;
    s.push(`<rect class="island" x="${x0 + (r.a - iw) / 2 * k}" y="${y0 + (d + 1.1) * k}" width="${iw * k}" height="${0.9 * k}"/>`);
    s.push(`<text class="dim" x="${x0 + r.a / 2 * k}" y="${y0 + (d + 1.1 + 0.9) * k + 22}" text-anchor="middle">остров ${metres(iw)}</text>`);
  }

  // размеры
  s.push(`<line class="dimline" x1="${x0}" y1="${y0 - 22}" x2="${x0 + r.a * k}" y2="${y0 - 22}"/>`);
  s.push(`<text class="dim" x="${x0 + r.a * k / 2}" y="${y0 - 28}" text-anchor="middle">${metres(r.a)}</text>`);
  if (r.b) s.push(`<text class="dim" x="${x0 - 12}" y="${y0 + r.b * k / 2}" text-anchor="middle" transform="rotate(-90 ${x0 - 12} ${y0 + r.b * k / 2})">${metres(r.b)}</text>`);
  if (r.c) s.push(`<text class="dim" x="${x0 + r.a * k + 16}" y="${y0 + r.c * k / 2}" text-anchor="middle" transform="rotate(90 ${x0 + r.a * k + 16} ${y0 + r.c * k / 2})">${metres(r.c)}</text>`);

  const h = Math.ceil(y0 + vertical * k + (layout === 'island' ? 40 : 24));
  svg.setAttribute('viewBox', `0 0 640 ${Math.max(220, h)}`);
  svg.innerHTML = s.join('');
  return r;
}

function update() {
  if (!form) return;
  const data = new FormData(form);
  const layout = data.get('layout');
  const facade = data.get('facade');
  const top = data.get('top');
  // П-образной кухне нужно хотя бы 3,6 м, иначе на боковые стены не хватит модулей
  const range = form.querySelector('#b-length');
  range.min = layout === 'u' ? '3.6' : '2.4';
  if (Number(range.value) < Number(range.min)) range.value = range.min;
  const L = Number(range.value);
  const upper = data.get('upper') === 'on';
  form.querySelector('output[for="b-length"]').textContent = metres(L);

  draw(layout, L, upper);
  const perMetre = RATES.facade[facade] + RATES.top[top];
  let total = L * perMetre + (upper ? L * RATES.facade[facade] * RATES.upper : 0);
  if (layout === 'island') total += RATES.island * perMetre * 1.1;
  const low = round5k(total * 0.92), high = round5k(total * 1.12);

  const thousands = (n) => (n / 1000).toLocaleString('ru-RU');
  const millions = (n) => (n / 1e6).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('sum').textContent = high >= 1e6
    ? `${millions(low)}–${millions(high)} млн ₽`
    : `${thousands(low)}–${thousands(high)} тыс. ₽`;
  document.getElementById('detail').textContent =
    `Кухня ${NAMES.layout[layout]}, ${metres(L)} по стенам, фасады ${NAMES.facade[facade]}, столешница ${NAMES.top[top]}${upper ? ', с верхним рядом' : ', без верхнего ряда'}. Без техники и мойки.`;
  lastSummary = `Кухня ${NAMES.layout[layout]}, ${metres(L)}, фасады ${NAMES.facade[facade]}, столешница ${NAMES.top[top]}, ${upper ? 'с верхними шкафами' : 'без верхних шкафов'}. Расчёт на сайте: ${rub(low)} – ${rub(high)}.`;
  document.querySelectorAll('[data-plan-label]').forEach((el) => { el.textContent = NAMES.layout[layout]; });
}
if (form) { form.addEventListener('input', update); update(); }

// Фильтр работ
const filterButtons = [...document.querySelectorAll('.filter button')];
filterButtons.forEach((b) => b.addEventListener('click', () => {
  filterButtons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  const type = b.dataset.type;
  document.querySelectorAll('.gallery figure').forEach((f) => { f.hidden = type !== 'all' && f.dataset.type !== type; });
}));

// Заявка на замер
const dialog = document.getElementById('booking');
if (dialog) {
  const dform = dialog.querySelector('form');
  const what = dform.querySelector('#z-what');
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-book]');
    if (!t) return;
    e.preventDefault();
    if (t.dataset.book) what.value = t.dataset.book;
    dform.dataset.withPlan = t.hasAttribute('data-with-plan') ? '1' : '';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.open('https://wa.me/' + SHOP.whatsapp, '_blank');
  });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dform.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(dform);
    const lines = ['Здравствуйте! Нужен бесплатный замер: ' + d.get('what') + '.'];
    if (dform.dataset.withPlan && lastSummary) lines.push(lastSummary);
    const place = String(d.get('place') || '').trim();
    if (place) lines.push('Где: ' + place + '.');
    lines.push('Удобно: ' + d.get('when') + '.');
    const name = String(d.get('name') || '').trim();
    if (name) lines.push('Меня зовут ' + name + '.');
    window.open('https://wa.me/' + SHOP.whatsapp + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    dialog.close();
  });
}
