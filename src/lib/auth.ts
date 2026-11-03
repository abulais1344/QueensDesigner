/**
 * DEMO ONLY. This check runs in the browser, so it keeps casual visitors out of
 * the admin screens but is not real security — anyone can read these values in
 * the bundle. Replace with server-side auth (e.g. Supabase Auth) before going live.
 */
export const DEMO_ADMIN = { email: 'admin@queenscollection.in', password: 'queens@2026' }

const SESSION_KEY = 'qc.admin-session'

export function isAdminSignedIn() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === DEMO_ADMIN.email
  } catch {
    return false
  }
}

export function signIn(email: string, password: string) {
  const ok = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password
  if (ok) sessionStorage.setItem(SESSION_KEY, DEMO_ADMIN.email)
  return ok
}

export function signOut() {
  sessionStorage.removeItem(SESSION_KEY)
}
