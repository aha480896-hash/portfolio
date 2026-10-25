// Каталог магазина «Пипетка». Здесь меняются бренды, товары, цены и наличие.
// shape — как нарисовать упаковку: bottle, dropper, jar, tube, pump, stick, sachet.
// skin — для какой кожи: dry, oily, combo, sensitive; all — для любой.
const SHOP = {
  whatsapp: '74950000000',
  deliveryPrice: 300,
  freeDeliveryFrom: 3000,
  stores: ['Тверская, 12', 'Сокол, Ленинградский проспект, 76'],
};

const BRANDS = {
  hanbit: { name: 'Hanbit', country: 'Корея', color: '#f1c9d6' },
  mizu: { name: 'Mizu Lab', country: 'Япония', color: '#c9def0' },
  calme: { name: 'Maison Calme', country: 'Франция', color: '#e6ddcb' },
  severnica: { name: 'Северница', country: 'Россия', color: '#cfe1c6' },
  dewrice: { name: 'Dew & Rice', country: 'Корея', color: '#f1e2bd' },
  kori: { name: 'Kōri', country: 'Япония', color: '#d9d3f1' },
  derma: { name: 'Derma Pure', country: 'Германия', color: '#dde3e8' },
  bloom: { name: 'Bloom Seoul', country: 'Корея', color: '#f6cdbd' },
};

const CATEGORIES = {
  wash: 'Умывание', toner: 'Тонеры', serum: 'Сыворотки', cream: 'Кремы',
  spf: 'SPF', mask: 'Маски', lips: 'Губы', body: 'Тело',
};

const SKINS = { dry: 'сухая', oily: 'жирная', combo: 'комбинированная', sensitive: 'чувствительная' };

