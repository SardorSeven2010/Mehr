# MEHR — Xayriya platformasi va ta'lim portali

`prototip/MEHR_HTML_Prototipi_2.html` asosida yaratilgan **PWA ilova**: telefonga va kompyuterga oddiy ilova kabi ōrnatiladi, internet bōlmaganda ham oçiladi.

## Imkoniyatlar

| Bōlim | Nima qiladi |
|---|---|
| **Boş sahifa** | Hero, tezkor ehson oynasi, barça bōlimlar bir sahifada |
| **Asosçi** | Narzullayeva Nilufar Nuraliyevna haqida |
| **Xayriya** | 4 ta maqsadli fond: bajariliş foizi, xayriyaçilar soni, ehson tugmasi, ulaşiş; "Qanday ișlaydi" va **şaffof reyestr** (sōnggi ehsonlar) |
| **Ta'lim portali** | 8 ta bepul kurs, qidiruv va yōnaliş filtri. Kursga yoziliş → darslarni belgilaş → yakunida **PNG sertifikat** (foydalanuvçi ismi bilan) |
| **Xizmatlar** | 11 ta xizmat, Ta'lim / Xayriya / Ijtimoiy filtrlari |
| **Statistika** | KPI kartoçkalar, hududlar bōyiça grafik, oylik tuşumlar grafigi (kursor bilan qiymat), fondlar bajarilişi, har bir grafik uçun jadval kōrinişi |
| **Muharrirlar** | Madiyorov Sardor Firdavsoviç va Hotamov Uluḡbek Umedoviç |

Qōşimça:
- **Tōlov oynasi** — summa, karta raqami (Uzcard/Humo/Visa aniqlanadi), muddat tekşiruvi, anonim ehson, elektron kvitansiya va ulaşiş.
- **Rōyxatdan ōtiş** (Ōquvçi / Xayriyaçi / Volontyor) va **"Mening hisobim"** — kurslar natijasi va ehsonlar tarixi.
- **Yorqin / qoronḡu rejim** (tanlov eslab qolinadi, boşida tizim sozlamasiga moslaşadi).
- Bōlimlar manzilda saqlanadi (`#xayriya`, `#talim`...) — "Orqaga" tugmasi ișlaydi, havolani ulaşiş mumkin.
- Jamoa suratlarini ilova ichidan tanlaş (surat şu qurilmada saqlanadi).
- Barça ma'lumotlar foydalanuvçi qurilmasida (`localStorage`) saqlanadi.

## Ișga tușiriş

Node.js 18+ kerak.

```bash
npm install
npm run dev       # ișlab çiqiş rejimi: http://localhost:5173
npm run build     # tayyor ilova → dist/ papkasi
npm run preview   # dist/ ni tekşiriş: http://localhost:4173
```

## Telefonga ōrnatiş

Ilova HTTPS orqali joylaştirilgandan sōng:
- **Android (Chrome):** menyu (⋮) → "Ilovani ōrnatiş" yoki saytdagi **Ōrnatiş** tugmasi.
- **iPhone (Safari):** "Ulaşiş" → "Bosh ekranga qōşiş".

## Joylaştiriş (hosting)

`npm run build` yaratgan `dist/` papkasini istalgan statik hostingga yuklang: GitHub Pages, Netlify, Vercel, Cloudflare Pages yoki ōz serveringiz. Ilova nisbiy yōllardan foydalanadi, şuning uçun pastki papkada ham ișlaydi. PWA (ōrnatiş va oflayn rejim) faqat **HTTPS**da ișlaydi.

## Ma'lumotlarni tahrirlaş

Barça matn va raqamlar bitta faylda: **`src/data.js`**
- `PROJECTS` — xayriya loyihalari (maqsad, yiḡilgan summa, tavsif, rasm)
- `COURSES` — kurslar va darslar rōyxati
- `SERVICES` — xizmatlar
- `STATS` — hududlar va oylik tuşumlar
- `REGISTRY_SEED` — reyestrdagi namuna yozuvlar
- `DEMO_MODE` — `true` bōlsa, tōlov oynasida va statistikada "demo" ogohlantiriși kōrinadi

> ⚠️ Hozirgi statistika, summalar va reyestr yozuvlari **namuna (demo)** ma'lumotlardir. Ilovani ommaga oçişdan oldin ularni haqiqiy ma'lumotlar bilan almaştiring.

**Jamoa suratlari:** `public/images/` papkasiga `1000019450.jpg` (asosçi), `1000019418.jpg` va `1000019451.jpg` (muharrirlar) fayllarini joylaştiring. Fayl bōlmasa, bosh harfli zaxira kartoçka kōrsatiladi.

## Loyiha tuzilmasi

```
index.html              sahifa tuzilmasi (sarlavha, hero, bōlimlar, modal oynalar)
src/main.js             kiriş nuqtasi: mavzu, navigatsiya, umumiy tugmalar
src/data.js             barça kontent va raqamlar
src/store.js            qurilmadagi ma'lumotlar ombori
src/sections/*.js       bōlimlar: xayriya, kurslar, xizmatlar, statistika, jamoa
src/modals/*.js         tōlov, rōyxatdan ōtiş va profil oynalari
src/pwa.js, src/sw.js   oflayn rejim va ōrnatiş
public/                 manifest, ikonkalar, suratlar
prototip/               dastlabki HTML prototip
```

## Keyingi qadamlar

1. **Haqiqiy tōlov** — Payme, Click yoki Uzum Bank bilan ulaş uçun merchant hisob va server (backend) kerak. Hozir tōlov faqat demo: pul yeçilmaydi, karta raqami hech qayerga yuborilmaydi va saqlanmaydi (faqat oxirgi 4 raqam kvitansiyada).
2. **Server va ma'lumotlar bazasi** — rōyxatdan ōtiş, reyestr va kurs natijalari barça qurilmalarda umumiy bōlişi uçun.
3. **Google Play uçun APK/AAB** — tayyor PWA ni [PWABuilder](https://www.pwabuilder.com/) yoki Capacitor yordamida Android paketiga aylantiriş mumkin.
