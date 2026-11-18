// Kiriş va rōyxatdan ōtiş (CORE dagi kabi: email → kod → kiriş), profil oynasi
import { COURSES, HERO_BACKGROUNDS, findFund } from '../data.js';
import { REQUIRE_LOGIN, RESEND_SECONDS } from '../config.js';
import {
  authErrorText,
  currentUser,
  isProfileComplete,
  onSignedOut,
  profileFromUser,
  saveProfile,
  sendCode,
  signOut,
  verifyCode,
} from '../auth.js';
import { store } from '../store.js';
import { $, $$, closeModal, esc, fmtDate, fmtSom, initials, openModal, pct, toast } from '../utils.js';

const ROLES = [
  { key: 'Ōquvçi', icon: 'fa-user-graduate' },
  { key: 'Xayriyaçi', icon: 'fa-hand-holding-heart' },
  { key: 'Volontyor', icon: 'fa-people-group' },
];
const PENDING_KEY = 'mehr-auth-pending';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let role = 'Ōquvçi';
let pendingAction = null;
let legacyUser = null; // avvalgi versiyada faqat qurilmada saqlangan foydalanuvçi
let resendTimer = null;

const digits = (v) => String(v || '').replace(/\D/g, '');

function formatPhone(value) {
  let d = digits(value);
  if (d && !d.startsWith('998')) d = `998${d}`.slice(0, 12);
  d = d.slice(0, 12);
  const parts = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
  return d ? `+${parts.join(' ')}` : '';
}

function setError(id, message) {
  const p = document.querySelector(`[data-error-for="${id}"]`);
  const input = document.getElementById(id);
  if (p) {
    p.textContent = message || '';
    p.classList.toggle('hidden', !message);
  }
  input?.classList.toggle('!border-rose-400', !!message);
  input?.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function setBusy(form, busy, label) {
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = busy;
  if (!btn.dataset.label) btn.dataset.label = btn.textContent.trim();
  btn.innerHTML = busy
    ? `<i class="fa-solid fa-spinner fa-spin mr-2"></i>${esc(label || 'Tekşirilmoqda...')}`
    : esc(btn.dataset.label);
}

// ---------------------------------------------------------------------
// Kutilayotgan kod (ilova yopilib qolsa ham kod kiritiş bosqiçi saqlanadi)
// ---------------------------------------------------------------------
function getPending() {
  try {
    const p = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
    return p && Date.now() - p.sentAt < 60 * 60 * 1000 ? p : null;
  } catch {
    return null;
  }
}
function setPending(value) {
  try {
    if (value) localStorage.setItem(PENDING_KEY, JSON.stringify(value));
    else localStorage.removeItem(PENDING_KEY);
  } catch {
    /* e'tiborsiz */
  }
}

// ---------------------------------------------------------------------
// Kiriş oynasi
// ---------------------------------------------------------------------
const screen = () => $('#authScreen');
export const isAuthScreenOpen = () => screen().classList.contains('is-open');

function showStep(step) {
  $$('[data-auth-step]').forEach((el) => el.classList.toggle('hidden', el.dataset.authStep !== step));
  requestAnimationFrame(() => {
    const target = { email: '#authEmail', code: '#authCode', profile: '#authName' }[step];
    if (target && window.matchMedia('(hover: hover)').matches) $(target)?.focus({ preventScroll: true });
  });
}

function openScreen(step, { note } = {}) {
  const noteEl = $('#authNote');
  noteEl.textContent = note || '';
  noteEl.classList.toggle('hidden', !note);
  $('#authClose').classList.toggle('hidden', REQUIRE_LOGIN);
  screen().classList.add('is-open');
  document.body.classList.add('overflow-hidden');
  showStep(step);
}

function closeScreen() {
  screen().classList.remove('is-open');
  document.documentElement.classList.remove('auth-pending');
  if (!document.querySelector('.modal.flex')) document.body.classList.remove('overflow-hidden');
}

function startResendCountdown(sentAt) {
  clearInterval(resendTimer);
  const btn = $('#authResend');
  const tick = () => {
    const left = Math.ceil(RESEND_SECONDS - (Date.now() - sentAt) / 1000);
    if (left > 0) {
      btn.disabled = true;
      btn.textContent = `Qayta yuboriş (${left})`;
    } else {
      btn.disabled = false;
      btn.textContent = 'Kodni qayta yuboriş';
      clearInterval(resendTimer);
    }
  };
  tick();
  resendTimer = setInterval(tick, 1000);
}

function goToCodeStep(email, sentAt) {
  $('#authSentTo').textContent = email;
  $('#authCode').value = '';
  setError('authCode', '');
  startResendCountdown(sentAt);
  showStep('code');
}

async function requestCode(email) {
  await sendCode(email);
  const sentAt = Date.now();
  setPending({ email, sentAt });
  goToCodeStep(email, sentAt);
  toast('Poçtangizga tasdiqlaş kodi yuborildi!');
}

async function onEmailSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const email = $('#authEmail').value.trim().toLowerCase();
  if (!setError('authEmail', EMAIL_RE.test(email) ? '' : "Iltimos, toḡri elektron poçta kiriting!")) return;
  setBusy(form, true, 'Yuborilmoqda...');
  try {
    await requestCode(email);
  } catch (err) {
    setError('authEmail', authErrorText(err));
  } finally {
    setBusy(form, false);
  }
}

