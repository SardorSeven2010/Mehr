// Statistika bōlimi: KPI kartoçkalari, hududlar grafigi, oylik tuşumlar va fondlar bajarilişi
import { COURSES, DEMO_MODE, PROJECTS, STATS } from '../data.js';
import { fundTotals, overallTotals, store } from '../store.js';
import { $, esc, fmt, fmtCompact, fmtPct, MONTHS, MONTHS_SHORT, pct } from '../utils.js';

// ---------------------------------------------------------------------
// Umumiy maslahat oynasi (tooltip) — qiymat birinçi, nom ikkinçi
// ---------------------------------------------------------------------
const tip = () => $('#vizTip');

function showTip({ value, label, sub }, x, y) {
  const el = tip();
  el.replaceChildren();
  const v = document.createElement('div');
  v.className = 'text-sm font-extrabold';
  v.textContent = value;
  const l = document.createElement('div');
  l.className = 'opacity-80';
  l.textContent = label;
  el.append(v, l);
  if (sub) {
    const s = document.createElement('div');
    s.className = 'opacity-60 mt-0.5';
    s.textContent = sub;
    el.append(s);
  }
  el.classList.remove('hidden');
  const r = el.getBoundingClientRect();
  const left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x + 14));
  const top = y - r.height - 14 < 8 ? y + 18 : y - r.height - 14;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}
const hideTip = () => tip()?.classList.add('hidden');

// ---------------------------------------------------------------------
// KPI
// ---------------------------------------------------------------------
function renderKpis() {
  const t = overallTotals();
  const students = COURSES.reduce((s, c) => s + c.students, 0);
  const tiles = [
    { icon: 'fa-sack-dollar', label: 'Jami yiḡilgan mablaḡ', value: `${fmtCompact(t.raised)} sōm`, sub: `${PROJECTS.length} ta maqsadli fond` },
    { icon: 'fa-users', label: 'Xayriyaçilar', value: fmt(t.donors), sub: 'barça loyihalar bōyiça' },
    { icon: 'fa-child-reaching', label: 'Qamrab olingan yoşlar', value: fmt(STATS.youth), sub: `${STATS.regionsCount} ta hududda` },
    { icon: 'fa-school', label: 'Jihozlangan maktablar', value: fmt(STATS.schools), sub: 'kompyuter va kutubxona' },
    { icon: 'fa-graduation-cap', label: 'Bepul kurslar', value: fmt(COURSES.length), sub: `${fmtCompact(students)} ōquvçi` },
    { icon: 'fa-people-group', label: 'Volontyorlar', value: fmt(STATS.volunteers), sub: 'faol kōngillilar' },
  ];
  $('#kpiRow').innerHTML = tiles
    .map(
      (k) => `
    <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <i class="fa-solid ${k.icon} text-emerald-600 dark:text-emerald-400"></i><span>${esc(k.label)}</span>
      </div>
      <div class="mt-2 text-xl sm:text-3xl font-semibold text-slate-900 dark:text-white">${esc(k.value)}</div>
      <div class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">${esc(k.sub)}</div>
    </div>`,
    )
    .join('');

  // Hero ostidagi qisqa kōrsatkichlar
  $('#heroStats').innerHTML = [
    ['Yiḡildi', `${fmtCompact(t.raised)} sōm`],
    ['Xayriyaçilar', fmt(t.donors)],
    ['Yoşlar', `${fmt(STATS.youth)}+`],
  ]
    .map(
      ([l, v]) => `<div class="rounded-2xl bg-white/10 glass-card border border-white/15 px-3 py-2.5">
        <dt class="text-[11px] text-slate-300">${l}</dt><dd class="text-sm sm:text-lg font-extrabold">${v}</dd></div>`,
    )
    .join('');
}