const PRODUCTS = [
  { id: 1, brand: 'hanbit', cat: 'wash', name: 'Пенка для умывания с рисовой водой', volume: '150 мл', price: 990, skin: ['oily', 'combo'], shape: 'tube', tag: '',
    about: 'Мягкая пенка, которая смывает себум и не стягивает кожу.' },
  { id: 2, brand: 'hanbit', cat: 'toner', name: 'Тонер с центеллой', volume: '200 мл', price: 1290, skin: ['sensitive', 'dry'], shape: 'bottle', tag: '',
    about: 'Успокаивает покраснения после умывания и готовит кожу к крему.' },
  { id: 3, brand: 'hanbit', cat: 'serum', name: 'Сыворотка с ниацинамидом 10%', volume: '30 мл', price: 1690, skin: ['oily', 'combo'], shape: 'dropper', tag: 'Хит',
    about: 'Выравнивает тон и сужает поры. Подходит для ежедневного ухода.' },
  { id: 4, brand: 'mizu', cat: 'wash', name: 'Гидрофильное масло', volume: '150 мл', price: 1890, skin: ['all'], shape: 'pump', tag: '',
    about: 'Растворяет макияж и SPF, смывается водой без жирной плёнки.' },
  { id: 5, brand: 'mizu', cat: 'toner', name: 'Лосьон с гиалуроновой кислотой', volume: '170 мл', price: 2190, skin: ['dry', 'sensitive'], shape: 'bottle', tag: '',
    about: 'Плотный японский лосьон: увлажняет так, что крем иногда не нужен.' },
  { id: 6, brand: 'mizu', cat: 'spf', name: 'Солнцезащитный гель SPF 50+', volume: '50 мл', price: 1490, skin: ['all'], shape: 'tube', tag: 'Хит',
    about: 'Прозрачный, без белых следов, удобно наносить под макияж.' },
  { id: 7, brand: 'calme', cat: 'cream', name: 'Крем для очень сухой кожи', volume: '50 мл', price: 2890, skin: ['dry', 'sensitive'], shape: 'jar', tag: '',
    about: 'Плотный крем с церамидами для зимы и после ретинола.' },
  { id: 8, brand: 'calme', cat: 'wash', name: 'Мицеллярная вода', volume: '400 мл', price: 1390, skin: ['all'], shape: 'bottle', tag: '',
    about: 'Снимает макияж с глаз и лица, не требует смывания.' },
  { id: 9, brand: 'calme', cat: 'lips', name: 'Бальзам для губ с маслом ши', volume: '4,5 г', price: 690, skin: ['all'], shape: 'stick', tag: '',
    about: 'Защищает губы от ветра и мороза, без запаха.' },
  { id: 10, brand: 'severnica', cat: 'cream', name: 'Крем с облепихой', volume: '50 мл', price: 990, skin: ['dry', 'combo'], shape: 'jar', tag: 'Новинка',
    about: 'Питательный крем на облепиховом масле, лёгкая текстура.' },
  { id: 11, brand: 'severnica', cat: 'mask', name: 'Маска с голубой глиной', volume: '75 мл', price: 790, skin: ['oily', 'combo'], shape: 'jar', tag: '',
    about: 'Очищает поры за 10 минут, раз-два в неделю.' },
  { id: 12, brand: 'severnica', cat: 'body', name: 'Масло для тела с пихтой', volume: '100 мл', price: 1190, skin: ['all'], shape: 'bottle', tag: '',
    about: 'Наносится на влажную кожу после душа, хвойный запах.' },
  { id: 13, brand: 'dewrice', cat: 'mask', name: 'Тканевые маски, 5 штук', volume: '5 × 25 мл', price: 890, skin: ['all'], shape: 'sachet', tag: '',
    about: 'Пять масок с разными эссенциями: на неделю ухода.' },
  { id: 14, brand: 'dewrice', cat: 'toner', name: 'Эссенция с ферментами риса', volume: '150 мл', price: 1990, skin: ['all'], shape: 'bottle', tag: '',
    about: 'Делает кожу ровной и сияющей, наносится руками после тонера.' },
  { id: 15, brand: 'dewrice', cat: 'cream', name: 'Крем-гель с алоэ', volume: '80 мл', price: 1290, skin: ['oily', 'combo'], shape: 'jar', tag: '',
    about: 'Лёгкий гель, который впитывается за минуту и не блестит.' },
  { id: 16, brand: 'kori', cat: 'serum', name: 'Сыворотка с витамином C', volume: '30 мл', price: 2490, skin: ['all'], shape: 'dropper', tag: 'Новинка',
    about: 'Свежая формула с 15% витамина C для сияния и ровного тона.' },
  { id: 17, brand: 'kori', cat: 'lips', name: 'Ночная маска для губ', volume: '20 г', price: 790, skin: ['all'], shape: 'jar', tag: '',
    about: 'Толстым слоем на ночь, утром губы мягкие.' },
  { id: 18, brand: 'kori', cat: 'spf', name: 'Стик SPF 50 для лица', volume: '18 г', price: 1390, skin: ['all'], shape: 'stick', tag: '',
    about: 'Удобно обновлять защиту поверх макияжа в течение дня.' },
  { id: 19, brand: 'derma', cat: 'body', name: 'Крем для рук с мочевиной 10%', volume: '75 мл', price: 690, skin: ['dry'], shape: 'tube', tag: '',
    about: 'Для трещин и сухости, быстро впитывается.' },
  { id: 20, brand: 'derma', cat: 'wash', name: 'Гель для умывания без отдушек', volume: '200 мл', price: 1190, skin: ['sensitive', 'dry'], shape: 'pump', tag: '',
    about: 'Самый мягкий гель в магазине, подходит при дерматите.' },
  { id: 21, brand: 'derma', cat: 'serum', name: 'Сыворотка с пептидами', volume: '30 мл', price: 3490, skin: ['dry', 'all'], shape: 'dropper', tag: '',
    about: 'Для упругости и мелких морщин, утром и вечером.' },
  { id: 22, brand: 'bloom', cat: 'cream', name: 'Крем для век с кофеином', volume: '20 мл', price: 1590, skin: ['all'], shape: 'tube', tag: '',
    about: 'Уменьшает отёки по утрам, холодит кожу.' },
  { id: 23, brand: 'bloom', cat: 'wash', name: 'Пилинг-скатка', volume: '120 мл', price: 1090, skin: ['oily', 'combo'], shape: 'tube', tag: '',
    about: 'Мягко убирает ороговевшие клетки, раз в неделю.' },
  { id: 24, brand: 'bloom', cat: 'spf', name: 'Флюид SPF 30 с тоном', volume: '40 мл', price: 1790, skin: ['combo', 'oily'], shape: 'pump', tag: '',
    about: 'Выравнивает тон и защищает от солнца вместо тонального крема.' },
];

const HOW_TO = {
  wash: 'Утром и вечером на влажную кожу, затем смыть тёплой водой.',
  toner: 'После умывания, руками или ватным диском.',
  serum: '2–3 капли на чистую кожу перед кремом.',
  cream: 'Последним шагом ухода, утром или вечером.',
  spf: 'Утром последним шагом, обновлять каждые 2–3 часа на солнце.',
  mask: 'На чистую кожу на 10–15 минут, 1–2 раза в неделю.',
  lips: 'По необходимости в течение дня или на ночь.',
  body: 'После душа на слегка влажную кожу.',
};
