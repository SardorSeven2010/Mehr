// =====================================================================
//  MEHR — server (Supabase) sozlamalari
// =====================================================================
//  Kiriş CORE ilovasidagi kabi: email → poçtaga kelgan kod → kiriş.
//  Hozir CORE bilan bir xil Supabase loyihasi ișlatilmoqda (u yerda email
//  orqali kod yuboriş allaqaçon sozlangan). MEHR uçun alohida loyiha oçsangiz,
//  faqat quyidagi ikki qatorni almaştiring:
//  Supabase → Project Settings → API → Project URL va Publishable key.
// =====================================================================

export const SUPABASE_URL = 'https://fqswjksqlmtsiokwmsdy.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_gR8RxvY6nhzN4V1ZgMilhw_xkPxvIhS';

/** true: ilova kiriş oynasi bilan oçiladi (CORE kabi). false: kiriş ixtiyoriy. */
export const REQUIRE_LOGIN = true;

/** Sessiya saqlanadigan localStorage kaliti (index.html dagi skript ham şuni tekşiradi) */
export const AUTH_STORAGE_KEY = 'mehr-auth';

/** Qayta kod yuboriş uçun kutiş (soniya) */
export const RESEND_SECONDS = 60;
