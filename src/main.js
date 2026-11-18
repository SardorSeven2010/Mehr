// MEHR — ilovaning kiriş nuqtasi
import '@fontsource-variable/inter';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import '@fortawesome/fontawesome-free/css/regular.min.css';
import '@fortawesome/fontawesome-free/css/brands.min.css';
import './styles.css';

import { HERO_BACKGROUNDS, PROJECTS, GENERAL_FUND, QUICK_AMOUNTS, SECTIONS, findFund } from './data.js';
import { store } from './store.js';
import { $, $$, closeAllModals, esc, fmt, fmtSom, initModals } from './utils.js';
import { shareOrCopy } from './share.js';
import { initCharity } from './sections/charity.js';
import { initCourses } from './sections/courses.js';
import { initServices } from './sections/services.js';
import { initStats } from './sections/stats.js';
import { initTeam } from './sections/team.js';
import { initPayment, openPayment } from './modals/payment.js';
import { initAuth, openAuth } from './modals/auth.js';
import { initPWA } from './pwa.js';

const KEYS = SECTIONS.map((s) => s.key);

// ---------------------------------------------------------------------
// Mavzu: yorqin / qoronḡu
// ---------------------------------------------------------------------
const media = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  $('#themeIcon').className = dark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-indigo-600';
  $('#themeText').textContent = dark ? 'Yorqin' : 'Qoronḡu';
  document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0f172a' : '#059669');
}

function initTheme() {
  const saved = store.state.theme;
  applyTheme(saved ? saved === 'dark' : media.matches);
  media.addEventListener('change', (e) => {
    if (!store.state.theme) applyTheme(e.matches);
  });
  $('#themeToggleBtn').addEventListener('click', () => {
    const dark = !document.documentElement.classList.contains('dark');
    store.update((s) => (s.theme = dark ? 'dark' : 'light'), { silent: true });
    applyTheme(dark);
  });
}

// ---------------------------------------------------------------------
// Navigatsiya va bōlimlar (hash orqali: #xayriya, #talim, ...)
// ---------------------------------------------------------------------
function renderNav(active) {
  $('#desktopNav').innerHTML = SECTIONS.map((s) => {
    const on = s.key === active;
    return `<button type="button" data-nav="${s.key}" ${on ? 'aria-current="page"' : ''} class="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
      on
        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
    }">${esc(s.label)}</button>`;
  }).join('');

  $('#mobileNav').innerHTML = SECTIONS.map((s) => {
    const on = s.key === active;
    return `<button type="button" data-nav="${s.key}" ${on ? 'aria-current="page"' : ''} class="px-3 py-1.5 rounded-lg font-bold shrink-0 cursor-pointer transition-all ${
      on ? 'bg-emerald-600 text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
    }">${esc(s.label)}</button>`;
  }).join('');
  $('#mobileNav [aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
}

const routeKey = () => {
  const h = decodeURIComponent(location.hash.slice(1));
  return KEYS.includes(h) ? h : 'home';
};

function applyRoute({ scroll = true, smooth = true } = {}) {
  const key = routeKey();
  $('#heroBackground').style.backgroundImage = `url('${HERO_BACKGROUNDS[key] || HERO_BACKGROUNDS.home}')`;
  $$('.page-section').forEach((sec) => {
    const visible = key === 'home' || sec.id === `sec-${key}`;
    sec.classList.toggle('hidden', !visible);
    if (visible && key !== 'home') {
      sec.classList.remove('is-entering');
      void sec.offsetWidth;
      sec.classList.add('is-entering');
    }
  });
  renderNav(key);
  document.title = key === 'home' ? "MEHR — Xayriya platformasi va ta'lim portali" : `${SECTIONS.find((s) => s.key === key).label} — MEHR`;
  if (!scroll) return;
  const behavior = smooth ? 'smooth' : 'auto';
  if (key === 'home') window.scrollTo({ top: 0, behavior });
  else $(`#sec-${key}`).scrollIntoView({ behavior, block: 'start' });
}

function navigate(key) {
  if (routeKey() === key && (key !== 'home' || !location.hash || location.hash === '#home')) applyRoute();
  else location.hash = key;
}

// ---------------------------------------------------------------------
// Hero: tezkor ehson
// ---------------------------------------------------------------------
let heroAmount = 50_000;

function renderHeroAmounts() {
  $('#heroAmounts').innerHTML = QUICK_AMOUNTS.map(
    (a) => `<button type="button" data-hero-amount="${a}" aria-pressed="${a === heroAmount}" class="py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
      a === heroAmount ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
    }">${fmt(a)}</button>`,
  ).join('');
  $('#heroDonateBtnLabel').textContent = `${fmtSom(heroAmount)} tōlovga ōtiş`;
}

function initHero() {
  $('#heroFund').innerHTML = [...PROJECTS, GENERAL_FUND]
    .map((f) => `<option value="${f.id}">${esc(f.category ? `${f.category}: ${f.short}` : f.title)}</option>`)
    .join('');
  renderHeroAmounts();
  $('#heroAmounts').addEventListener('click', (e) => {
    const b = e.target.closest('[data-hero-amount]');
    if (!b) return;
    heroAmount = Number(b.dataset.heroAmount);
    renderHeroAmounts();
  });
  $('#heroDonateBtn').addEventListener('click', () => openPayment($('#heroFund').value, heroAmount));
  $('#editorsBg').style.backgroundImage = `url('${HERO_BACKGROUNDS.talim.replace('w=1920', 'w=1600')}')`;
}

// ---------------------------------------------------------------------
// Umumiy tugmalar (data-* atributlari orqali)
// ---------------------------------------------------------------------
function initGlobalActions() {
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      closeAllModals();
      return navigate(nav.dataset.nav);
    }
    const donate = e.target.closest('[data-donate]');
    if (donate) return openPayment(donate.dataset.donate);
    const auth = e.target.closest('[data-auth]');
    if (auth) return openAuth({ presetRole: auth.dataset.auth || undefined });
    const share = e.target.closest('[data-share-project]');
    if (share) {
      const p = findFund(share.dataset.shareProject);
      return shareOrCopy({ title: `MEHR — ${p.short}`, text: `"${p.title}" — MEHR xayriya loyihasini qōllab-quvvatlang!` });
    }
  });

  // Yuklanmagan rasmlarni yaşiriş (gradient fon va belgi qoladi)
  document.addEventListener(
    'error',
    (e) => {
      if (e.target instanceof HTMLImageElement && e.target.hasAttribute('data-hide-on-error')) e.target.remove();
    },
    true,
  );
}

// ---------------------------------------------------------------------
initModals();
initTheme();
initHero();
initTeam();
initCharity();
initCourses();
initServices();
initStats();
initPayment();
initAuth();
initGlobalActions();
initPWA();

window.addEventListener('hashchange', () => {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h || KEYS.includes(h)) applyRoute();
});
applyRoute({ scroll: routeKey() !== 'home', smooth: false });
