// «Пипетка»: каталог с фильтрами, карточка товара и список покупок, который уходит в WhatsApp магазина.
// Данные — в js/catalog.js. Список хранится только в этом браузере, оплаты на сайте нет.

const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';
const plural = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);
const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

// Цвет потемнее для крышек и надписей
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - f)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
function tint(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * 0.55));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Рисунок упаковки: форма из каталога, цвет бренда, белая этикетка с названием
function pack(p) {
  const b = BRANDS[p.brand];
  const body = b.color, cap = shade(b.color, 0.45), ink = shade(b.color, 0.7);
  const label = (y, h, w = 50) => `<rect x="${60 - w / 2}" y="${y}" width="${w}" height="${h}" rx="4" fill="#fff" opacity=".92"/>
    <text x="60" y="${y + h / 2 - 2}" text-anchor="middle" font-family="Rubik, sans-serif" font-size="8" font-weight="600" fill="${ink}">${b.name}</text>
    <rect x="${60 - w / 2 + 8}" y="${y + h / 2 + 4}" width="${w - 16}" height="2.5" rx="1" fill="${ink}" opacity=".35"/>`;
  const shapes = {
    bottle: `<rect x="46" y="12" width="28" height="24" rx="5" fill="${cap}"/><rect x="50" y="34" width="20" height="16" fill="${shade(body, 0.12)}"/>
      <rect x="30" y="46" width="60" height="104" rx="13" fill="${body}"/>${label(82, 34)}`,
    dropper: `<ellipse cx="60" cy="30" rx="12" ry="20" fill="${ink}"/><rect x="47" y="44" width="26" height="18" rx="3" fill="${cap}"/>
      <rect x="34" y="60" width="52" height="90" rx="13" fill="${body}"/>${label(90, 32, 44)}`,
    jar: `<rect x="18" y="58" width="84" height="30" rx="9" fill="${cap}"/><rect x="22" y="84" width="76" height="66" rx="15" fill="${body}"/>${label(100, 30, 54)}`,
    tube: `<path d="M26 16 H94 L82 126 H38 Z" fill="${body}"/><path d="M26 16 H94" stroke="${shade(body, 0.2)}" stroke-width="6"/>
      <rect x="40" y="124" width="40" height="28" rx="5" fill="${cap}"/>${label(54, 32, 46)}`,
    pump: `<rect x="40" y="18" width="34" height="11" rx="3" fill="${cap}"/><rect x="72" y="21" width="20" height="6" rx="2" fill="${cap}"/>
      <rect x="55" y="28" width="10" height="16" fill="${cap}"/><rect x="47" y="42" width="26" height="16" rx="3" fill="${shade(body, 0.12)}"/>
      <rect x="30" y="56" width="60" height="94" rx="15" fill="${body}"/>${label(88, 34)}`,
    stick: `<rect x="40" y="14" width="40" height="40" rx="17" fill="${cap}"/><rect x="40" y="48" width="40" height="102" rx="12" fill="${body}"/>${label(84, 32, 34)}`,
    sachet: `<rect x="20" y="18" width="80" height="128" rx="8" fill="${body}"/><path d="M20 30 H100" stroke="${shade(body, 0.2)}" stroke-width="2" stroke-dasharray="4 3"/>
      <path d="M20 134 H100" stroke="${shade(body, 0.2)}" stroke-width="2" stroke-dasharray="4 3"/>${label(66, 34, 58)}`,
  };
  return `<svg viewBox="0 0 120 160" aria-hidden="true">${shapes[p.shape]}</svg>`;
}

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

// Фильтры
const state = { cat: null, brand: null, skin: null, price: null, q: '', sort: 'pop' };
const PRICES = { low: ['до 1 000 ₽', (p) => p < 1000], mid: ['1 000–2 000 ₽', (p) => p >= 1000 && p <= 2000], high: ['от 2 000 ₽', (p) => p > 2000] };

function chips(el, entries, key) {
  el.innerHTML = entries.map(([v, label]) => `<button type="button" class="chip" data-key="${key}" data-value="${v}" aria-pressed="false">${label}</button>`).join('');
}
chips(document.getElementById('f-cat'), Object.entries(CATEGORIES), 'cat');
chips(document.getElementById('f-brand'), Object.entries(BRANDS).map(([k, b]) => [k, b.name]), 'brand');
chips(document.getElementById('f-skin'), Object.entries(SKINS), 'skin');
chips(document.getElementById('f-price'), Object.entries(PRICES).map(([k, v]) => [k, v[0]]), 'price');

