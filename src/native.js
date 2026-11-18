// Android ilovasi (Capacitor) uçun maxsus imkoniyatlar.
// Brauzerda bu funksiyalar hech narsa qilmaydi.
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();

/** Ilovaning ommaviy manzili — ulaşilgan xabarlarda kōrsatiladi */
export const APP_URL = 'https://sardorseven2010.github.io/Mehr/';

/** Status bar belgilarini mavzuga moslaş (qoronḡu mavzuda — oq belgilar) */
export function setSystemBarsTheme(dark) {
  if (!isNative) return;
  SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
}

/** Telefonning "Orqaga" tugmasi: avval oçiq oynani yopadi, keyin oldingi bōlimga qaytadi */
export async function initNative({ hasOpenModal, closeTopModal }) {
  if (!isNative) return;
  document.documentElement.classList.add('native-app');
  const { App } = await import('@capacitor/app');
  App.addListener('backButton', ({ canGoBack }) => {
    if (hasOpenModal()) closeTopModal();
    else if (canGoBack) window.history.back();
    else App.exitApp();
  });
}

export async function nativeShare({ title, text, url = APP_URL }) {
  const { Share } = await import('@capacitor/share');
  try {
    await Share.share({ title, text, url, dialogTitle: title });
  } catch {
    /* foydalanuvçi bekor qildi */
  }
}

/** Rasmni (data URL) vaqtinçalik faylga yozib, "Ulaşiş" oynasini oçadi: Galereya, Drive, Telegram... */
export async function nativeShareImage(dataUrl, fileName, title) {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);
  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: dataUrl.split(',')[1],
    directory: Directory.Cache,
  });
  try {
    await Share.share({ title, files: [uri], dialogTitle: title });
  } catch {
    /* foydalanuvçi bekor qildi */
  }
}