// ---------------------------------------------------------------------
// Hududlar bōyiça (tartiblangan gorizontal ustunlar, bitta rang)
// ---------------------------------------------------------------------
function renderRegions() {
  const total = STATS.regions.reduce((s, [, v]) => s + v, 0);
  const max = Math.max(...STATS.regions.map(([, v]) => v));
  const rows = [...STATS.regions].sort((a, b) => b[1] - a[1]);

  $('#regionChart').innerHTML = `
    <ul class="space-y-1.5" aria-label="Hududlar bōyiça qamrab olingan yoşlar">
      ${rows
        .map(
          ([name, v]) => `
        <li class="viz-row grid grid-cols-[6.5rem_1fr] sm:grid-cols-[8.5rem_1fr] items-center gap-3 py-0.5 cursor-default" tabindex="0"
            data-tip-value="${fmt(v)} nafar" data-tip-label="${esc(name)}" data-tip-sub="Jamidan ${fmtPct(pct(v, total))}"
            aria-label="${esc(name)}: ${fmt(v)} nafar">
          <span class="text-xs text-slate-600 dark:text-slate-300 truncate">${esc(name)}</span>
          <span class="flex items-center gap-2 min-w-0 border-l border-[color:var(--viz-axis)]">
            <span class="viz-bar h-3 block shrink-0" style="width: calc((100% - 3.25rem) * ${(v / max).toFixed(4)})"></span>
            <span class="text-[11px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">${fmt(v)}</span>
          </span>
        </li>`,
        )
        .join('')}
    </ul>`;

  $('#regionTable').innerHTML = table(
    ['Hudud', 'Yoşlar', 'Ulush'],
    rows.map(([n, v]) => [n, fmt(v), fmtPct(pct(v, total))]),
    ['Jami', fmt(total), '100%'],
  );
}

function table(head, rows, foot) {
  const th = head.map((h, i) => `<th class="py-2 px-2 font-bold ${i ? 'text-right' : 'text-left'}">${esc(h)}</th>`).join('');
  const tr = rows
    .map((r) => `<tr class="border-t border-slate-100 dark:border-slate-800">${r.map((c, i) => `<td class="py-1.5 px-2 ${i ? 'text-right tabular-nums' : ''}">${esc(c)}</td>`).join('')}</tr>`)
    .join('');
  const tf = foot
    ? `<tfoot><tr class="border-t-2 border-slate-200 dark:border-slate-700 font-extrabold">${foot.map((c, i) => `<td class="py-2 px-2 ${i ? 'text-right tabular-nums' : ''}">${esc(c)}</td>`).join('')}</tr></tfoot>`
    : '';
  return `<div class="overflow-x-auto"><table class="w-full text-xs"><thead class="text-slate-500 dark:text-slate-400"><tr>${th}</tr></thead><tbody>${tr}</tbody>${tf}</table></div>`;
}

// ---------------------------------------------------------------------
// Oylik tuşumlar (çiziq + yuvilgan maydon, kursor bōyiça kōrsatkich)
// ---------------------------------------------------------------------
function monthlySeries() {
  const mine = store.state.donations;
  return STATS.monthly.map(([y, m, v], i) => {
    const extra = mine
      .filter((d) => {
        const dt = new Date(d.date);
        return dt.getFullYear() === y && dt.getMonth() === m;
      })
      .reduce((s, d) => s + d.amount, 0);
    return { y, m, value: (v + extra) / 1e6, current: i === STATS.monthly.length - 1 };
  });
}

const fmtMln = (v) => `${v.toFixed(1).replace('.', ',')} mln sōm`;
const monthName = (p) => `${MONTHS[p.m][0].toUpperCase()}${MONTHS[p.m].slice(1)} ${p.y}`;

let monthlyIndex = null;

