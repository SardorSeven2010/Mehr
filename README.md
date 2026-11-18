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
- **Kiriş / rōyxatdan ōtiş** — email va poçtaga kelgan kod orqali (CORE kabi), rol: Ōquvçi / Xayriyaçi / Volontyor; **"Mening hisobim"** — kurslar natijasi va ehsonlar tarixi.
- **Yorqin / qoronḡu rejim** (tanlov eslab qolinadi, boşida tizim sozlamasiga moslaşadi).
- Bōlimlar manzilda saqlanadi (`#xayriya`, `#talim`...) — "Orqaga" tugmasi ișlaydi, havolani ulaşiş mumkin.
- Jamoa suratlarini ilova ichidan tanlaş (surat şu qurilmada saqlanadi).
- Hisob (email, ism, rol) serverda (Supabase); kurs natijalari va ehsonlar hozircha foydalanuvçi qurilmasida (`localStorage`) saqlanadi.

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

**GitHub Pages (avtomatik):** repozitoriyda `.github/workflows/deploy.yml` bor. Bir marta **Settings → Pages → Build and deployment → Source: GitHub Actions** ni tanlang — şundan keyin har bir push ilovani avtomatik yangilaydi. Manzil: `https://sardorseven2010.github.io/Mehr/`

**Boşqa hosting:** `npm run build` yaratgan `dist/` papkasini istalgan statik hostingga yuklang: GitHub Pages, Netlify, Vercel, Cloudflare Pages yoki ōz serveringiz. Ilova nisbiy yōllardan foydalanadi, şuning uçun pastki papkada ham ișlaydi. PWA (ōrnatiş va oflayn rejim) faqat **HTTPS**da ișlaydi.

## Kiriş va rōyxatdan ōtiş

CORE ilovasidagi kabi: foydalanuvçi emailini kiritadi → poçtasiga bir martalik kod keladi → kodni kiritib kiradi (parol yōq). Birinçi marta kirganda ismi, roli va (ixtiyoriy) telefon raqami sōraladi.

- Server: **Supabase Auth** (`src/config.js`). Hozir CORE bilan bir xil Supabase loyihasi ișlatiladi — u yerda email orqali kod yuboriş allaqaçon sozlangan. MEHR profili foydalanuvçining `user_metadata` sida `mehr_name`, `mehr_role`, `mehr_phone` kalitlari bilan saqlanadi, CORE jadvallariga tegilmaydi.
- MEHR uçun alohida Supabase loyihasi kerak bōlsa: loyiha oçing, **Authentication → Emails → Magic Link** şablonida kod (`{{ .Token }}`) bōlişini tekşiring va `src/config.js` dagi `SUPABASE_URL` / `SUPABASE_KEY` ni almaştiring.
- `REQUIRE_LOGIN = true` — ilova kiriş oynasi bilan oçiladi. `false` qilinsa, kiriş ixtiyoriy bōladi (kursga yoziliş kabi amallarda sōraladi).
- Sessiya qurilmada saqlanadi: ilova qayta oçilganda yana kod sōralmaydi. "Hisobdan çiqiş" faqat şu qurilmadan çiqaradi.

## Android ilovasi (APK)

Ilova [Capacitor](https://capacitorjs.com/) yordamida Android ilovasiga ōralgan (`android/` papkasi, paket nomi `uz.mehr.app`).

- **Tayyor APK:** har bir push'dan keyin GitHub Actions APK'ni yiḡadi va repozitoriyning **Releases** sahifasiga `MEHR.apk` qilib joylaydi. Telefondan şu sahifani oçib, faylni yuklab oling va ōrnating (telefon "noma'lum manbalardan ōrnatiş"ga ruxsat sōraydi).
- **Kompyuterda yiḡiş:** Android Studio (yoki Android SDK) va JDK 21 kerak. `npm run android:apk` → `android/app/build/outputs/apk/debug/app-debug.apk`.
- Veb-kodni ōzgartirgandan keyin `npm run android:sync` ni ișga tușiring.
- Ikonka va splash manbalari: `assets/` (`npx @capacitor/assets generate --android` bilan qayta yaratiladi).

Hozirgi APK — sinov (debug) imzosi bilan. Google Play uçun alohida imzo kaliti bilan AAB fayl kerak bōladi.

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
