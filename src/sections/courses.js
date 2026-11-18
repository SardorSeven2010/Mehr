// Ta'lim portali: kurslar, darslar va sertifikat
import { COURSES, COURSE_CATEGORIES, TEAM } from '../data.js';
import { store } from '../store.js';
import { $, esc, fmt, fmtDate, openModal, pct, toast } from '../utils.js';
import { requireUser } from '../modals/auth.js';
import { isNative, nativeShareImage } from '../native.js';

let activeCategory = 'all';
let query = '';
let openCourseId = null;

const totalMinutes = (c) => c.lessons.reduce((s, [, m]) => s + m, 0);
const fmtDuration = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} soat${m ? ` ${m} daq.` : ''}` : `${m} daq.`;
};
const categoryLabel = (key) => COURSE_CATEGORIES.find((c) => c.key === key)?.label || '';

export function courseProgress(courseId) {
  const course = COURSES.find((c) => c.id === courseId);
  const e = store.state.enrollments[courseId];
  if (!course || !e) return null;
  const done = e.done.length;
  return { done, total: course.lessons.length, percent: pct(done, course.lessons.length), complete: done >= course.lessons.length };
}

function renderFilters() {
  $('#courseFilters').innerHTML = COURSE_CATEGORIES.map((c) => {
    const active = c.key === activeCategory;
    return `<button type="button" role="tab" aria-selected="${active}" data-course-cat="${c.key}" class="shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
      active
        ? 'bg-indigo-600 border-indigo-600 text-white shadow'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
    }">${esc(c.label)}</button>`;
  }).join('');
}

