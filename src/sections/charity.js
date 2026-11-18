// Xayriya bōlimi: loyiha kartoçkalari va şaffof reyestr
import { PROJECTS, findFund } from '../data.js';
import { fundTotals, overallTotals, registryEntries, store } from '../store.js';
import { $, esc, fmt, fmtCompact, fmtPct, fmtSom, pct, timeAgo } from '../utils.js';

function projectCard(p) {
  const t = fundTotals(p.id);
  const progress = pct(t.raised, t.goal);
  return `
  <article class="group flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
    <div class="relative h-40 bg-gradient-to-br ${p.gradient} overflow-hidden">
      <i class="fa-solid ${p.icon} absolute inset-0 m-auto w-fit h-fit text-6xl text-white/35"></i>
      <img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" data-hide-on-error class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent"></div>
      <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 text-[11px] font-extrabold text-slate-800 dark:text-slate-100">${esc(p.category)}</span>
      <span class="absolute bottom-3 left-3 right-3 text-[11px] font-semibold text-white/95 truncate"><i class="fa-solid fa-location-dot mr-1"></i>${esc(p.region)}</span>
    </div>
    <div class="p-5 flex-1 flex flex-col gap-3">
      <h3 class="text-base font-extrabold leading-snug">${esc(p.title)}</h3>
      <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${esc(p.description)}</p>
      <div class="mt-auto space-y-2 pt-2">
        <div class="flex items-baseline justify-between gap-2">
          <span class="text-sm font-extrabold">${fmtCompact(t.raised)} sōm</span>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">${fmtPct(progress)}</span>
        </div>
        <div class="h-2 rounded-full viz-meter-track overflow-hidden" role="progressbar" aria-label="${esc(p.short)} bajarilişi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}">
          <div class="h-full rounded-full viz-meter-fill" style="width:${progress}%"></div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Maqsad: ${fmtCompact(t.goal)} sōm</span>
          <span><i class="fa-solid fa-users mr-1"></i>${fmt(t.donors)} xayriyaçi</span>
        </div>
        <div class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"><i class="fa-solid fa-child-reaching mr-1"></i>Qamrov: ${esc(p.beneficiaries)}</div>
      </div>
      <div class="flex gap-2 pt-1">
        <button type="button" data-donate="${p.id}" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold shadow cursor-pointer">
          <i class="fa-solid fa-heart mr-1"></i> Ehson qiliş
        </button>
        <button type="button" data-share-project="${p.id}" class="w-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer" aria-label="Loyihani ulaşiş" title="Ulaşiş">
          <i class="fa-solid fa-share-nodes"></i>
        </button>
      </div>
    </div>
  </article>`;
}

function renderProjects() {
  $('#projectGrid').innerHTML = PROJECTS.map(projectCard).join('');
  const totals = overallTotals();
  $('#charitySummary').innerHTML = `
    <span class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold"><i class="fa-solid fa-sack-dollar text-emerald-600 dark:text-emerald-400 mr-1"></i>${fmtCompact(totals.raised)} sōm yiḡildi</span>
    <span class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold"><i class="fa-solid fa-users text-indigo-600 dark:text-indigo-400 mr-1"></i>${fmt(totals.donors)} xayriyaçi</span>
    <span class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold"><i class="fa-solid fa-percent text-amber-600 mr-1"></i>0% komissiya</span>`;
}

function renderRegistry() {
  const entries = registryEntries();
  $('#registryCount').textContent = `${entries.length} ta yozuv`;
  $('#registryList').innerHTML = entries
    .slice(0, 8)
    .map((r) => {
      const fund = findFund(r.fund);
      return `
      <li class="flex items-center gap-3 py-3">
        <div class="w-10 h-10 shrink-0 rounded-xl ${r.mine ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'} flex items-center justify-center">
          <i class="fa-solid ${r.mine ? 'fa-user-check' : 'fa-hand-holding-heart'}"></i>
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-bold truncate">${esc(r.donor)}${r.mine ? ' <span class="ml-1 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] align-middle">Siz</span>' : ''}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${esc(fund.short)} • ${timeAgo(r.date)}</div>
        </div>
        <div class="text-sm font-extrabold whitespace-nowrap">${fmtSom(r.amount)}</div>
      </li>`;
    })
    .join('');
}

export function initCharity() {
  const render = () => {
    renderProjects();
    renderRegistry();
  };
  render();
  store.subscribe(render);
  // "N daqiqa oldin" yozuvlarini yangilab turiş
  setInterval(renderRegistry, 60_000);
}
