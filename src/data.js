// =====================================================================
//  MEHR — ilova ma'lumotlari
//  Bu fayldagi barça matn, raqam va rōyxatlarni bemalol tahrirlaş mumkin.
//  DIQQAT: statistika, loyiha summalari va reyestrdagi yozuvlar NAMUNA
//  (demo) ma'lumotlardir — haqiqiy ma'lumotlar bilan almaştiring.
// =====================================================================

/** true bōlsa: tōlov oynasida va statistikada "Demo rejim" ogohlantirişi kōrinadi. */
export const DEMO_MODE = true;

export const TEAM = {
  founder: {
    name: 'Narzullayeva Nilufar Nuraliyevna',
    short: 'Narzullayeva N.N.',
    initials: 'NN',
    photo: 'images/1000019450.jpg',
  },
  editor: {
    name: 'Madiyorov Sardor Firdavsoviç',
    short: 'Madiyorov S.F.',
    initials: 'MS',
    photo: 'images/1000019418.jpg',
  },
  reviewer: {
    name: 'Hotamov Uluḡbek Umedoviç',
    short: 'Hotamov U.U.',
    initials: 'HU',
    photo: 'images/1000019451.jpg',
  },
};

export const SECTIONS = [
  { key: 'home', label: 'Boş sahifa', icon: 'fa-wand-magic-sparkles' },
  { key: 'asoschi', label: 'Asosçi', icon: 'fa-user-tie' },
  { key: 'xayriya', label: 'Xayriya', icon: 'fa-heart' },
  { key: 'talim', label: "Ta'lim portali", icon: 'fa-graduation-cap' },
  { key: 'xizmatlar', label: 'Xizmatlar', icon: 'fa-layer-group' },
  { key: 'statistika', label: 'Statistika', icon: 'fa-chart-column' },
  { key: 'muharrir', label: 'Muharrirlar', icon: 'fa-pen-nib' },
];

