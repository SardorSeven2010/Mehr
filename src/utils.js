// Umumiy yordamçi funksiyalar

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** HTML ichiga qōyiladigan foydalanuvçi matnini xavfsiz qiliş */
export function esc(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

/** 1234567 → "1 234 567" */
export const fmt = (n) => Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const fmtSom = (n) => `${fmt(n)} sōm`;

const trimZeros = (s) => s.replace(/\.?0+$/, '').replace('.', ',');

/** 168400000 → "168,4 mln" */
export function fmtCompact(n) {
  const v = Math.abs(n);
  if (v >= 1e9) return `${trimZeros((n / 1e9).toFixed(2))} mlrd`;
  if (v >= 1e6) return `${trimZeros((n / 1e6).toFixed(1))} mln`;
  if (v >= 1e4) return `${trimZeros((n / 1e3).toFixed(1))} ming`;
  return fmt(n);
}

export const pct = (part, whole) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);
export const fmtPct = (p) => `${trimZeros(p.toFixed(1))}%`;

export const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];
export const MONTHS_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];

const pad = (n) => String(n).padStart(2, '0');

export function fmtDate(value) {
  const d = new Date(value);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export function fmtDateTime(value) {
  const d = new Date(value);
  return `${fmtDate(d)} • ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function timeAgo(value) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} kun oldin`;
  return fmtDate(value);
}

export function uid(prefix = '') {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${Date.now().toString(36).toUpperCase().slice(-4)}${rnd}`;
}

export const initials = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase() || 'M';

// ---------------------------------------------------------------------
// Bildirişnomalar (toast)
// ---------------------------------------------------------------------
const TOAST_STYLES = {
  success: { icon: 'fa-circle-check', cls: 'text-emerald-500' },
  info: { icon: 'fa-circle-info', cls: 'text-sky-500' },
  warn: { icon: 'fa-triangle-exclamation', cls: 'text-amber-500' },
  error: { icon: 'fa-circle-xmark', cls: 'text-rose-500' },
};

export function toast(message, type = 'success', ms = 3200) {
  const host = $('#toastHost');
  if (!host) return;
  const s = TOAST_STYLES[type] || TOAST_STYLES.info;
  const el = document.createElement('div');
  el.className =
    'toast pointer-events-auto flex items-start gap-3 w-full sm:w-96 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl text-sm';
  el.setAttribute('role', 'status');
  const icon = document.createElement('i');
  icon.className = `fa-solid ${s.icon} ${s.cls} text-lg mt-0.5`;
  const text = document.createElement('div');
  text.className = 'flex-1 font-semibold text-slate-800 dark:text-slate-100';
  text.textContent = message;
  el.append(icon, text);
  host.append(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, ms);
}

// ---------------------------------------------------------------------
// Modal oynalar
// ---------------------------------------------------------------------
const openStack = [];

export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal || openStack.includes(id)) return;
  modal._returnFocus = document.activeElement;
  modal.style.zIndex = String(50 + openStack.length);
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  openStack.push(id);
  document.body.classList.add('overflow-hidden');
  requestAnimationFrame(() => {
    const target = modal.querySelector('[autofocus]') || modal.querySelector('input, select, textarea, button');
    target?.focus({ preventScroll: true });
  });
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  const i = openStack.indexOf(id);
  if (i >= 0) openStack.splice(i, 1);
  if (!openStack.length) document.body.classList.remove('overflow-hidden');
  modal._returnFocus?.focus?.({ preventScroll: true });
}

export const hasOpenModal = () => openStack.length > 0;
export const closeTopModal = () => openStack.length && closeModal(openStack[openStack.length - 1]);

export function closeAllModals() {
  [...openStack].reverse().forEach(closeModal);
}

export function initModals() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openStack.length) closeModal(openStack[openStack.length - 1]);
  });
  document.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (closer) {
      closeModal(closer.closest('.modal')?.id);
      return;
    }
    if (e.target.classList?.contains('modal')) closeModal(e.target.id);
  });
}