function courseCard(c) {
  const prog = courseProgress(c.id);
  let action = `<i class="fa-solid fa-play mr-1"></i> Bepul yozilish`;
  if (prog?.complete) action = `<i class="fa-solid fa-award mr-1"></i> Sertifikat`;
  else if (prog) action = `<i class="fa-solid fa-forward mr-1"></i> Davom ettiriş`;
  return `
  <article class="flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
    <button type="button" data-course="${c.id}" class="relative h-32 bg-gradient-to-br ${c.gradient} text-white flex items-center justify-center cursor-pointer" aria-label="${esc(c.title)} — batafsil">
      <i class="fa-solid ${c.icon} text-5xl drop-shadow-lg"></i>
      <span class="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/25 text-[10px] font-extrabold uppercase tracking-wide">${esc(categoryLabel(c.category))}</span>
      <span class="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/90 text-slate-900 text-[10px] font-extrabold">BEPUL</span>
      ${prog?.complete ? '<span class="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-extrabold"><i class="fa-solid fa-award mr-1"></i>Yakunlandi</span>' : ''}
    </button>
    <div class="p-5 flex-1 flex flex-col gap-3">
      <h3 class="text-base font-extrabold leading-snug">${esc(c.title)}</h3>
      <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">${esc(c.description)}</p>
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span><i class="fa-solid fa-signal mr-1"></i>${esc(c.level)}</span>
        <span><i class="fa-solid fa-list-ol mr-1"></i>${c.lessons.length} dars</span>
        <span><i class="fa-regular fa-clock mr-1"></i>${fmtDuration(totalMinutes(c))}</span>
      </div>
      <div class="mt-auto space-y-3 pt-1">
        ${
          prog
            ? `<div class="space-y-1">
                <div class="flex justify-between text-[11px] font-bold"><span>Ōzlaştiriş</span><span>${prog.done}/${prog.total}</span></div>
                <div class="h-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden"><div class="h-full rounded-full bg-indigo-600 dark:bg-indigo-400" style="width:${prog.percent}%"></div></div>
              </div>`
            : `<div class="text-[11px] text-slate-500 dark:text-slate-400"><i class="fa-solid fa-user-graduate mr-1"></i>${fmt(c.students)} ōquvçi ōqimoqda</div>`
        }
        <button type="button" data-course="${c.id}" class="w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer ${
          prog?.complete
            ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
            : prog
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
        }">${action}</button>
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const q = query.trim().toLowerCase();
  const list = COURSES.filter(
    (c) =>
      (activeCategory === 'all' || c.category === activeCategory) &&
      (!q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.lessons.some(([t]) => t.toLowerCase().includes(q))),
  );
  $('#courseGrid').innerHTML = list.map(courseCard).join('');
  $('#courseEmpty').classList.toggle('hidden', list.length > 0);
}

// ---------------------------------------------------------------------
// Kurs oynasi
// ---------------------------------------------------------------------
function renderCourseModal() {
  const c = COURSES.find((x) => x.id === openCourseId);
  if (!c) return;
  const e = store.state.enrollments[c.id];
  const prog = courseProgress(c.id);
  const lessons = c.lessons
    .map(([title, min], i) => {
      const done = e?.done.includes(i);
      return `
      <li>
        <button type="button" data-lesson="${i}" ${e ? '' : 'disabled'} aria-pressed="${!!done}" class="w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
          done
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900'
            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
        } ${e ? 'hover:border-indigo-400 cursor-pointer' : 'opacity-70 cursor-not-allowed'}">
          <span class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-black ${
            done ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700'
          }">${done ? '<i class="fa-solid fa-check"></i>' : i + 1}</span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-bold truncate">${esc(title)}</span>
            <span class="block text-[11px] text-slate-500 dark:text-slate-400">${min} daqiqa • ${done ? 'Ōtildi' : e ? 'Ōtildi deb belgilaş uçun bosing' : 'Yozilgandan sōng oçiladi'}</span>
          </span>
          ${e ? `<i class="fa-solid ${done ? 'fa-rotate-left text-slate-400' : 'fa-circle-play text-indigo-500'}"></i>` : '<i class="fa-solid fa-lock text-slate-400"></i>'}
        </button>
      </li>`;
    })
    .join('');

  let footer;
  if (!e) {
    footer = `<button type="button" data-enroll="${c.id}" class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg cursor-pointer"><i class="fa-solid fa-play mr-1.5"></i>Kursga bepul yozilish</button>`;
  } else if (prog.complete) {
    footer = `<button type="button" data-certificate="${c.id}" class="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm shadow-lg cursor-pointer"><i class="fa-solid fa-award mr-1.5"></i>Sertifikatni yuklab oliş (PNG)</button>`;
  } else {
    footer = `<p class="text-center text-xs text-slate-500 dark:text-slate-400"><i class="fa-solid fa-circle-info mr-1"></i>Barça darslarni yakunlaganingizdan sōng şaxsiy sertifikat beriladi.</p>`;
  }

  $('#courseBody').innerHTML = `
    <div class="relative p-6 bg-gradient-to-br ${c.gradient} text-white">
      <button type="button" data-close class="absolute top-4 right-4 p-2 w-9 h-9 rounded-xl bg-black/20 hover:bg-black/30 cursor-pointer" aria-label="Yopiş"><i class="fa-solid fa-xmark"></i></button>
      <div class="flex items-center gap-4 pr-10">
        <div class="w-16 h-16 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center"><i class="fa-solid ${c.icon} text-3xl"></i></div>
        <div>
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-white/80">${esc(categoryLabel(c.category))} • ${esc(c.level)}</span>
          <h3 id="courseTitle" class="text-xl font-extrabold leading-tight">${esc(c.title)}</h3>
        </div>
      </div>
      <p class="mt-4 text-sm text-white/90">${esc(c.description)}</p>
      <div class="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
        <span class="px-2.5 py-1 rounded-lg bg-black/20"><i class="fa-solid fa-list-ol mr-1"></i>${c.lessons.length} dars</span>
        <span class="px-2.5 py-1 rounded-lg bg-black/20"><i class="fa-regular fa-clock mr-1"></i>${fmtDuration(totalMinutes(c))}</span>
        <span class="px-2.5 py-1 rounded-lg bg-black/20"><i class="fa-solid fa-user-graduate mr-1"></i>${fmt(c.students + (e ? 1 : 0))} ōquvçi</span>
        <span class="px-2.5 py-1 rounded-lg bg-black/20"><i class="fa-solid fa-certificate mr-1"></i>Sertifikat</span>
      </div>
    </div>
    <div class="p-5 sm:p-6 space-y-5">
      ${
        prog
          ? `<div class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold"><span>Sizning natijangiz</span><span>${prog.done} / ${prog.total} dars • ${Math.round(prog.percent)}%</span></div>
              <div class="h-2 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden"><div class="h-full rounded-full bg-indigo-600 dark:bg-indigo-400 transition-all" style="width:${prog.percent}%"></div></div>
            </div>`
          : ''
      }
      <div>
        <h4 class="text-sm font-extrabold mb-3">Kurs dasturi</h4>
        <ol class="space-y-2">${lessons}</ol>
      </div>
      ${footer}
    </div>`;
}

export function openCourse(id) {
  openCourseId = id;
  renderCourseModal();
  openModal('courseModal');
}

function enroll(id) {
  requireUser("Kursga yozilish uçun avval MEHR hisobini yarating — bu bir daqiqa ham olmaydi.", () => {
    store.update((s) => {
      if (!s.enrollments[id]) s.enrollments[id] = { enrolledAt: new Date().toISOString(), done: [] };
    });
    toast("Kursga muvaffaqiyatli yozildingiz! Birinçi darsdan boşlang.");
    if (openCourseId === id) renderCourseModal();
    else openCourse(id);
  });
}

function toggleLesson(index) {
  const c = COURSES.find((x) => x.id === openCourseId);
  if (!c) return;
  let finished = false;
  store.update((s) => {
    const e = s.enrollments[c.id];
    if (!e) return;
    const i = e.done.indexOf(index);
    if (i >= 0) e.done.splice(i, 1);
    else e.done.push(index);
    e.done.sort((a, b) => a - b);
    if (e.done.length >= c.lessons.length && !e.completedAt) {
      e.completedAt = new Date().toISOString();
      finished = true;
    }
    if (e.done.length < c.lessons.length) delete e.completedAt;
  });
  $(`#courseBody [data-lesson="${index}"]`)?.focus({ preventScroll: true });
  if (finished) toast('Tabriklaymiz! Kurs yakunlandi — sertifikatingiz tayyor.', 'success', 4500);
}