const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=80`;
const U_CARD = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

/** Har bir bōlim uçun alohida Hero fon rasmi */
export const HERO_BACKGROUNDS = {
  home: U('1524178232363-1fb2b075b655'),
  asoschi: U('1517245386807-bb43f82c33c4'),
  xayriya: U('1488521787991-ed7bbaae773c'),
  talim: U('1516321318423-f06f85e504b3'),
  xizmatlar: U('1531482615713-2afd69097998'),
  statistika: U('1551288049-bebda4e38f71'),
  muharrir: U('1498050108023-c5249f4df085'),
};

/** Umumiy (maqsadsiz) xayriya fondi — kartoçka sifatida kōrsatilmaydi */
export const GENERAL_FUND = {
  id: 'umumiy',
  title: 'MEHR Umumiy Xayriya Fondi',
  short: 'Umumiy fond',
};

/** Maqsadli xayriya loyihalari. goal / raised — sōmda; donors — xayriyaçilar soni. */
export const PROJECTS = [
  {
    id: 'kompyuter',
    title: 'Çekka hudud maktablariga zamonaviy kompyuterlar',
    short: 'Maktablarga kompyuterlar',
    category: "Ta'lim xayriyasi",
    region: 'Surxondaryo, Qaşqadaryo, Xorazm',
    description:
      "Çekka hududlardagi maktablarda zamonaviy kompyuter sinflari taşkil etiladi: har bir maktabga 15 ta kompyuter, proyektor va tezkor internet ulanişi.",
    beneficiaries: '42 ta maktab',
    goal: 250_000_000,
    raised: 168_400_000,
    donors: 1240,
    icon: 'fa-laptop',
    gradient: 'from-emerald-500 to-teal-700',
    image: U_CARD('1531482615713-2afd69097998'),
  },
  {
    id: 'ilm-qutisi',
    title: "Kam ta'minlangan oilalar farzandlari uçun 'Ilm Qutisi'",
    short: "'Ilm Qutisi' aksiyasi",
    category: 'Maktab jihozlari',
    region: "Barça hududlar",
    description:
      "Har bir 'Ilm Qutisi'da darsliklar, daftar va yozuv anjomlari, maktab sumkasi hamda ōquv qurollari bor. Qutilar volontyorlar orqali manzilli yetkaziladi.",
    beneficiaries: '3 200 ta ōquvçi',
    goal: 80_000_000,
    raised: 61_250_000,
    donors: 2315,
    icon: 'fa-box-open',
    gradient: 'from-amber-500 to-orange-600',
    image: U_CARD('1488521787991-ed7bbaae773c'),
  },
  {
    id: 'inklyuziv',
    title: "Inklyuziv ta'lim va maxsus reabilitatsiya markazi",
    short: "Inklyuziv ta'lim markazi",
    category: "Inklyuziv ta'lim",
    region: 'Samarqand, Buxoro',
    description:
      "Imkoniyati çeklangan bolalar uçun maxsus kutubxona, Brayl yozuvidagi adabiyotlar va moslaştirilgan IT xonasi jihozlanadi.",
    beneficiaries: '540 ta bola',
    goal: 180_000_000,
    raised: 74_900_000,
    donors: 860,
    icon: 'fa-universal-access',
    gradient: 'from-sky-500 to-indigo-600',
    image: U_CARD('1524178232363-1fb2b075b655'),
  },
  {
    id: 'kelajak-granti',
    title: "Iqtidorli yoşlar uçun 'Kelajak Granti' stipendiya fondi",
    short: "'Kelajak Granti' stipendiyasi",
    category: 'Stipendiya',
    region: 'Barça hududlar',
    description:
      "Olimpiada ḡoliblari va iqtidorli, ammo ehtiyojmand abituriyentlarning OTM kontrakt tōlovlari va ōquv xarajatlari qoplanadi.",
    beneficiaries: '65 ta talaba',
    goal: 300_000_000,
    raised: 212_000_000,
    donors: 1780,
    icon: 'fa-award',
    gradient: 'from-violet-500 to-fuchsia-600',
    image: U_CARD('1517245386807-bb43f82c33c4'),
  },
];

export const FUNDS = [...PROJECTS, GENERAL_FUND];
export const findFund = (id) => FUNDS.find((f) => f.id === id) || GENERAL_FUND;

export const QUICK_AMOUNTS = [10_000, 50_000, 100_000, 500_000];

export const COURSE_CATEGORIES = [
  { key: 'all', label: 'Barçasi' },
  { key: 'it', label: 'IT va SI' },
  { key: 'til', label: 'Xorijiy tillar' },
  { key: 'fan', label: 'Aniq fanlar' },
  { key: 'kasb', label: 'Kasbiy kōnikmalar' },
];

/** Bepul onlayn kurslar. lessons: [sarlavha, daqiqa] */
export const COURSES = [
  {
    id: 'kompyuter-savodxonligi',
    title: 'Kompyuter savodxonligi asoslari',
    category: 'it',
    level: 'Boşlanḡiç',
    icon: 'fa-computer',
    gradient: 'from-emerald-500 to-teal-600',
    students: 4820,
    description:
      "Kompyuter bilan işlaşni noldan ōrganing: fayllar, internet, elektron poçta, matn va jadval muharrirlari.",
    lessons: [
      ['Kompyuter qanday işlaydi?', 12],
      ['Operatsion tizim va fayllar bilan işlaş', 18],
      ['Internet va xavfsiz brauzerlaş', 15],
      ['Elektron poçta va onlayn muloqot', 14],
      ['Matn muharriri: hujjat tayyorlaş', 20],
      ['Elektron jadvallar asoslari', 22],
      ['Taqdimot yaratiş', 16],
      ["Kiberxavfsizlik va şaxsiy ma'lumotlar", 14],
    ],
  },
  {
    id: 'python',
    title: 'Python dasturlaş: noldan boşlab',
    category: 'it',
    level: 'Boşlanḡiç',
    icon: 'fa-code',
    gradient: 'from-indigo-500 to-violet-600',
    students: 3410,
    description:
      "Dasturlaşning asosiy tuşunçalari: ōzgaruvçilar, şartlar, sikllar, funksiyalar va kiçik amaliy loyihalar.",
    lessons: [
      ['Python ōrnatiş va birinçi dastur', 15],
      ["Ōzgaruvçilar va ma'lumot turlari", 20],
      ['Şart operatorlari', 18],
      ['Sikllar: for va while', 22],
      ['Rōyxatlar va luḡatlar', 24],
      ['Funksiyalar', 20],
      ['Fayllar bilan işlaş', 18],
      ['Yakuniy loyiha: "Kundalik" dasturi', 30],
    ],
  },
  {
    id: 'suniy-intellekt',
    title: "Sun'iy intellekt asoslari",
    category: 'it',
    level: 'Ōrta',
    icon: 'fa-brain',
    gradient: 'from-cyan-500 to-blue-600',
    students: 2960,
    description:
      "Sun'iy intellekt qanday işlaydi va uni ōqiş, ijod hamda kasbiy faoliyatda qanday mas'uliyat bilan qōllaş mumkin.",
    lessons: [
      ["Sun'iy intellekt nima?", 14],
      ['Maşinali ōqitiş tuşunçasi', 20],
      ['Til modellari bilan samarali muloqot', 18],
      ['SI yordamida ōqiş va izlaniş', 16],
      ['Tasvir va ovoz bilan işlovçi SI', 15],
      ['SI etikasi va axborot xavfsizligi', 17],
    ],
  },
  {
    id: 'web',
    title: 'Web-dasturlaş: HTML, CSS va JavaScript',
    category: 'it',
    level: 'Ōrta',
    icon: 'fa-globe',
    gradient: 'from-orange-500 to-rose-600',
    students: 2140,
    description:
      "Birinçi saytingizni yarating: sahifa tuzilmasi, zamonaviy dizayn, moslaşuvçan maket va interaktiv elementlar.",
    lessons: [
      ['Web qanday işlaydi?', 12],
      ['HTML: sahifa tuzilmasi', 22],
      ['CSS: dizayn va ranglar', 24],
      ['Moslaşuvçan (responsive) maket', 20],
      ['JavaScript asoslari', 26],
      ['Interaktiv sahifa yaratiş', 24],
      ['Saytni internetga joylaş', 15],
    ],
  },
  {
    id: 'ingliz-tili',
    title: 'Ingliz tili: A1–A2 daraja',
    category: 'til',
    level: 'Boşlanḡiç',
    icon: 'fa-language',
    gradient: 'from-rose-500 to-pink-600',
    students: 5630,
    description:
      "Kundalik muloqot uçun zarur sōz boyligi, grammatika va talaffuz — interaktiv maşqlar bilan.",
    lessons: [
      ['Alifbo va talaffuz', 15],
      ['Ōzim haqimda: tanişuv', 18],
      ['Oila va kundalik hayot', 20],
      ['Raqamlar, vaqt va sanalar', 16],
      ['Şaharda: yōl sōraş', 18],
      ['Hozirgi va ōtgan zamon', 24],
      ['Suhbat amaliyoti', 20],
    ],
  },
  {
    id: 'matematika',
    title: 'Abituriyentlar uçun matematika',
    category: 'fan',
    level: 'Ōrta',
    icon: 'fa-square-root-variable',
    gradient: 'from-blue-500 to-indigo-700',
    students: 3980,
    description:
      "OTMga kiriş imtihonlariga tizimli tayyorgarlik: nazariya, namunaviy masalalar va test yeçiş strategiyalari.",
    lessons: [
      ['Sonlar va ifodalar', 20],
      ['Tenglamalar va tengsizliklar', 25],
      ['Funksiyalar va grafiklar', 24],
      ['Planimetriya asoslari', 22],
      ['Ehtimollar nazariyasi', 18],
      ['Test yeçiş strategiyalari', 20],
    ],
  },
  {
    id: 'moliyaviy-savodxonlik',
    title: 'Yoşlar uçun moliyaviy savodxonlik',
    category: 'kasb',
    level: 'Boşlanḡiç',
    icon: 'fa-coins',
    gradient: 'from-amber-500 to-yellow-600',
    students: 1870,
    description:
      "Şaxsiy byudjet, jamḡarma, xavfsiz onlayn tōlovlar va firibgarlikdan himoyalaniş bōyiça amaliy bilimlar.",
    lessons: [
      ['Şaxsiy byudjetni rejalaş', 15],
      ['Jamḡarma va maqsadlar', 14],
      ['Bank kartalari va xavfsiz tōlovlar', 16],
      ['Firibgarlikdan himoyalaniş', 14],
      ['Kiçik biznes ḡoyasi', 18],
    ],
  },
  {
    id: 'grafik-dizayn',
    title: 'Grafik dizayn asoslari',
    category: 'kasb',
    level: 'Boşlanḡiç',
    icon: 'fa-palette',
    gradient: 'from-fuchsia-500 to-purple-600',
    students: 2270,
    description:
      "Rang, şrift va kompozitsiya qonuniyatlari; logotip va ijtimoiy tarmoqlar uçun dizayn yaratiş.",
    lessons: [
      ['Dizayn tamoyillari', 16],
      ['Ranglar nazariyasi', 14],
      ['Tipografiya', 15],
      ['Logotip yaratiş', 22],
      ['Ijtimoiy tarmoqlar uçun dizayn', 20],
      ['Portfolio tayyorlaş', 18],
    ],
  },
];

export const SERVICE_FILTERS = [
  { key: 'all', label: 'Barçasi' },
  { key: 'talim', label: "Ta'lim" },
  { key: 'xayriya', label: 'Xayriya' },
  { key: 'ijtimoiy', label: 'Ijtimoiy' },
];

/**
 * Xizmatlar. action: 'nav:<bōlim>' | 'donate:<fond>' | 'auth:<rol>' | null (tez kunda)
 */
export const SERVICES = [
  {
    type: 'talim',
    icon: 'fa-laptop-code',
    title: 'Bepul onlayn kurslar',
    text: "IT, sun'iy intellekt, xorijiy tillar va aniq fanlar bōyiça sertifikatli bepul kurslar.",
    cta: 'Kurslarni kōriş',
    action: 'nav:talim',
  },
  {
    type: 'talim',
    icon: 'fa-chalkboard-user',
    title: 'Mentorlik dasturi',
    text: "Tajribali mutaxassislar kasb tanlaş, OTMga tayyorlaniş va loyiha ustida işlaşda şaxsan yōl-yōriq beradi.",
    cta: 'Mentorga yozilish',
    action: 'auth:Ōquvçi',
  },
  {
    type: 'talim',
    icon: 'fa-robot',
    title: 'SI yordamçi ōqituvçi',
    text: "Sun'iy intellektga asoslangan yordamçi uy vazifalarini tuşuntiradi va şaxsiy ōquv rejasini tuzib beradi.",
    cta: 'Tez kunda',
    action: null,
  },
  {
    type: 'talim',
    icon: 'fa-compass',
    title: 'Kasbga yōnaltiriş',
    text: "Qiziqiş va qobiliyatlar asosida mos kasb hamda ta'lim yōnalişini aniqlaşga yordam beruvçi sinovlar.",
    cta: 'Kurslarni kōriş',
    action: 'nav:talim',
  },
  {
    type: 'xayriya',
    icon: 'fa-hand-holding-heart',
    title: 'Manzilli xayriya',
    text: "Ehsoningiz aniq loyiha yoki maktabga yōnaltiriladi va har bir sarf şaffof reyestrda kōrinadi.",
    cta: 'Ehson qiliş',
    action: 'donate:umumiy',
  },
  {
    type: 'xayriya',
    icon: 'fa-school',
    title: 'Maktablarni jihozlaş',
    text: "Çekka hududlardagi maktablarga kompyuter, proyektor, kutubxona va laboratoriya jihozlari yetkaziladi.",
    cta: 'Ehson qiliş',
    action: 'donate:kompyuter',
  },
  {
    type: 'xayriya',
    icon: 'fa-graduation-cap',
    title: "'Kelajak Granti' stipendiyasi",
    text: "Iqtidorli, ehtiyojmand yoşlarning OTM kontrakt tōlovlarini qoplaşga kōmaklaşing.",
    cta: 'Ehson qiliş',
    action: 'donate:kelajak-granti',
  },
  {
    type: 'xayriya',
    icon: 'fa-building',
    title: 'Korporativ homiylik',
    text: "Kompaniyalar uçun ijtimoiy mas'uliyat dasturlari: maktab yoki kurs homiysi bōliş imkoniyati.",
    cta: 'Homiy bōliş',
    action: 'auth:Xayriyaçi',
  },
  {
    type: 'ijtimoiy',
    icon: 'fa-people-group',
    title: 'Volontyorlik',
    text: "'Ilm Qutisi' tarqatiş, onlayn darslar ōtiş va tadbirlar taşkil etişda kōngilli sifatida qatnaşing.",
    cta: "Volontyor bōliş",
    action: 'auth:Volontyor',
  },
  {
    type: 'ijtimoiy',
    icon: 'fa-universal-access',
    title: "Inklyuziv ta'lim",
    text: "Imkoniyati çeklangan bolalar uçun moslaştirilgan darslar, maxsus jihozlar va reabilitatsiya kōmagi.",
    cta: 'Qōllab-quvvatlaş',
    action: 'donate:inklyuziv',
  },
  {
    type: 'ijtimoiy',
    icon: 'fa-people-roof',
    title: 'Ota-onalar uçun maslahat',
    text: "Farzand ta'limi, raqamli xavfsizlik va kasb tanlaş bōyiça ota-onalarga bepul maslahatlar.",
    cta: 'Rōyxatdan ōtiş',
    action: 'auth:Ōquvçi',
  },
];

/** Statistika — NAMUNA kōrsatkichlar */
export const STATS = {
  youth: 18450,
  regionsCount: 14,
  schools: 126,
  volunteers: 640,
  /** Hududlar bōyiça qamrab olingan yoşlar (jami 18 450) */
  regions: [
    ['Surxondaryo', 2140],
    ['Qaşqadaryo', 2010],
    ['Samarqand', 1860],
    ['Farḡona', 1720],
    ['Toşkent şahri', 1580],
    ['Andijon', 1490],
    ['Namangan', 1410],
    ['Xorazm', 1270],
    ['Qoraqalpoḡiston', 1180],
    ['Buxoro', 1050],
    ['Toşkent viloyati', 980],
    ['Jizzax', 760],
    ['Navoiy', 560],
    ['Sirdaryo', 440],
  ],
  /** Oylik xayriya tuşumlari (sōm). [yil, oy (0–11), summa] */
  monthly: [
    [2025, 11, 24_600_000],
    [2026, 0, 18_200_000],
    [2026, 1, 21_500_000],
    [2026, 2, 30_400_000],
    [2026, 3, 26_100_000],
    [2026, 4, 29_700_000],
    [2026, 5, 31_200_000],
    [2026, 6, 27_900_000],
    [2026, 7, 34_600_000],
    [2026, 8, 41_300_000],
    [2026, 9, 45_800_000],
    [2026, 10, 38_400_000],
  ],
};

/** Şaffof reyestr uçun namuna yozuvlar (vaqt — hozirdan necha daqiqa oldin) */
export const REGISTRY_SEED = [
  { donor: 'Dilnoza A.', fund: 'ilm-qutisi', amount: 100_000, minutesAgo: 7 },
  { donor: 'Anonim xayriyaçi', fund: 'kompyuter', amount: 500_000, minutesAgo: 26 },
  { donor: 'Jasur T.', fund: 'kelajak-granti', amount: 250_000, minutesAgo: 54 },
  { donor: 'Malika R.', fund: 'inklyuziv', amount: 50_000, minutesAgo: 95 },
  { donor: 'Anonim xayriyaçi', fund: 'umumiy', amount: 1_000_000, minutesAgo: 180 },
  { donor: 'Bekzod Q.', fund: 'kompyuter', amount: 150_000, minutesAgo: 240 },
  { donor: 'Sevara M.', fund: 'ilm-qutisi', amount: 75_000, minutesAgo: 410 },
  { donor: 'Otabek N.', fund: 'kelajak-granti', amount: 300_000, minutesAgo: 620 },
];
