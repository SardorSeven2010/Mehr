import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

/** Build paytida service worker yaratadi va barça fayllarni oflayn kesh rōyxatiga qōşadi. */
function mehrServiceWorker() {
  return {
    name: 'mehr-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const publicFiles = [
        './',
        'index.html',
        'manifest.webmanifest',
        'icons/favicon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable-512.png',
        'icons/apple-touch-icon.png',
        'images/1000019450.jpg',
        'images/1000019418.jpg',
        'images/1000019451.jpg',
      ];
      const built = Object.keys(bundle).filter((f) => !/\.(map|ttf)$/.test(f) && !/inter-(greek|vietnamese)/.test(f) && f !== 'sw.js');
      const urls = [...new Set([...publicFiles, ...built])];
      const version = createHash('sha256').update(urls.join('|')).digest('hex').slice(0, 10);
      const source = readFileSync(new URL('./src/sw.js', import.meta.url), 'utf8')
        .replace('self.__MEHR_PRECACHE__', JSON.stringify(urls, null, 2))
        .replace('__MEHR_VERSION__', version);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [mehrServiceWorker()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
