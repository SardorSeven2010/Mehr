// Ehson kartasi: raqamni kōrsatiş va bir bosişda nusxalaş
import { DONATION_CARD_HOLDER, DONATION_CARD_NUMBER } from './config.js';
import { toast } from './utils.js';

export function cardBrand(num) {
  if (/^(8600|5614)/.test(num)) return 'UZCARD';
  if (/^9860/.test(num)) return 'HUMO';
  if (/^4/.test(num)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'MASTERCARD';
  return '';
}

const digits = String(DONATION_CARD_NUMBER).replace(/\D/g, '');
const brand = cardBrand(digits);

export const DONATION_CARD = {
  digits,
  pretty: digits.match(/.{1,4}/g)?.join(' ') || '',
  brand,
  holder: String(DONATION_CARD_HOLDER || '').trim(),
  mask: `${brand || 'Karta'} •••• ${digits.slice(-4)}`,
};

/** Matnni nusxalaş: avval Clipboard API, bōlmasa eski usul (ba'zi WebView larda) */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* pastdagi usulga ōtamiz */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

function flashCopied(btn) {
  const icon = btn.querySelector('i');
  const label = btn.querySelector('[data-copy-label]');
  const prev = { icon: icon?.className, label: label?.textContent };
  if (icon) icon.className = 'fa-solid fa-check';
  if (label) label.textContent = 'Nusxalandi';
  clearTimeout(btn._copyTimer);
  btn._copyTimer = setTimeout(() => {
    if (icon) icon.className = prev.icon;
    if (label) label.textContent = prev.label;
  }, 1800);
}

export function initDonationCard() {
  document.querySelectorAll('[data-card-number]').forEach((el) => (el.textContent = DONATION_CARD.pretty));
  document.querySelectorAll('[data-card-brand]').forEach((el) => (el.textContent = DONATION_CARD.brand));
  document.querySelectorAll('[data-card-holder]').forEach((el) => {
    el.textContent = DONATION_CARD.holder;
    el.classList.toggle('hidden', !DONATION_CARD.holder);
  });

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy-card]');
    if (!btn) return;
    if (await copyText(DONATION_CARD.digits)) {
      flashCopied(btn);
      toast(`Karta raqami nusxalandi: ${DONATION_CARD.pretty}`);
    } else {
      toast("Nusxalab bōlmadi — raqamni qōlda yozib oling.", 'warn');
    }
  });
}