async function onCodeSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const code = digits($('#authCode').value);
  const pending = getPending();
  if (!pending) return showStep('email');
  if (!setError('authCode', code.length >= 6 ? '' : 'Poçtaga kelgan kodni tōliq kiriting.')) return;
  setBusy(form, true);
  try {
    const user = await verifyCode(pending.email, code);
    setPending(null);
    clearInterval(resendTimer);
    await afterSignIn(user);
  } catch (err) {
    setError('authCode', authErrorText(err, { verifying: true }));
  } finally {
    setBusy(form, false);
  }
}

/** Kod tasdiqlangaç: profil tōliq bōlsa — ilovaga, aks holda profilni tōldiriş bosqiçi */
async function afterSignIn(user) {
  const profile = profileFromUser(user);
  if (isProfileComplete(profile)) return finishSignIn(profile, { welcomeBack: true });
  // Avvalgi (faqat qurilmadagi) rōyxatdan ōtiş ma'lumotlarini taklif qiliş
  const old = legacyUser || store.state.user;
  $('#authName').value = old?.name || '';
  $('#authPhone').value = old?.phone || '';
  role = old?.role && ROLES.some((r) => r.key === old.role) ? old.role : role;
  renderRoles();
  showStep('profile');
}

function finishSignIn(profile, { welcomeBack = false } = {}) {
  store.update((s) => {
    s.user = profile;
  });
  closeScreen();
  const first = profile.name.split(' ')[0];
  toast(welcomeBack ? `Xuş kelibsiz, ${first}!` : `Xuş kelibsiz, ${first}! MEHR hisobingiz yaratildi.`);
  const action = pendingAction;
  pendingAction = null;
  action?.();
}

async function onProfileSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const name = $('#authName').value.trim().replace(/\s+/g, ' ');
  const phoneDigits = digits($('#authPhone').value);
  const okName = setError('authName', name.length < 3 ? 'Ism va familiyangizni kiriting (kamida 3 ta harf).' : '');
  const okPhone = setError(
    'authPhone',
    phoneDigits.length && phoneDigits.length !== 12 && phoneDigits !== '998' ? 'Telefon raqamini +998 XX XXX XX XX kōrinişida kiriting.' : '',
  );
  if (!okName || !okPhone) return;
  const phone = phoneDigits.length === 12 ? formatPhone(phoneDigits) : '';
  setBusy(form, true, 'Saqlanmoqda...');
  try {
    const user = await saveProfile({ name, phone, role, joinedAt: new Date().toISOString() });
    finishSignIn(profileFromUser(user));
  } catch (err) {
    toast(authErrorText(err), 'error');
  } finally {
    setBusy(form, false);
  }
}

function renderRoles() {
  $('#authRoles').innerHTML = ROLES.map((r) => {
    const on = r.key === role;
    return `<button type="button" role="radio" aria-checked="${on}" data-role="${r.key}" class="p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
      on ? 'border-emerald-400 bg-emerald-500/25 text-white' : 'border-white/20 text-white/80 hover:border-white/40'
    }"><i class="fa-solid ${r.icon} text-base"></i>${r.key}</button>`;
  }).join('');
}