function matches(p) {
  if (state.cat && p.cat !== state.cat) return false;
  if (state.brand && p.brand !== state.brand) return false;
  if (state.skin && !p.skin.includes(state.skin) && !p.skin.includes('all')) return false;
  if (state.price && !PRICES[state.price][1](p.price)) return false;
  if (state.q) {
    const hay = (p.name + ' ' + BRANDS[p.brand].name + ' ' + CATEGORIES[p.cat]).toLowerCase();
    if (!state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

const grid = document.getElementById('grid');
function render() {
  let list = PRODUCTS.filter(matches);
  if (state.sort === 'cheap') list = [...list].sort((a, b) => a.price - b.price);
  else if (state.sort === 'expensive') list = [...list].sort((a, b) => b.price - a.price);
  else list = [...list].sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0) || a.id - b.id);

  document.querySelectorAll('.filters .chip, .skin-pick .chip').forEach((c) => {
    c.setAttribute('aria-pressed', String(state[c.dataset.key] === c.dataset.value));
  });
  document.getElementById('found').textContent = `Найдено ${list.length} ${plural(list.length, 'средство', 'средства', 'средств')}`;
  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><b>Таких средств пока нет</b><span>Попробуйте убрать один из фильтров или напишите нам — подберём похожее.</span><button class="btn btn-line btn-small" type="button" data-reset>Сбросить фильтры</button></div>`;
    return;
  }
  grid.innerHTML = list.map((p) => {
    const b = BRANDS[p.brand];
    const inList = basket.has(p.id);
    return `<article class="card">
      <button class="pic" type="button" style="--tint:${tint(b.color)}" data-open="${p.id}" aria-label="Подробнее: ${p.name}">${pack(p)}${p.tag ? `<span class="tag${p.tag === 'Новинка' ? ' new' : ''}">${p.tag}</span>` : ''}</button>
      <div class="body">
        <span class="brand">${b.name}, ${b.country}</span>
        <h3><button type="button" data-open="${p.id}">${p.name}</button></h3>
        <span class="vol">${p.volume}</span>
        <div class="row"><span class="price">${rub(p.price)}</span><button class="add${inList ? ' in' : ''}" type="button" data-add="${p.id}" aria-pressed="${inList}">${inList ? 'В списке' : 'В список'}</button></div>
      </div>
    </article>`;
  }).join('');
}

document.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip[data-key]');
  if (chip) {
    const { key, value } = chip.dataset;
    state[key] = state[key] === value ? null : value;
    render();
    if (chip.closest('.skin-pick')) document.getElementById('katalog').scrollIntoView({ behavior: smooth() });
    return;
  }
  const tile = e.target.closest('[data-brand-tile]');
  if (tile) {
    Object.assign(state, { cat: null, skin: null, price: null, q: '', brand: tile.dataset.brandTile });
    document.getElementById('q').value = '';
    render();
    document.getElementById('katalog').scrollIntoView({ behavior: smooth() });
    return;
  }
  if (e.target.closest('[data-reset]')) {
    Object.assign(state, { cat: null, brand: null, skin: null, price: null, q: '' });
    document.getElementById('q').value = '';
    render();
    return;
  }
  const add = e.target.closest('[data-add]');
  if (add) { toggleItem(Number(add.dataset.add)); return; }
  const open = e.target.closest('[data-open]');
  if (open) { openProduct(Number(open.dataset.open)); return; }
  if (e.target.closest('[data-list]')) { openList(); }
});
document.getElementById('q').addEventListener('input', (e) => { state.q = e.target.value.trim(); render(); });
document.getElementById('sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

// Бренды
document.getElementById('brands').innerHTML = Object.entries(BRANDS).map(([k, b]) => {
  const n = PRODUCTS.filter((p) => p.brand === k).length;
  return `<button class="brand-tile" type="button" style="--c:${b.color}" data-brand-tile="${k}"><b>${b.name}</b><span>${b.country}, ${n} ${plural(n, 'средство', 'средства', 'средств')}</span></button>`;
}).join('');

// Список покупок — хранится в этом браузере, если браузер разрешает
const basket = new Map();
try { (JSON.parse(localStorage.getItem('pipetka-list')) || []).forEach(([id, q]) => byId.has(id) && basket.set(id, q)); } catch (err) { /* без сохранения */ }
function save() {
  try { localStorage.setItem('pipetka-list', JSON.stringify([...basket])); } catch (err) { /* без сохранения */ }
  const n = [...basket.values()].reduce((s, q) => s + q, 0);
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = n; });
}
function toggleItem(id) {
  if (basket.has(id)) basket.delete(id); else basket.set(id, 1);
  save(); render();
  const pd = document.getElementById('product');
  if (pd.open && Number(pd.dataset.id) === id) fillProduct(id);
}

// Карточка товара
const productDialog = document.getElementById('product');
function fillProduct(id) {
  const p = byId.get(id), b = BRANDS[p.brand];
  productDialog.dataset.id = id;
  productDialog.querySelector('.pic').style.setProperty('--tint', tint(b.color));
  productDialog.querySelector('.pic').innerHTML = pack(p);
  productDialog.querySelector('.brand').textContent = `${b.name}, ${b.country}`;
  productDialog.querySelector('h2').textContent = p.name;
  productDialog.querySelector('.price').textContent = `${rub(p.price)}, ${p.volume}`;
  productDialog.querySelector('[data-about]').textContent = p.about;
  productDialog.querySelector('[data-skin]').textContent = p.skin.includes('all') ? 'любая кожа' : p.skin.map((s) => SKINS[s]).join(', ');
  productDialog.querySelector('[data-how]').textContent = HOW_TO[p.cat];
  const btn = productDialog.querySelector('[data-add]');
  btn.dataset.add = id;
  btn.textContent = basket.has(id) ? 'Убрать из списка' : 'Добавить в список';
  btn.className = basket.has(id) ? 'btn btn-line' : 'btn btn-cobalt';
}
function openProduct(id) {
  fillProduct(id);
  if (typeof productDialog.showModal === 'function') productDialog.showModal();
}
productDialog.querySelector('.x').addEventListener('click', () => productDialog.close());
productDialog.addEventListener('click', (e) => { if (e.target === productDialog) productDialog.close(); });

// Окно списка
const drawer = document.getElementById('list');
const dform = drawer.querySelector('form');
function renderList() {
  const items = drawer.querySelector('.items');
  if (!basket.size) {
    items.innerHTML = `<div class="none"><b>Список пока пустой</b><span>Нажмите «В список» у нужных средств в каталоге, и они появятся здесь.</span></div>`;
  } else {
    items.innerHTML = [...basket].map(([id, q]) => {
      const p = byId.get(id), b = BRANDS[p.brand];
      return `<div class="item"><span class="mini" style="--tint:${tint(b.color)}">${pack(p)}</span>
        <div><b>${p.name}</b><small>${b.name}, ${rub(p.price)}</small></div>
        <div class="qty"><button type="button" data-q="${id}" data-d="-1" aria-label="Меньше">−</button><output>${q}</output><button type="button" data-q="${id}" data-d="1" aria-label="Больше">+</button></div></div>`;
    }).join('');
  }
  const sub = [...basket].reduce((s, [id, q]) => s + byId.get(id).price * q, 0);
  const how = new FormData(dform).get('how');
  const delivery = how === 'delivery' && sub > 0 && sub < SHOP.freeDeliveryFrom ? SHOP.deliveryPrice : 0;
  drawer.querySelector('[data-sub]').textContent = rub(sub);
  drawer.querySelector('[data-del]').textContent = how === 'delivery' ? (delivery ? rub(delivery) : 'бесплатно') : 'самовывоз';
  drawer.querySelector('[data-total]').textContent = rub(sub + delivery);
  drawer.querySelector('[data-send]').disabled = !basket.size;
  return { sub, delivery, how };
}
function openList() {
  renderList();
  if (typeof drawer.showModal === 'function') drawer.showModal();
}
drawer.querySelector('.x').addEventListener('click', () => drawer.close());
drawer.addEventListener('click', (e) => {
  if (e.target === drawer) { drawer.close(); return; }
  const b = e.target.closest('[data-q]');
  if (!b) return;
  const id = Number(b.dataset.q);
  const q = (basket.get(id) || 0) + Number(b.dataset.d);
  if (q <= 0) basket.delete(id); else basket.set(id, q);
  save(); renderList(); render();
});
dform.addEventListener('change', renderList);
dform.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!basket.size) return;
  const { sub, delivery, how } = renderList();
  const lines = ['Здравствуйте! Хочу заказать:'];
  [...basket].forEach(([id, q]) => {
    const p = byId.get(id);
    lines.push(`— ${BRANDS[p.brand].name}, ${p.name}, ${p.volume} × ${q} = ${rub(p.price * q)}`);
  });
  lines.push(`Итого: ${rub(sub + delivery)}${delivery ? ` (с доставкой ${rub(delivery)})` : ''}.`);
  if (how === 'delivery') lines.push('Нужна доставка по Москве, адрес напишу.');
  else lines.push('Заберу в магазине: ' + SHOP.stores[Number(how)] + '.');
  const name = String(new FormData(dform).get('name') || '').trim();
  if (name) lines.push('Меня зовут ' + name + '.');
  window.open('https://wa.me/' + SHOP.whatsapp + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
});

save();
render();
