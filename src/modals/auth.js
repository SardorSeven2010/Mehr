// Rōyxatdan ōtiş va "Mening hisobim" oynalari
import { COURSES, findFund } from '../data.js';
import { store } from '../store.js';
import { $, closeModal, esc, fmtDate, fmtSom, initials, openModal, pct, toast } from '../utils.js';

const ROLES = [
  { key: 'Ōquvçi', icon: 'fa-user-graduate' },
  { key: 'Xayriyaçi', icon: 'fa-hand-holding-heart' },
  { key: 'Volontyor', icon: 'fa-people-group' },
];

let role = 'Ōquvçi';
let pendingAction = null;

const digits = (v) => String(v || '').replace(/\D/g, '');

function formatPhone(value) {
  let d = digits(value);
  if (d && !d.startsWith('998')) d = `998${d}`.slice(0, 12);
  d = d.slice(0, 12);
  const parts = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
  return d ? `+${parts.join(' ')}` : '';
}

function renderRoles() {
  $('#authRoles').innerHTML = ROLES.map((r) => {
    const on = r.key === role;
    return `<button type="button" role="radio" aria-checked="${on}" data-role="${r.key}" class="p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
      on
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300'
        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
    }"><i class="fa-solid ${r.icon} text-base"></i>${r.key}</button>`;
  }).join('');
}

function setError(id, message) {
  const p = document.querySelector(`[data-error-for="${id}"]`);
  p.textContent = message || '';
  p.classList.toggle('hidden', !message);
  document.getElementById(id).classList.toggle('!border-rose-500', !!message);
  document.getElementById(id).setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

export function updateNavUser() {
  const user = store.state.user;
  $('#navUserText').textContent = user ? `${user.name.split(' ')[0]} (${user.role})` : 'Rōyxatdan ōtiş';
  $('#navUserIcon').className = user ? 'fa-solid fa-circle-user' : 'fa-solid fa-user-plus';
  $('#navUserBtn').setAttribute('aria-label', user ? 'Mening hisobim' : 'Rōyxatdan ōtiş');
}

export function openAuth({ note, presetRole } = {}) {
  if (store.state.user) return openProfile();
  if (presetRole && ROLES.some((r) => r.key === presetRole)) role = presetRole;
  renderRoles();
  const noteEl = $('#authNote');
  noteEl.textContent = note || '';
  noteEl.classList.toggle('hidden', !note);
  noteEl.classList.toggle('flex', !!note);
  setError('authName', '');
  setError('authPhone', '');
  openModal('authModal');
}

/** Foydalanuvçi rōyxatdan ōtgan bōlsa — darhol, aks holda rōyxatdan ōtgaç bajariladi */
export function requireUser(note, action) {
  if (store.state.user) return action();
  pendingAction = action;
  openAuth({ note });
}

function submit(e) {
  e.preventDefault();
  const name = $('#authName').value.trim().replace(/\s+/g, ' ');
  const phone = digits($('#authPhone').value);
  const okName = setError('authName', name.length < 3 ? "Ism va familiyangizni kiriting (kamida 3 ta harf)." : '');
  const okPhone = setError('authPhone', phone.length !== 12 ? "Telefon raqamini +998 XX XXX XX XX kōrinişida kiriting." : '');
  if (!okName || !okPhone) {
    $('#authForm [aria-invalid="true"]')?.focus();
    return;
  }
  store.update((s) => {
    s.user = { name, phone: formatPhone(phone), role, createdAt: new Date().toISOString() };
  });
  closeModal('authModal');
  toast(`Xuş kelibsiz, ${name.split(' ')[0]}! MEHR hisobingiz yaratildi.`);
  $('#authForm').reset();
  const action = pendingAction;
  pendingAction = null;
  action?.();
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
        <div class="text-xs text-slate-500 dark:text-slate-400">${esc(user.role)} • ${esc(user.phone)}</div>
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

export function initAuth() {
  renderRoles();
  updateNavUser();
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
  $('#authForm').addEventListener('submit', submit);
  $('#navUserBtn').addEventListener('click', () => (store.state.user ? openProfile() : openAuth()));

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-logout]')) {
      if (!confirm('Hisobdan çiqmoqçimisiz? Kurs natijalari va ehsonlar şu qurilmada saqlanib qoladi.')) return;
      store.update((s) => {
        s.user = null;
      });
      closeModal('profileModal');
      toast('Hisobdan çiqdingiz.', 'info');
    }
  });

  store.subscribe(() => {
    updateNavUser();
    if (!$('#profileModal').classList.contains('hidden')) renderProfile();
  });
}