function renderMonthly() {
  const host = $('#monthlyChart');
  const data = monthlySeries();
  const W = Math.max(280, host.clientWidth || 560);
  const H = Math.max(260, Math.min(420, host.clientHeight || 260));
  const pad = { l: 34, r: 48, t: 16, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const maxV = Math.max(...data.map((d) => d.value));
  const step = maxV > 60 ? 20 : 10;
  const yMax = Math.ceil(maxV / step) * step || step;
  const x = (i) => pad.l + (iw * i) / (data.length - 1);
  const y = (v) => pad.t + ih - (ih * v) / yMax;

  const ticks = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);
  const everyOther = iw / data.length < 34;

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const last = data[data.length - 1];

  host.innerHTML = `
  <svg class="viz-svg absolute inset-0 block select-none" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" tabindex="0"
       aria-label="Oylik xayriya tuşumlari, sōnggi 12 oy. Oxirgi qiymat: ${fmtMln(last.value)}. Qiymatlarni kōriş uçun chap va ōng strelkalardan foydalaning.">
    <g>
      ${ticks
        .map(
          (t) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}" stroke="var(--viz-${t === 0 ? 'axis' : 'grid'})" stroke-width="1" shape-rendering="crispEdges"/>
                  <text x="${pad.l - 8}" y="${y(t)}" dy="0.32em" text-anchor="end" font-size="11" fill="var(--viz-muted)" style="font-variant-numeric: tabular-nums">${t}</text>`,
        )
        .join('')}
    </g>
    <g>
      ${data
        .map((d, i) =>
          everyOther && i % 2 && i !== data.length - 1
            ? ''
            : `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--viz-muted)">${MONTHS_SHORT[d.m]}</text>`,
        )
        .join('')}
    </g>
    <path d="${area}" fill="var(--viz-wash)"/>
    <path d="${line}" fill="none" stroke="var(--viz-series)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(data.length - 1)}" cy="${y(last.value)}" r="4" fill="var(--viz-series)" stroke="var(--viz-surface)" stroke-width="2"/>
    <text x="${x(data.length - 1) + 10}" y="${y(last.value)}" dy="0.32em" font-size="12" font-weight="700" fill="currentColor">${last.value.toFixed(1).replace('.', ',')}</text>
    <g data-cross class="hidden">
      <line data-cross-line y1="${pad.t}" y2="${pad.t + ih}" stroke="var(--viz-muted)" stroke-width="1" shape-rendering="crispEdges"/>
      <circle data-cross-dot r="5" fill="var(--viz-series)" stroke="var(--viz-surface)" stroke-width="2"/>
    </g>
    <rect data-hit x="${pad.l - 10}" y="0" width="${iw + 20}" height="${H}" fill="transparent"/>
  </svg>`;

  const svg = host.querySelector('svg');
  const cross = svg.querySelector('[data-cross]');
  const crossLine = svg.querySelector('[data-cross-line]');
  const crossDot = svg.querySelector('[data-cross-dot]');

  const show = (i, clientX, clientY) => {
    monthlyIndex = i;
    const d = data[i];
    cross.classList.remove('hidden');
    crossLine.setAttribute('x1', x(i));
    crossLine.setAttribute('x2', x(i));
    crossDot.setAttribute('cx', x(i));
    crossDot.setAttribute('cy', y(d.value));
    const box = svg.getBoundingClientRect();
    const px = clientX ?? box.left + (x(i) / W) * box.width;
    const py = clientY ?? box.top + (y(d.value) / H) * box.height;
    showTip({ value: fmtMln(d.value), label: monthName(d), sub: d.current ? 'Joriy oy — davom etmoqda' : '' }, px, py);
  };
  const hide = () => {
    cross.classList.add('hidden');
    hideTip();
  };
  const indexAt = (clientX) => {
    const box = svg.getBoundingClientRect();
    const sx = ((clientX - box.left) / box.width) * W;
    return Math.max(0, Math.min(data.length - 1, Math.round(((sx - pad.l) / iw) * (data.length - 1))));
  };

  svg.addEventListener('pointermove', (e) => show(indexAt(e.clientX), e.clientX, e.clientY));
  svg.addEventListener('pointerleave', hide);
  svg.addEventListener('blur', hide);
  svg.addEventListener('focus', () => show(monthlyIndex ?? data.length - 1));
  svg.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const cur = monthlyIndex ?? data.length - 1;
    show(Math.max(0, Math.min(data.length - 1, cur + (e.key === 'ArrowRight' ? 1 : -1))));
  });

  const total = data.reduce((s, d) => s + d.value, 0);
  $('#monthlyTable').innerHTML = table(
    ['Oy', 'Tuşum (mln sōm)'],
    data.map((d) => [monthName(d) + (d.current ? ' *' : ''), d.value.toFixed(1).replace('.', ',')]),
    ['Jami', total.toFixed(1).replace('.', ',')],
  );
}

// ---------------------------------------------------------------------
// Fondlar bajarilişi (meter rōyxati)
// ---------------------------------------------------------------------
function renderFunds() {
  $('#fundMeters').innerHTML = PROJECTS.map((p) => {
    const t = fundTotals(p.id);
    const prc = pct(t.raised, t.goal);
    return `
    <li class="space-y-1.5">
      <div class="flex items-baseline justify-between gap-3">
        <span class="text-sm font-bold truncate">${esc(p.short)}</span>
        <span class="text-sm font-extrabold tabular-nums">${fmtPct(prc)}</span>
      </div>
      <div class="h-2 rounded-full viz-meter-track overflow-hidden" role="progressbar" aria-label="${esc(p.short)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(prc)}">
        <div class="h-full rounded-full viz-meter-fill" style="width:${prc}%"></div>
      </div>
      <div class="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>${fmtCompact(t.raised)} / ${fmtCompact(t.goal)} sōm</span>
        <span>${prc >= 100 ? '<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i>Maqsadga erişildi' : `Qoldi: ${fmtCompact(Math.max(0, t.goal - t.raised))} sōm`}</span>
      </div>
    </li>`;
  }).join('');
}

function renderAll() {
  renderKpis();
  renderRegions();
  renderMonthly();
  renderFunds();
}

export function initStats() {
  if (DEMO_MODE) {
    const badge = $('#statsDemoBadge');
    badge.classList.remove('hidden');
    badge.classList.add('inline-flex');
  }
  renderAll();
  store.subscribe(renderAll);

  // Hududlar qatorlari uçun maslahat oynasi
  const regionHost = $('#regionChart');
  const rowTip = (row, x, y) =>
    showTip({ value: row.dataset.tipValue, label: row.dataset.tipLabel, sub: row.dataset.tipSub }, x, y);
  regionHost.addEventListener('pointermove', (e) => {
    const row = e.target.closest('.viz-row');
    if (row) rowTip(row, e.clientX, e.clientY);
    else hideTip();
  });
  regionHost.addEventListener('pointerleave', hideTip);
  regionHost.addEventListener('focusin', (e) => {
    const row = e.target.closest('.viz-row');
    if (!row) return;
    const r = row.getBoundingClientRect();
    rowTip(row, r.left + r.width / 2, r.top);
  });
  regionHost.addEventListener('focusout', hideTip);
  window.addEventListener('scroll', hideTip, { passive: true });

  // Grafik ⇄ jadval
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-viz-toggle]');
    if (!btn) return;
    const key = btn.dataset.vizToggle;
    const chart = $(`#${key}Chart`);
    const tbl = $(`#${key}Table`);
    const showTable = tbl.classList.contains('hidden');
    tbl.classList.toggle('hidden', !showTable);
    chart.classList.toggle('hidden', showTable);
    btn.querySelector('span').textContent = showTable ? 'Grafik' : 'Jadval';
    btn.querySelector('i').className = `fa-solid ${showTable ? 'fa-chart-simple' : 'fa-table'} mr-1`;
    if (!showTable && key === 'monthly') renderMonthly();
  });

  // Oyna ōlçami ōzgarganda çiziqli grafikni qayta çiziş
  let last = '';
  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    const key = `${Math.round(width / 4)}x${Math.round(height / 4)}`;
    if (width && key !== last) {
      last = key;
      renderMonthly();
    }
  }).observe($('#monthlyChart'));
}
