// Портфолио: меню на телефоне и заявка, которая собирается в готовое сообщение.
// Контакты — в блоке CONTACT. Пока номер WhatsApp пустой, кнопки WhatsApp скрыты,
// а заявка копирует текст и открывает Telegram.
const CONTACT = {
  telegram: 'ne_7Grace',   // ник без @
  whatsapp: '79775760568', // номер только цифрами, начиная с 7
};

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
if (header && toggle) {
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  header.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => header.classList.remove('open')));
}

const tgUrl = 'https://t.me/' + CONTACT.telegram;
document.querySelectorAll('[data-tg]').forEach((a) => { a.href = tgUrl; a.target = '_blank'; a.rel = 'noopener'; });
document.querySelectorAll('[data-wa]').forEach((a) => {
  if (!CONTACT.whatsapp) { a.hidden = true; return; }
  a.href = 'https://wa.me/' + CONTACT.whatsapp; a.target = '_blank'; a.rel = 'noopener';
});

const form = document.getElementById('brief');
if (form) {
  const submit = form.querySelector('[type="submit"]');
  const fine = form.querySelector('.fine');
  if (!CONTACT.whatsapp) {
    submit.textContent = 'Отправить в Telegram';
    fine.textContent = 'Текст заявки скопируется, откроется Telegram — вставьте его в сообщение. Сайт ничего не сохраняет.';
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const lines = ['Здравствуйте! Хочу сайт для бизнеса.', 'Сфера: ' + d.get('kind') + '.'];
    const link = String(d.get('link') || '').trim();
    if (link) lines.push('Где нас найти сейчас: ' + link);
    const name = String(d.get('name') || '').trim();
    if (name) lines.push('Меня зовут ' + name + '.');
    lines.push('Пришлите, пожалуйста, бесплатный первый вариант.');
    const text = lines.join('\n');
    if (CONTACT.whatsapp) {
      window.open('https://wa.me/' + CONTACT.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      return;
    }
    try { await navigator.clipboard.writeText(text); fine.textContent = 'Текст скопирован. Вставьте его в открывшийся чат Telegram.'; }
    catch (err) { fine.textContent = 'Откроется Telegram — коротко напишите, чем вы занимаетесь.'; }
    window.open(tgUrl, '_blank', 'noopener');
  });
}
