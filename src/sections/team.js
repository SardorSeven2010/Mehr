// Asosçi va muharrirlar suratlari: ilovadagi fayl → qurilmada saqlangan surat → zaxira kartoçka
import { TEAM } from '../data.js';
import { getPhoto, setPhoto } from '../store.js';
import { $$, toast } from '../utils.js';

const MAX_SIDE = 720;

/**
 * Suratni kōrsatadi. Ilovaga joylangan rasm kōrinsa — "Suratni tanlaş" tugmasi yaşiriladi;
 * u faqat rasm topilmaganda (yoki foydalanuvçi ōzi tanlagan surat kōringanda) çiqadi.
 */
function showImage(frame, src, { bundled = false, onFail } = {}) {
  const img = frame.querySelector('[data-photo-img]');
  const fallback = frame.querySelector('[data-photo-fallback]');
  const upload = frame.querySelector('.photo-upload');
  img.onload = () => {
    img.classList.remove('hidden');
    fallback.classList.add('hidden');
    upload?.classList.toggle('hidden', bundled);
  };
  img.onerror = () => {
    if (onFail) return onFail();
    img.classList.add('hidden');
    fallback.classList.remove('hidden');
    upload?.classList.remove('hidden');
  };
  img.src = src;
}

/** Katta suratni kiçraytirib JPEG ga ōtkaziş (qurilma xotirasini tejaş uçun) */
function downscale(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const k = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * k);
        canvas.height = Math.round(image.height * k);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function initTeam() {
  $$('[data-photo]').forEach((frame) => {
    const key = frame.dataset.photo;
    const saved = getPhoto(key);
    frame.querySelector('.photo-upload')?.classList.add('hidden');
    showImage(frame, TEAM[key]?.photo, {
      bundled: true,
      onFail: () => showImage(frame, saved || TEAM[key]?.photo),
    });

    frame.querySelector('[data-photo-input]')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      if (!file.type.startsWith('image/')) return toast('Iltimos, rasm faylini tanlang.', 'warn');
      try {
        const dataUrl = await downscale(file);
        showImage(frame, dataUrl);
        if (setPhoto(key, dataUrl)) toast('Surat saqlandi.');
        else toast("Surat kōrsatildi, lekin qurilma xotirasiga saqlab bōlmadi.", 'warn');
      } catch {
        toast("Suratni oçib bōlmadi. Boşqa fayl tanlab kōring.", 'error');
      }
    });
  });
}
