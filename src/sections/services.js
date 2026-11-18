// Xizmatlar bōlimi: filtrlanuvçi xizmat kartoçkalari
import { SERVICES, SERVICE_FILTERS } from '../data.js';
import { $, esc } from '../utils.js';

let active = 'all';

const TYPE_STYLE = {
  talim: { label: "Ta'lim", chip: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300', icon: 'bg-indigo-600' },
  xayriya: { label: 'Xayriya', chip: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300', icon: 'bg-emerald-600' },
  ijtimoiy: { label: 'Ijtimoiy', chip: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300', icon: 'bg-amber-500' },
};

function actionAttr(action) {
  if (!action) return 'disabled';
  const [kind, value] = action.split(':');
  if (kind === 'nav') return `data-nav="${esc(value)}"`;
  if (kind === 'donate') return `data-donate="${esc(value)}"`;
  if (kind === 'auth') return `data-auth="${esc(value)}"`;
  return '';
}

function render() {
  $('#serviceFilters').innerHTML = SERVICE_FILTERS.map((f) => {
    const on = f.key === active;
    return `<button type="button" role="tab" aria-selected="${on}" data-service-filter="${f.key}" class="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
      on ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
    }">${esc(f.label)}</button>`;
  }).join('');

  $('#serviceGrid').innerHTML = SERVICES.filter((s) => active === 'all' || s.type === active)
    .map((s) => {
      const t = TYPE_STYLE[s.type];
      return `
      <article class="animate-fade flex flex-col gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-400/60 hover:shadow-lg transition-all">
        <div class="flex items-start justify-between gap-3">
          <div class="w-12 h-12 rounded-2xl ${t.icon} text-white flex items-center justify-center shadow-lg"><i class="fa-solid ${s.icon} text-lg"></i></div>
          <span class="px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase ${t.chip}">${t.label}</span>
        </div>
        <div class="space-y-1.5 flex-1">
          <h3 class="text-base font-extrabold">${esc(s.title)}</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${esc(s.text)}</p>
        </div>
        <button type="button" ${actionAttr(s.action)} class="self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          s.action
            ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white cursor-pointer'
            : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
        }">${esc(s.cta)} ${s.action ? '<i class="fa-solid fa-arrow-right text-[10px]"></i>' : '<i class="fa-regular fa-clock text-[10px]"></i>'}</button>
      </article>`;
    })
    .join('');
}

export function initServices() {
  render();
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-service-filter]');
    if (!btn) return;
    active = btn.dataset.serviceFilter;
    render();
  });
}
