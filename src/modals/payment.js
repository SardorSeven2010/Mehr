// Tōlov va xayriya oynasi
import { DEMO_MODE, FUNDS, QUICK_AMOUNTS, findFund } from '../data.js';
import { store } from '../store.js';
import { $, esc, fmt, fmtDateTime, fmtSom, openModal, toast, uid } from '../utils.js';
import { shareOrCopy } from '../share.js';

const MIN_AMOUNT = 1_000;
const MAX_AMOUNT = 100_000_000;
let amount = 50_000;
let lastReceipt = null;

const digits = (v) => String(v || '').replace(/\D/g, '');

function cardBrand(num) {
  if (/^(8600|5614)/.test(num)) return 'UZCARD';
  if (/^9860/.test(num)) return 'HUMO';
  if (/^4/.test(num)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'MC';
  return '';
}

function setError(id, message) {
  const p = document.querySelector(`[data-error-for="${id}"]`);
  const input = document.getElementById(id);
  if (p) {
    p.textContent = message || '';
    p.classList.toggle('hidden', !message);
  }
  input?.classList.toggle('!border-rose-500', !!message);
  input?.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function renderAmountButtons() {
  $('#payAmounts').innerHTML = QUICK_AMOUNTS.map(
    (a) => `<button type="button" data-pay-amount="${a}" class="py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
      a === amount ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white'
    }">${fmt(a)}</button>`,
  ).join('');
}

function setAmount(value) {
  amount = Math.min(MAX_AMOUNT, Number(digits(value)) || 0);
  $('#payAmount').value = amount ? fmt(amount) : '';
  $('#paySubmitLabel').textContent = amount ? `${fmtSom(amount)} — tōlovni tasdiqlaş` : 'Tōlovni tasdiqlaş';
  renderAmountButtons();
}

export function openPayment(fundId = 'umumiy', presetAmount) {
  $('#payFund').value = findFund(fundId).id;
  setAmount(presetAmount || amount || 50_000);
  ['payAmount', 'payCard', 'payExp'].forEach((id) => setError(id, ''));
  $('#paymentForm').classList.remove('hidden');
  $('#paymentReceipt').classList.add('hidden');
  const user = store.state.user;
  if (user && !$('#payDonor').value) $('#payDonor').value = user.name;
  openModal('paymentModal');
}

function validate() {
  let ok = true;
  if (amount < MIN_AMOUNT) ok = setError('payAmount', `Eng kam summa — ${fmtSom(MIN_AMOUNT)}.`) && ok;
  else setError('payAmount', '');

  const card = digits($('#payCard').value);
  if (card.length !== 16) ok = setError('payCard', 'Karta raqami 16 ta raqamdan iborat bōlişi kerak.') && ok;
  else setError('payCard', '');

  const exp = $('#payExp').value;
  const m = /^(\d{2})\/(\d{2})$/.exec(exp);
  if (!m || +m[1] < 1 || +m[1] > 12) ok = setError('payExp', 'OO/YY kōrinişida') && ok;
  else {
    const end = new Date(2000 + +m[2], +m[1], 1); // keyingi oyning 1-kuni
    if (end <= new Date()) ok = setError('payExp', 'Muddati tugagan') && ok;
    else setError('payExp', '');
  }
  return ok;
}

function renderReceipt(d) {
  const fund = findFund(d.fund);
  $('#receiptId').textContent = `MEHR — Elektron kvitansiya #${d.id}`;
  $('#receiptAmount').textContent = fmtSom(d.amount);
  const rows = [
    ['Loyiha', fund.title],
    ['Xayriyaçi', d.anonymous ? 'Anonim xayriyaçi' : d.donor],
    ['Karta', d.cardMask],
    ['Sana', fmtDateTime(d.date)],
    ['Komissiya', '0 sōm'],
  ];
  if (DEMO_MODE) rows.push(['Holat', 'Demo — haqiqiy tōlov amalga oşirilmadi']);
  $('#receiptDetails').innerHTML = rows
    .map(
      ([k, v]) => `<div class="flex justify-between gap-4 px-4 py-2.5"><dt class="text-slate-500 dark:text-slate-400">${k}</dt><dd class="font-bold text-right">${esc(v)}</dd></div>`,
    )
    .join('');
}

async function submit(e) {
  e.preventDefault();
  if (!validate()) {
    $('#paymentForm [aria-invalid="true"]')?.focus();
    return;
  }
  const btn = $('#paySubmit');
  btn.disabled = true;
  btn.querySelector('i').className = 'fa-solid fa-spinner fa-spin';
  $('#paySubmitLabel').textContent = 'Tekşirilmoqda...';
  await new Promise((r) => setTimeout(r, 1100));

  const card = digits($('#payCard').value);
  const donorName = $('#payDonor').value.trim();
  const donation = {
    id: uid('MEHR-'),
    fund: $('#payFund').value,
    amount,
    donor: donorName || 'Anonim xayriyaçi',
    anonymous: $('#payAnon').checked || !donorName,
    cardMask: `${cardBrand(card) || 'Karta'} •••• ${card.slice(-4)}`,
    date: new Date().toISOString(),
  };
  // Karta raqamining ōzi hech qaçon saqlanmaydi — faqat oxirgi 4 ta raqam
  const saved = store.update((s) => s.donations.push(donation));
  lastReceipt = donation;

  $('#payCard').value = '';
  $('#payExp').value = '';
  $('#payCardBrand').textContent = '';
  btn.disabled = false;
  btn.querySelector('i').className = 'fa-solid fa-lock';
  setAmount(amount);

  renderReceipt(donation);
  $('#paymentForm').classList.add('hidden');
  $('#paymentReceipt').classList.remove('hidden');
  $('#paymentReceipt button')?.focus();
  if (!saved) toast("Kvitansiya kōrsatildi, lekin qurilma xotirasiga saqlab bōlmadi.", 'warn');
}

export function initPayment() {
  $('#payFund').innerHTML = FUNDS.map((f) => `<option value="${f.id}">${esc(f.title)}</option>`).join('');
  if (DEMO_MODE) {
    $('#paymentDemo').classList.remove('hidden');
    $('#paymentDemo').classList.add('flex');
  }
  renderAmountButtons();

  $('#payAmounts').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pay-amount]');
    if (b) {
      setAmount(b.dataset.payAmount);
      setError('payAmount', '');
    }
  });
  $('#payAmount').addEventListener('input', (e) => setAmount(e.target.value));

  $('#payCard').addEventListener('input', (e) => {
    const d = digits(e.target.value).slice(0, 16);
    e.target.value = d.match(/.{1,4}/g)?.join(' ') || '';
    $('#payCardBrand').textContent = cardBrand(d);
  });
  $('#payExp').addEventListener('input', (e) => {
    const d = digits(e.target.value).slice(0, 4);
    e.target.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  });

  $('#paymentForm').addEventListener('submit', submit);

  $('#receiptShare').addEventListener('click', () => {
    if (!lastReceipt) return;
    const fund = findFund(lastReceipt.fund);
    shareOrCopy({
      title: 'MEHR — xayriya',
      text: `Men "MEHR" platformasi orqali "${fund.title}" loyihasiga ehson qildim. Siz ham qōşiling!`,
    });
  });
}
