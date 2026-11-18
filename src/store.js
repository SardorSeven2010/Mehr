// Qurilmadagi ma'lumotlar ombori (localStorage)
import { PROJECTS, REGISTRY_SEED, STATS } from './data.js';

const KEY = 'mehr:v1';
const PHOTO_KEY = (name) => `mehr:photo:${name}`;

const defaults = () => ({
  theme: null, // 'dark' | 'light' | null (tizim sozlamasi)
  user: null, // { name, phone, role, createdAt }
  donations: [], // { id, fund, amount, donor, anonymous, cardMask, date }
  enrollments: {}, // { [courseId]: { enrolledAt, done: number[], completedAt? } }
});

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...defaults(), ...raw };
  } catch {
    return defaults();
  }
}

let state = load();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export const store = {
  get state() {
    return state;
  },
  update(mutator, { silent = false } = {}) {
    mutator(state);
    const ok = persist();
    if (!silent) listeners.forEach((fn) => fn(state));
    return ok;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

// --- Suratlar alohida kalitlarda saqlanadi (hajmi katta bōlgani uçun) ---
export function getPhoto(name) {
  try {
    return localStorage.getItem(PHOTO_KEY(name));
  } catch {
    return null;
  }
}
export function setPhoto(name, dataUrl) {
  try {
    if (dataUrl) localStorage.setItem(PHOTO_KEY(name), dataUrl);
    else localStorage.removeItem(PHOTO_KEY(name));
    return true;
  } catch {
    return false;
  }
}

// --- Hisoblangan kōrsatkichlar ---

/** Loyihaning boşlanḡiç kōrsatkichlari + şu qurilmadan qilingan ehsonlar */
export function fundTotals(fundId) {
  const base = PROJECTS.find((p) => p.id === fundId);
  const mine = state.donations.filter((d) => d.fund === fundId);
  return {
    raised: (base?.raised || 0) + mine.reduce((s, d) => s + d.amount, 0),
    donors: (base?.donors || 0) + mine.length,
    goal: base?.goal || 0,
  };
}

export function overallTotals() {
  const raised =
    PROJECTS.reduce((s, p) => s + p.raised, 0) + state.donations.reduce((s, d) => s + d.amount, 0);
  const donors = PROJECTS.reduce((s, p) => s + p.donors, 0) + state.donations.length;
  return { raised, donors, youth: STATS.youth };
}

/** Şaffof reyestr: foydalanuvçi ehsonlari + namuna yozuvlar, yangilari birinçi */
export function registryEntries() {
  const now = Date.now();
  const seed = REGISTRY_SEED.map((r, i) => ({
    id: `seed-${i}`,
    fund: r.fund,
    amount: r.amount,
    donor: r.donor,
    date: new Date(now - r.minutesAgo * 60000).toISOString(),
    mine: false,
  }));
  const mine = state.donations.map((d) => ({ ...d, donor: d.anonymous ? 'Anonim xayriyaçi' : d.donor, mine: true }));
  return [...mine, ...seed].sort((a, b) => new Date(b.date) - new Date(a.date));
}
