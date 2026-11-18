// Supabase orqali kiriş: email ga kod yuboriş, kodni tekşiriş, profil va çiqiş
// Faqat kiriş moduli (@supabase/auth-js) ișlatiladi — ilova hajmi kiçik bōlişi uçun.
import { AuthClient } from '@supabase/auth-js';
import { AUTH_STORAGE_KEY, SUPABASE_KEY, SUPABASE_URL } from './config.js';

const auth = new AuthClient({
  url: `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1`,
  headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
  storageKey: AUTH_STORAGE_KEY,
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: false,
});
export const supabase = { auth };

/** Supabase foydalanuvçisidan MEHR profili (ma'lumotlar user_metadata da "mehr_" bilan saqlanadi) */
export function profileFromUser(user) {
  if (!user) return null;
  const m = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || m.email || '',
    name: m.mehr_name || '',
    phone: m.mehr_phone || '',
    role: m.mehr_role || 'Ōquvçi',
    createdAt: m.mehr_joined_at || user.created_at || new Date().toISOString(),
  };
}

export const isProfileComplete = (profile) => !!profile?.name;

/** Xatolarni foydalanuvçiga tuşunarli matnga aylantiriş (CORE dagi kabi) */
export function authErrorText(error, { verifying = false } = {}) {
  const raw = `${error?.code || ''} ${error?.status || ''} ${error?.message || ''}`.toLowerCase();
  if (!navigator.onLine || raw.includes('failed to fetch') || raw.includes('network')) {
    return "Internet bilan boḡlanib bōlmadi. Qayta urinib kōring.";
  }
  if (raw.includes('rate') || raw.includes('429') || raw.includes('security purposes')) {
    return "Juda kōp uriniş bōldi. Birozdan keyin qayta urinib kōring.";
  }
  if (raw.includes('error sending') || raw.includes('smtp')) {
    return "Tasdiqlaş xatini yuborib bōlmadi. Keyinroq urinib kōring.";
  }
  if (verifying || raw.includes('otp') || raw.includes('token') || raw.includes('expired')) {
    return "Kod xato yoki muddati ōtgan!";
  }
  if (raw.includes('invalid') && raw.includes('email')) return "Iltimos, toḡri elektron poçta kiriting!";
  return error?.message ? `Xatolik: ${error.message}` : "Kutilmagan xatolik. Qayta urinib kōring.";
}

export async function sendCode(email) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function verifyCode(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  if (!data?.user) throw new Error('otp: no user');
  return data.user;
}

export async function saveProfile({ name, phone, role, joinedAt }) {
  const { data, error } = await supabase.auth.updateUser({
    data: { mehr_name: name, mehr_phone: phone, mehr_role: role, mehr_joined_at: joinedAt },
  });
  if (error) throw error;
  return data.user;
}

/** Saqlangan sessiyani tekşiradi. Internet bōlmasa ham saqlangan sessiya bilan davom etadi. */
export async function currentUser() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user || null;
  } catch {
    return null;
  }
}

/** Faqat şu qurilmadan çiqiş. Internet bōlmasa ham sessiya qurilmadan ōçiriladi. */
export async function signOut() {
  let failed = false;
  try {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    failed = !!error;
  } catch {
    failed = true;
  }
  if (failed) {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(`${AUTH_STORAGE_KEY}-user`);
    } catch {
      /* e'tiborsiz */
    }
  }
}

export const onSignedOut = (fn) =>
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') fn();
  });
