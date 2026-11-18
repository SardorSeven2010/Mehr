import { toast } from './utils.js';

/** Tizimning "Ulaşiş" oynasi, bōlmasa — matnni nusxalaş */
export async function shareOrCopy({ title, text, url = location.href.split('#')[0] }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('Havola nusxalandi — dōstlaringizga yuboring!');
  } catch {
    toast("Ulaşişning iloji bōlmadi.", 'warn');
  }
}