// ---------------------------------------------------------------------
// Sertifikat (canvas → PNG)
// ---------------------------------------------------------------------
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function downloadCertificate(id) {
  const c = COURSES.find((x) => x.id === id);
  const e = store.state.enrollments[id];
  const user = store.state.user;
  if (!c || !e || !user) return;
  await document.fonts?.ready;

  const W = 1600;
  const H = 1131;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const F = '"Inter Variable", Inter, system-ui, sans-serif';

  // Fon
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  const band = ctx.createLinearGradient(0, 0, W, 0);
  band.addColorStop(0, '#10b981');
  band.addColorStop(0.5, '#14b8a6');
  band.addColorStop(1, '#4f46e5');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, W, 28);
  ctx.fillRect(0, H - 28, W, 28);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 70, W - 120, H - 140);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(76, 86, W - 152, H - 172);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#059669';
  ctx.font = `900 64px ${F}`;
  ctx.fillText('MEHR', W / 2, 200);
  ctx.fillStyle = '#64748b';
  ctx.font = `600 22px ${F}`;
  ctx.fillText("XAYRIYA PLATFORMASI VA TA'LIM PORTALI", W / 2, 240);

  ctx.fillStyle = '#0f172a';
  ctx.font = `800 74px ${F}`;
  ctx.fillText('SERTIFIKAT', W / 2, 360);
  ctx.fillStyle = '#475569';
  ctx.font = `500 28px ${F}`;
  ctx.fillText('Mazkur sertifikat', W / 2, 430);

  ctx.fillStyle = '#4f46e5';
  let size = 60;
  do {
    ctx.font = `800 ${size}px ${F}`;
    size -= 4;
  } while (ctx.measureText(user.name).width > 1300 && size > 28);
  ctx.fillText(user.name, W / 2, 520);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(W / 2 - 360, 548, 720, 2);

  ctx.fillStyle = '#475569';
  ctx.font = `500 28px ${F}`;
  ctx.fillText('quyidagi bepul onlayn kursni muvaffaqiyatli yakunlaganini tasdiqlaydi:', W / 2, 610);

  ctx.fillStyle = '#0f172a';
  ctx.font = `800 44px ${F}`;
  wrapText(ctx, `"${c.title}"`, 1200).forEach((l, i) => ctx.fillText(l, W / 2, 690 + i * 56));

  ctx.fillStyle = '#64748b';
  ctx.font = `500 24px ${F}`;
  ctx.fillText(`${c.lessons.length} ta dars • ${fmtDuration(totalMinutes(c))} • ${fmtDate(e.completedAt || Date.now())}`, W / 2, 800);

  // Imzolar
  const sig = (x, role, name) => {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 200, 900, 400, 2);
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 24px ${F}`;
    ctx.fillText(name, x, 940);
    ctx.fillStyle = '#64748b';
    ctx.font = `500 20px ${F}`;
    ctx.fillText(role, x, 972);
  };
  sig(380, 'Asosçi', TEAM.founder.short);
  sig(W / 2, 'Muharrir, IT va SI koordinatori', TEAM.editor.short);
  sig(W - 380, 'Muharrir va Taqrizçi', TEAM.reviewer.short);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 18px ${F}`;
  ctx.fillText(`Sertifikat ID: MEHR-${id.toUpperCase().slice(0, 6)}-${new Date(e.completedAt || Date.now()).getTime().toString(36).toUpperCase()}`, W / 2, 1018);

  const fileName = `MEHR-sertifikat-${id}.png`;
  const dataUrl = canvas.toDataURL('image/png');
  if (isNative) {
    try {
      await nativeShareImage(dataUrl, fileName, 'MEHR sertifikati');
    } catch {
      toast("Sertifikatni saqlab bōlmadi. Qaytadan urinib kōring.", 'error');
    }
    return;
  }
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
  toast('Sertifikat yuklab olindi.');
}

export function initCourses() {
  renderFilters();
  renderGrid();

  $('#courseSearch').addEventListener('input', (ev) => {
    query = ev.target.value;
    renderGrid();
  });

  document.addEventListener('click', (ev) => {
    const cat = ev.target.closest('[data-course-cat]');
    if (cat) {
      activeCategory = cat.dataset.courseCat;
      renderFilters();
      renderGrid();
      return;
    }
    const card = ev.target.closest('[data-course]');
    if (card) return openCourse(card.dataset.course);
    const en = ev.target.closest('[data-enroll]');
    if (en) return enroll(en.dataset.enroll);
    const lesson = ev.target.closest('[data-lesson]');
    if (lesson && !lesson.disabled) return toggleLesson(Number(lesson.dataset.lesson));
    const cert = ev.target.closest('[data-certificate]');
    if (cert) return downloadCertificate(cert.dataset.certificate);
  });

  store.subscribe(() => {
    renderGrid();
    if (openCourseId && !$('#courseModal').classList.contains('hidden')) renderCourseModal();
  });
}
