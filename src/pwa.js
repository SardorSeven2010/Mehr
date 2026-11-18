// PWA: oflayn işlaş (service worker) va ilovani ōrnatiş
import { $, $$, closeModal, openModal, toast } from './utils.js';

let deferredPrompt = null;

const setInstallVisible = (visible) =>
  $$('[data-install]').forEach((b) => {
    b.classList.toggle('hidden', !visible);
    b.classList.toggle('flex', visible);
  });

export function initPWA() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    const hadController = !!navigator.serviceWorker.controller;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) toast('Ilova yangilandi. Yangi imkoniyatlar sahifa qayta oçilganda işlaydi.', 'info', 5000);
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setInstallVisible(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setInstallVisible(false);
    closeModal('installModal');
    toast('MEHR ilovasi qurilmangizga ōrnatildi!');
  });

  document.addEventListener('click', async (e) => {
    if (e.target.closest('[data-install-help]')) return openModal('installModal');
    if (!e.target.closest('[data-install]')) return;
    if (!deferredPrompt) return openModal('installModal');
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => null);
    deferredPrompt = null;
    setInstallVisible(false);
  });

  const bar = $('#offlineBar');
  const updateOnline = () => {
    bar.classList.toggle('hidden', navigator.onLine);
    bar.classList.toggle('flex', !navigator.onLine);
  };
  window.addEventListener('online', () => {
    updateOnline();
    toast('Internet aloqasi tiklandi.', 'success', 2500);
  });
  window.addEventListener('offline', updateOnline);
  updateOnline();
}
