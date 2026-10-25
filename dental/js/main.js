// Стоматология «Ясна»: меню, окно записи (сообщение уходит в WhatsApp клиники) и карта зубов.
// Все данные клиники — в блоке CLINIC: поменяйте здесь телефон и WhatsApp.
const CLINIC = {
  whatsapp: '74950000000',
  phone: '+7 (495) 000-00-00',
};

// Меню на телефоне
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
if (header && toggle) {
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Окно записи
const dialog = document.getElementById('booking');
if (dialog) {
  const form = dialog.querySelector('form');
  const service = form.querySelector('#b-service');

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-book]');
    if (!trigger) return;
    e.preventDefault();
    const wanted = trigger.getAttribute('data-book');
    if (wanted) {
      const option = [...service.options].find((o) => o.value === wanted);
      if (option) service.value = wanted;
    }
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.open('https://wa.me/' + CLINIC.whatsapp, '_blank');
  });

  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const lines = [
      'Здравствуйте! Хочу записаться: ' + data.get('service') + '.',
      'Удобно: ' + data.get('day') + ', ' + data.get('time') + '.',
    ];
    if (name) lines.push('Меня зовут ' + name + '.');
    const url = 'https://wa.me/' + CLINIC.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
    dialog.close();
  });
}

// Карта зубов: нажмите на зуб — покажем обычные процедуры и цены
const arch = document.getElementById('arch');
if (arch) {
  const NAMES = { 1: 'центральный резец', 2: 'боковой резец', 3: 'клык', 4: 'первый премоляр', 5: 'второй премоляр', 6: 'первый моляр', 7: 'второй моляр', 8: 'зуб мудрости' };
  const SIDES = { 1: 'верхняя челюсть, справа', 2: 'верхняя челюсть, слева', 3: 'нижняя челюсть, слева', 4: 'нижняя челюсть, справа' };
  const PRICES = {
    front: [['Лечение кариеса', 'от 6 900 ₽'], ['Художественная реставрация', 'от 9 500 ₽'], ['Лечение канала', 'от 9 000 ₽'], ['Керамический винир', 'от 38 000 ₽']],
    premolar: [['Лечение кариеса', 'от 7 500 ₽'], ['Лечение каналов, 1–2 канала', 'от 12 000 ₽'], ['Коронка из диоксида циркония', 'от 32 000 ₽'], ['Имплант под ключ', 'от 75 000 ₽']],
    molar: [['Лечение кариеса', 'от 8 500 ₽'], ['Лечение каналов, 3–4 канала', 'от 18 000 ₽'], ['Керамическая вкладка', 'от 24 000 ₽'], ['Имплант под ключ', 'от 75 000 ₽']],
    wisdom: [['Удаление', 'от 6 500 ₽'], ['Сложное удаление', 'от 12 000 ₽'], ['Снимок КЛКТ перед удалением', '3 200 ₽']],
  };
  const group = (n) => (n <= 3 ? 'front' : n <= 5 ? 'premolar' : n <= 7 ? 'molar' : 'wisdom');
  const WEIGHT = { 1: 1.0, 2: .85, 3: .95, 4: .92, 5: .92, 6: 1.25, 7: 1.2, 8: 1.12 };
  const LENGTH = { 1: 54, 2: 50, 3: 60, 4: 54, 5: 54, 6: 58, 7: 56, 8: 54 };

  const SVG = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 640 640');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Схема зубов, нумерация по международной системе');

  const card = document.getElementById('tooth-card');
  const buttons = [];

  function roundedRect(w, h, r) {
    const x = -w / 2, y = -h / 2;
    return `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  }

  function drawJaw(order, upper) {
    const cx = 320, cy = upper ? 298 : 342, rx = 236, ry = upper ? 236 : 222;
    const total = order.reduce((s, id) => s + WEIGHT[id % 10], 0);
    let acc = 0;
    order.forEach((id) => {
      const n = id % 10, w = WEIGHT[n];
      const t = (170 - 160 * (acc + w / 2) / total) * Math.PI / 180;
      acc += w;
      const x = cx + rx * Math.cos(t);
      const y = upper ? cy - ry * Math.sin(t) : cy + ry * Math.sin(t);
      const tx = -rx * Math.sin(t), ty = upper ? -ry * Math.cos(t) : ry * Math.cos(t);
      const angle = Math.atan2(ty, tx) * 180 / Math.PI;
      const width = 36 * w - 4, len = LENGTH[n];
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
      const lx = x + dx / d * (len / 2 + 16), ly = y + dy / d * (len / 2 + 16);

      const g = document.createElementNS(SVG, 'g');
      g.setAttribute('class', 'tooth');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-pressed', 'false');
      g.setAttribute('aria-label', `Зуб ${id}, ${NAMES[n]}`);
      g.dataset.id = id;
      const p = document.createElementNS(SVG, 'path');
      p.setAttribute('d', roundedRect(width, len, Math.min(12, width / 2.4)));
      p.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
      const label = document.createElementNS(SVG, 'text');
      label.setAttribute('x', lx.toFixed(1));
      label.setAttribute('y', (ly + 4).toFixed(1));
      label.setAttribute('text-anchor', 'middle');
      label.textContent = id;
      g.append(p, label);
      svg.append(g);
      buttons.push(g);
    });
  }

  drawJaw([18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], true);
  drawJaw([48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38], false);

  [['Верхняя челюсть', 300], ['Нижняя челюсть', 346]].forEach(([text, y]) => {
    const t = document.createElementNS(SVG, 'text');
    t.setAttribute('x', '320'); t.setAttribute('y', String(y));
    t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'jaw-label');
    t.textContent = text;
    svg.append(t);
  });
  arch.append(svg);

  function select(id) {
    const n = id % 10, q = Math.floor(id / 10);
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.id) === id)));
    card.querySelector('.num').textContent = `Зуб ${id}, ${SIDES[q]}`;
    card.querySelector('h3').textContent = NAMES[n][0].toUpperCase() + NAMES[n].slice(1);
    card.querySelector('ul').innerHTML = PRICES[group(n)]
      .map(([what, price]) => `<li><span>${what}</span><span>${price}</span></li>`).join('');
  }

  buttons.forEach((b) => {
    b.addEventListener('click', () => select(Number(b.dataset.id)));
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(Number(b.dataset.id)); }
    });
  });
  select(36);
}
