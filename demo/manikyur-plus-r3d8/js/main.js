// Запись в салон: выбрать услугу, день и время → готовое сообщение в WhatsApp.
// Данные салона подставляются при сборке в window.SALON.
const S = window.SALON;
const state = { service: null, day: 0, time: null };
const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
const dayLabel = (d, i) => (i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }));

// Занятость придумана для демо, но одинакова для всех посетителей в один день
function busy(day, h) { const x = Math.sin(day.getDate() * 31.7 + h * 7.3) * 10000; return x - Math.floor(x) < 0.4; }

const servicesEl = document.getElementById('services');
servicesEl.innerHTML = S.services.map((s, i) => `<button class="service" type="button" data-i="${i}" aria-pressed="false"><b>${s.name}</b><span class="p">${s.price}</span><span>${s.note || ''}</span></button>`).join('');
const daysEl = document.getElementById('days');
daysEl.innerHTML = days.map((d, i) => `<button type="button" data-d="${i}" aria-pressed="${i === 0}">${dayLabel(d, i)}</button>`).join('');

function renderTimes() {
  const now = new Date();
  const d = days[state.day];
  const html = [];
  for (let h = S.open; h < S.close; h++) {
    const past = state.day === 0 && h <= now.getHours();
    const off = past || busy(d, h);
    html.push(`<button type="button" data-t="${h}" ${off ? 'disabled' : ''} aria-pressed="${state.time === h}">${h}:00</button>`);
  }
  document.getElementById('times').innerHTML = html.join('');
  renderSummary();
}
function renderSummary() {
  const s = state.service != null ? S.services[state.service] : null;
  const el = document.getElementById('summary');
  el.innerHTML = s && state.time != null
    ? `<b>${s.name}</b>, ${dayLabel(days[state.day], state.day).toLowerCase()} в <b>${state.time}:00</b>`
    : 'Выберите услугу слева и удобное время';
}
servicesEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-i]'); if (!b) return;
  state.service = Number(b.dataset.i);
  servicesEl.querySelectorAll('[data-i]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  renderSummary();
});
daysEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-d]'); if (!b) return;
  state.day = Number(b.dataset.d); state.time = null;
  daysEl.querySelectorAll('[data-d]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  renderTimes();
});
document.getElementById('times').addEventListener('click', (e) => {
  const b = e.target.closest('[data-t]'); if (!b || b.disabled) return;
  state.time = Number(b.dataset.t); renderTimes();
});
document.getElementById('send').addEventListener('click', () => {
  const s = state.service != null ? S.services[state.service] : null;
  const lines = ['Здравствуйте! Хочу записаться' + (s ? ': ' + s.name : '') + '.'];
  if (state.time != null) lines.push('Удобно: ' + dayLabel(days[state.day], state.day).toLowerCase() + ' в ' + state.time + ':00.');
  window.open('https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
});
renderTimes();