// ---------------------------------------------------------------------
// Tașqi funksiyalar
// ---------------------------------------------------------------------
export function updateNavUser() {
  const user = store.state.user;
  $('#navUserText').textContent = user ? `${user.name.split(' ')[0]} (${user.role})` : 'Kiriş';
  $('#navUserIcon').className = user ? 'fa-solid fa-circle-user' : 'fa-solid fa-right-to-bracket';
  $('#navUserBtn').setAttribute('aria-label', user ? 'Mening hisobim' : 'Kiriş yoki rōyxatdan ōtiş');
  $$('[data-auth-label]').forEach((el) => {
    el.textContent = user ? 'Mening hisobim' : el.dataset.authLabel;
  });
}

export function openAuth({ note, presetRole } = {}) {
  if (store.state.user) return openProfile();
  if (presetRole && ROLES.some((r) => r.key === presetRole)) {
    role = presetRole;
    renderRoles();
  }
  const pending = getPending();
  if (pending) {
    openScreen('code', { note });
    goToCodeStep(pending.email, pending.sentAt);
  } else openScreen('email', { note });
}

/** Foydalanuvçi kirgan bōlsa — darhol, aks holda kirgandan keyin bajariladi */
export function requireUser(note, action) {
  if (store.state.user) return action();
  pendingAction = action;
  openAuth({ note });
}

// ---------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------
function renderProfile() {
  const user = store.state.user;
  if (!user) return;
  const donations = store.state.donations;
  const total = donations.reduce((s, d) => s + d.amount, 0);
  const courses = Object.entries(store.state.enrollments)
    .map(([id, e]) => ({ course: COURSES.find((c) => c.id === id), e }))
    .filter((x) => x.course);

  $('#profileBody').innerHTML = `
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xl font-black">${esc(initials(user.name))}</div>
      <div class="min-w-0">
        <div class="text-lg font-extrabold truncate">${esc(user.name)}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400 truncate"><i class="fa-regular fa-envelope mr-1"></i>${esc(user.email || '—')}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">${esc(user.role)}${user.phone ? ` • ${esc(user.phone)}` : ''}</div>
        <div class="text-[11px] text-slate-400">A'zo: ${fmtDate(user.createdAt)}</div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3 text-center">
      <div class="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40"><div class="text-base font-extrabold">${donations.length}</div><div class="text-[11px] text-slate-500 dark:text-slate-400">ehson</div></div>
      <div class="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40"><div class="text-base font-extrabold truncate">${fmtSom(total)}</div><div class="text-[11px] text-slate-500 dark:text-slate-400">jami</div></div>
      <div class="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40"><div class="text-base font-extrabold">${courses.length}</div><div class="text-[11px] text-slate-500 dark:text-slate-400">kurs</div></div>
    </div>

    <div>
      <h4 class="text-sm font-extrabold mb-2"><i class="fa-solid fa-graduation-cap text-indigo-500 mr-1.5"></i>Mening kurslarim</h4>
      ${
        courses.length
          ? `<ul class="space-y-2">${courses
              .map(({ course, e }) => {
                const p = pct(e.done.length, course.lessons.length);
                return `<li><button type="button" data-course="${course.id}" class="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer">
                  <div class="flex justify-between gap-2 text-sm font-bold"><span class="truncate">${esc(course.title)}</span><span class="shrink-0">${Math.round(p)}%</span></div>
                  <div class="mt-2 h-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden"><div class="h-full rounded-full bg-indigo-600 dark:bg-indigo-400" style="width:${p}%"></div></div>
                </button></li>`;
              })
              .join('')}</ul>`
          : `<p class="text-xs text-slate-500 dark:text-slate-400">Hali kursga yozilmagansiz. <button type="button" data-nav="talim" class="font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer">Kurslarni kōriş</button></p>`
      }
    </div>

    <div>
      <h4 class="text-sm font-extrabold mb-2"><i class="fa-solid fa-heart text-emerald-500 mr-1.5"></i>Mening ehsonlarim</h4>
      ${
        donations.length
          ? `<ul class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">${[...donations]
              .reverse()
              .slice(0, 6)
              .map(
                (d) => `<li class="flex justify-between gap-3 py-2"><span class="truncate">${esc(findFund(d.fund).short)} <span class="text-slate-400">• ${fmtDate(d.date)}</span></span><strong class="shrink-0">${fmtSom(d.amount)}</strong></li>`,
              )
              .join('')}</ul>`
          : `<p class="text-xs text-slate-500 dark:text-slate-400">Hali ehson qilmagansiz. <button type="button" data-donate="umumiy" class="font-bold text-emerald-600 dark:text-emerald-400 underline cursor-pointer">Birinçi ehsonni qiliş</button></p>`
      }
    </div>

    <button type="button" data-logout class="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-sm cursor-pointer">
      <i class="fa-solid fa-right-from-bracket mr-1.5"></i>Hisobdan çiqiş
    </button>`;
}

