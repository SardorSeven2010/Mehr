// Ehson oynasi: loyiha va summa tanlanadi, pul bank ilovasi orqali MEHR kartasiga ōtkaziladi
import { FUNDS, QUICK_AMOUNTS, findFund } from '../data.js';
import { DONATION_CARD } from '../card.js';
import { store } from '../store.js';
import { $, esc, fmt, fmtDateTime, fmtSom, openModal, toast, uid } from '../utils.js';
import { shareOrCopy } from '../share.js';

const MIN_AMOUNT = 1_000;
const MAX_AMOUNT = 100_000_000;
let amount = 50_000;
let lastReceipt = null;

const digits = (v) => String(v || '').replace(/\D/g, '');

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
  $('#payTransferAmount').textContent = amount ? fmtSom(amount) : 'tanlangan summani';
  $('#paySubmitLabel').textContent = amount ? `${fmtSom(amount)} ōtkazdim` : 'Ōtkazdim';
  renderAmountButtons();
}

export function openPayment(fundId = 'umumiy', presetAmount) {
  $('#payFund').value = findFund(fundId).id;
  setAmount(presetAmount || amount || 50_000);
  setError('payAmount', '');
  $('#paymentForm').classList.remove('hidden');
  $('#paymentReceipt').classList.add('hidden');
  const user = store.state.user;
  if (user && !$('#payDonor').value) $('#payDonor').value = user.name;
  openModal('paymentModal');
}

function renderReceipt(d) {
  const fund = findFund(d.fund);
  $('#receiptId').textContent = `MEHR — Ehson qayd etildi #${d.id}`;
  $('#receiptAmount').textContent = fmtSom(d.amount);
  const rows = [
    ['Loyiha', fund.title],
    ['Xayriyaçi', d.anonymous ? 'Anonim xayriyaçi' : d.donor],
    ['Qabul qiluvçi karta', d.toCard],
    ['Sana', fmtDateTime(d.date)],
    ['Holat', 'Siz qayd etdingiz (bank tasdiḡi emas)'],
  ];
  $('#receiptDetails').innerHTML = rows
    .map(
      ([k, v]) => `<div class="flex justify-between gap-4 px-4 py-2.5"><dt class="text-slate-500 dark:text-slate-400">${k}</dt><dd class="font-bold text-right">${esc(v)}</dd></div>`,
    )
    .join('');
}

function submit(e) {
  e.preventDefault();
  if (amount < MIN_AMOUNT) {
    setError('payAmount', `Eng kam summa — ${fmtSom(MIN_AMOUNT)}.`);
    $('#payAmount').focus();
    return;
  }
  setError('payAmount', '');

  const donorName = $('#payDonor').value.trim();
  const donation = {
    id: uid('MEHR-'),
    fund: $('#payFund').value,
    amount,
    donor: donorName || 'Anonim xayriyaçi',
    anonymous: $('#payAnon').checked || !donorName,
    toCard: DONATION_CARD.mask,
    date: new Date().toISOString(),
  };
  const saved = store.update((s) => s.donations.push(donation));
  lastReceipt = donation;

  renderReceipt(donation);
  $('#paymentForm').classList.add('hidden');
  $('#paymentReceipt').classList.remove('hidden');
  $('#paymentReceipt button')?.focus();
  if (!saved) toast("Ehson kōrsatildi, lekin qurilma xotirasiga saqlab bōlmadi.", 'warn');
}

export function initPayment() {
  $('#payFund').innerHTML = FUNDS.map((f) => `<option value="${f.id}">${esc(f.title)}</option>`).join('');
  renderAmountButtons();

  $('#payAmounts').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pay-amount]');
    if (b) {
      setAmount(b.dataset.payAmount);
      setError('payAmount', '');
    }
  });
  $('#payAmount').addEventListener('input', (e) => {
    setAmount(e.target.value);
    setError('payAmount', '');
  });

  $('#paymentForm').addEventListener('submit', submit);

  $('#receiptShare').addEventListener('click', () => {
    if (!lastReceipt) return;
    const fund = findFund(lastReceipt.fund);
    shareOrCopy({
      title: 'MEHR — xayriya',
      text: `Men "MEHR" platformasi orqali "${fund.title}" loyihasiga ehson qildim. Siz ham qōşiling! Ehson kartasi: ${DONATION_CARD.pretty}`,
    });
  });
}
