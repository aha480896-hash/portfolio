// «Липа»: меню, состав средств и заявка на опт (сообщение уходит в WhatsApp бренда).
// Всё, что меняет владелец, — в блоках BRAND и PRODUCTS.
const BRAND = {
  whatsapp: '79000000000',
  wildberries: 'https://www.wildberries.ru/',
  ozon: 'https://www.ozon.ru/',
};

// Состав: доля в процентах, цвет полоски и зачем ингредиент нужен
const PRODUCTS = {
  face: { name: 'Крем для лица «Липовый цвет»', volume: '50 мл, для сухой и нормальной кожи', parts: [
    ['Настой липового цвета', 62, '#d7de8c', 'Основа крема вместо обычной воды, успокаивает раздражение'],
    ['Масло ши', 12, '#e8dcc2', 'Питает и не даёт коже шелушиться'],
    ['Масло жожоба', 8, '#f0c66b', 'Близко к собственному жиру кожи, впитывается без плёнки'],
    ['Растительный эмульгатор', 7, '#c6d8be', 'Соединяет воду и масла в крем'],
    ['Глицерин', 5, '#d2cdea', 'Притягивает и удерживает влагу'],
    ['Пантенол', 3, '#ebc2b7', 'Помогает коже быстрее заживать'],
    ['Консервант', 2, '#b9b4a6', 'Даёт крему простоять 6 месяцев'],
    ['Витамин Е', 1, '#f6d98f', 'Защищает масла от прогоркания'],
  ] },
  lips: { name: 'Бальзам для губ «Липовый мёд»', volume: '10 г, в металлической баночке', parts: [
    ['Масло ши', 40, '#e8dcc2', 'Мягкость и защита от ветра'],
    ['Пчелиный воск', 25, '#f0c66b', 'Держит форму и создаёт защитный слой'],
    ['Масло сладкого миндаля', 20, '#d7de8c', 'Питает трещинки'],
    ['Липовый мёд', 10, '#f6d98f', 'Заживляет и даёт лёгкий вкус'],
    ['Витамин Е', 5, '#ebc2b7', 'Защищает масла от окисления'],
  ] },
  oil: { name: 'Масло для тела «Медовое»', volume: '100 мл, с дозатором', parts: [
    ['Масло абрикосовой косточки', 45, '#f0c66b', 'Лёгкое, быстро впитывается'],
    ['Масло жожоба', 25, '#e8dcc2', 'Смягчает сухие участки'],
    ['Масло календулы', 20, '#d7de8c', 'Успокаивает кожу после бритья и эпиляции'],
    ['Экстракт липового цвета в масле', 8, '#c6d8be', 'Мягкий аромат и успокаивающее действие'],
    ['Витамин Е', 2, '#ebc2b7', 'Сохраняет масло свежим'],
  ] },
  hands: { name: 'Крем для рук «Овёс и липа»', volume: '75 мл, туба', parts: [
    ['Настой липового цвета', 58, '#d7de8c', 'Основа крема'],
    ['Овсяное молочко', 12, '#e8dcc2', 'Снимает сухость и стянутость после мытья рук'],
    ['Масло подсолнечника', 10, '#f0c66b', 'Питает и смягчает'],
    ['Растительный эмульгатор', 8, '#c6d8be', 'Делает текстуру кремом'],
    ['Глицерин', 7, '#d2cdea', 'Удерживает влагу'],
    ['Аллантоин', 3, '#ebc2b7', 'Заживляет мелкие трещины'],
    ['Консервант', 2, '#b9b4a6', 'Даёт крему простоять 6 месяцев'],
  ] },
  mask: { name: 'Маска «Зелёная глина»', volume: '60 г, для жирной и комбинированной кожи', parts: [
    ['Зелёная глина', 70, '#c6d8be', 'Вытягивает лишний жир и сужает поры'],
    ['Порошок липового цвета', 15, '#d7de8c', 'Смягчает действие глины'],
    ['Овсяная мука', 10, '#e8dcc2', 'Успокаивает и не даёт пересушить кожу'],
    ['Порошок ромашки', 5, '#f0c66b', 'Снимает покраснения'],
  ] },
  soap: { name: 'Мыло «Липа и мята»', volume: '100 г, варим вручную', parts: [
    ['Оливковое масло', 35, '#d7de8c', 'Мягкое мыло, которое не сушит'],
    ['Кокосовое масло', 25, '#e8dcc2', 'Даёт пену'],
    ['Масло ши', 15, '#f0c66b', 'Остаётся в мыле и смягчает кожу'],
    ['Настой липового цвета', 20, '#c6d8be', 'Вместо воды при варке'],
    ['Масло мяты', 5, '#d2cdea', 'Свежий запах и лёгкий холодок'],
  ] },
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

// Ссылки на маркетплейсы — из блока BRAND
document.querySelectorAll('[data-mp]').forEach((a) => {
  const url = BRAND[a.dataset.mp];
  if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
});

// Состав
const formula = document.getElementById('formula');
const chips = [...document.querySelectorAll('.chip')];
function showFormula(id) {
  const p = PRODUCTS[id];
  if (!p || !formula) return;
  chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.id === id)));
  formula.querySelector('h3').textContent = p.name;
  const n = p.parts.length;
  const word = n % 10 === 1 && n % 100 !== 11 ? 'ингредиент' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'ингредиента' : 'ингредиентов';
  formula.querySelector('.sub').textContent = p.volume + ', ' + n + ' ' + word;
  formula.querySelector('.bar').innerHTML = p.parts
    .map(([n, pct, color]) => `<span style="flex-basis:${pct}%;background:${color}" title="${n}, ${pct}%"></span>`).join('');
  formula.querySelector('.ingredients').innerHTML = p.parts
    .map(([n, pct, color, why]) => `<li><span class="dot" style="background:${color}"></span><b>${n}</b><span class="pct">${pct}%</span><small>${why}</small></li>`).join('');
}
chips.forEach((c) => c.addEventListener('click', () => showFormula(c.dataset.id)));
document.querySelectorAll('[data-inside]').forEach((b) => b.addEventListener('click', () => {
  showFormula(b.dataset.inside);
  document.getElementById('sostav').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}));
showFormula('face');

// Заявка на опт и сотрудничество
const opt = document.getElementById('opt-form');
if (opt) {
  opt.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(opt);
    const lines = ['Здравствуйте! Пишу по поводу: ' + d.get('who') + '.'];
    const name = String(d.get('name') || '').trim();
    const place = String(d.get('place') || '').trim();
    if (name) lines.push('Меня зовут ' + name + '.');
    if (place) lines.push('Магазин, салон или блог: ' + place + '.');
    window.open('https://wa.me/' + BRAND.whatsapp + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
}