export function openProfile() {
  renderProfile();
  openModal('profileModal');
}

async function logout() {
  if (!confirm("Hisobdan çiqmoqçimisiz? Qayta kiriş uçun emailingizga yangi kod yuboriladi.")) return;
  closeModal('profileModal');
  await signOut();
  handleSignedOut();
  toast('Hisobdan çiqdingiz.', 'info');
}

function handleSignedOut() {
  if (store.state.user) {
    store.update((s) => {
      s.user = null;
    });
  }
  if (REQUIRE_LOGIN) openAuth();
}

// ---------------------------------------------------------------------
export async function initAuth() {
  $('#authBg').style.backgroundImage = `url('${HERO_BACKGROUNDS.home}')`;
  renderRoles();
  updateNavUser();

  $('#authEmailForm').addEventListener('submit', onEmailSubmit);
  $('#authCodeForm').addEventListener('submit', onCodeSubmit);
  $('#authProfileForm').addEventListener('submit', onProfileSubmit);
  $('#authCode').addEventListener('input', (e) => {
    e.target.value = digits(e.target.value).slice(0, 10);
  });
  // Foydalanuvçi qayta yoza boşlaganda xato matni yōqoladi
  ['authEmail', 'authCode', 'authName', 'authPhone'].forEach((id) =>
    document.getElementById(id).addEventListener('input', () => setError(id, '')),
  );
  $('#authChangeEmail').addEventListener('click', () => {
    setPending(null);
    clearInterval(resendTimer);
    showStep('email');
  });
  $('#authResend').addEventListener('click', async (e) => {
    const pending = getPending();
    if (!pending) return showStep('email');
    e.currentTarget.disabled = true;
    try {
      await requestCode(pending.email);
    } catch (err) {
      setError('authCode', authErrorText(err));
      startResendCountdown(pending.sentAt);
    }
  });
  $('#authClose').addEventListener('click', () => {
    pendingAction = null;
    closeScreen();
  });
  $('#authRoles').addEventListener('click', (e) => {
    const b = e.target.closest('[data-role]');
    if (!b) return;
    role = b.dataset.role;
    renderRoles();
  });
  $('#authPhone').addEventListener('focus', (e) => {
    if (!e.target.value) e.target.value = '+998 ';
  });
  $('#authPhone').addEventListener('input', (e) => {
    e.target.value = formatPhone(e.target.value);
  });
  $('#navUserBtn').addEventListener('click', () => (store.state.user ? openProfile() : openAuth()));
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-logout]')) logout();
  });
  store.subscribe(() => {
    updateNavUser();
    if (!$('#profileModal').classList.contains('hidden')) renderProfile();
  });
  onSignedOut(() => {
    if (store.state.user) handleSignedOut();
  });

  // Ilova oçilganda: saqlangan sessiyani tekşiriş
  const user = await currentUser();
  if (user) {
    const profile = profileFromUser(user);
    if (isProfileComplete(profile)) {
      store.update((s) => {
        s.user = { ...s.user, ...profile };
      });
      closeScreen();
    } else {
      openScreen('profile');
      await afterSignIn(user);
    }
    return;
  }
  // Sessiya yōq (yoki muddati tugagan): qayta kiriş kerak.
  // Avvalgi versiyadagi faqat-qurilmadagi foydalanuvçi ma'lumotlari profilni tōldirişda taklif qilinadi.
  if (store.state.user) {
    if (!store.state.user.id) legacyUser = store.state.user;
    store.update((s) => {
      s.user = null;
    });
  }
  if (REQUIRE_LOGIN) openAuth();
  else closeScreen();
}
