// «Береговая»: меню и счёт за вечер — выбор бани, даты, часов, гостей и допов, итог и бронь в WhatsApp.
// Цены и номер — в блоках PLACE, BATHS и EXTRAS: поменяйте здесь, и счёт пересчитается сам.
const PLACE = { whatsapp: '79000000000', prepay: 0.3, minHours: 3, maxHours: 12 };
const BATHS = {
  izba: { name: 'Изба', weekday: 3500, weekend: 4500, included: 6, max: 10 },
  black: { name: 'Чёрная баня', weekday: 3000, weekend: 3800, included: 4, max: 6 },
  panorama: { name: 'Панорама', weekday: 2500, weekend: 3200, included: 2, max: 4 },
};
const EXTRA_GUEST = 800; // за каждого гостя сверх включённых, за весь вечер
const EXTRAS = {
  chan: { name: 'Горячий чан', price: 3500 },
  parmaster: { name: 'Парение с пармастером', price: 3000 },
  veniki: { name: 'Два веника: берёза и дуб', price: 700 },
  grill: { name: 'Мангал, дрова и решётка', price: 1000 },
  towels: { name: 'Халаты и полотенца', price: 400, perGuest: true },
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
const plural = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);

const form = document.getElementById('bill-form');
const state = { hours: 4, guests: 4 };
let message = '';

if (form) {
  // ближайшая суббота по умолчанию
  const date = form.querySelector('#v-date');
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  const iso = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  date.value = iso(d);
  date.min = iso(new Date());

  form.querySelectorAll('.stepper').forEach((st) => {
    const key = st.dataset.key;
    st.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      state[key] += Number(b.dataset.step);
      update();
    });
  });
  form.addEventListener('input', update);
  form.addEventListener('change', update);

  document.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    form.querySelector(`input[name="bath"][value="${b.dataset.pick}"]`).checked = true;
    update();
    document.getElementById('schet').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));

  document.getElementById('book').addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://wa.me/' + PLACE.whatsapp + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
  });
  update();
}

function update() {
  const data = new FormData(form);
  const bath = BATHS[data.get('bath')];
  state.hours = Math.min(PLACE.maxHours, Math.max(PLACE.minHours, state.hours));
  state.guests = Math.min(bath.max, Math.max(1, state.guests));
  form.querySelector('[data-key="hours"] output').textContent = `${state.hours} ${plural(state.hours, 'час', 'часа', 'часов')}`;
  form.querySelector('[data-key="guests"] output').textContent = `${state.guests} ${plural(state.guests, 'гость', 'гостя', 'гостей')}`;
  form.querySelector('#guests-hint').textContent = `в цене до ${bath.included}, максимум ${bath.max}`;

  const day = new Date(data.get('date') + 'T12:00:00');
  const valid = !isNaN(day);
  const weekend = valid && [0, 5, 6].includes(day.getDay());
  const rate = weekend ? bath.weekend : bath.weekday;
  const dayText = valid ? day.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }) : 'дата не выбрана';

  const lines = [[`${bath.name}, ${state.hours} ${plural(state.hours, 'час', 'часа', 'часов')} × ${rub(rate)}`, state.hours * rate]];
  const extraGuests = Math.max(0, state.guests - bath.included);
  if (extraGuests) lines.push([`Ещё ${extraGuests} ${plural(extraGuests, 'гость', 'гостя', 'гостей')} сверх ${bath.included}`, extraGuests * EXTRA_GUEST]);
  data.getAll('extra').forEach((id) => {
    const x = EXTRAS[id];
    lines.push([x.perGuest ? `${x.name}, ${state.guests} компл.` : x.name, x.perGuest ? x.price * state.guests : x.price]);
  });
  const total = lines.reduce((s, l) => s + l[1], 0);

  document.getElementById('bill-when').textContent = `${dayText}, ${weekend ? 'выходной тариф' : 'будний тариф'}`;
  document.getElementById('bill-lines').innerHTML = lines.map(([t, v]) => `<li><span>${t}</span><span>${rub(v)}</span></li>`).join('');
  document.getElementById('bill-total').textContent = rub(total);
  document.getElementById('bill-prepay').textContent = `Предоплата ${Math.round(PLACE.prepay * 100)}% — ${rub(Math.round(total * PLACE.prepay / 100) * 100)}, остальное на месте.`;

  message = [
    'Здравствуйте! Хочу забронировать баню.',
    `${bath.name}, ${dayText}, ${state.hours} ${plural(state.hours, 'час', 'часа', 'часов')}, ${state.guests} ${plural(state.guests, 'гость', 'гостя', 'гостей')}.`,
    data.getAll('extra').length ? 'Дополнительно: ' + data.getAll('extra').map((id) => EXTRAS[id].name.toLowerCase()).join(', ') + '.' : '',
    `По счёту на сайте: ${rub(total)}. Подскажите, свободно ли и с какого часа?`,
  ].filter(Boolean).join('\n');
}
