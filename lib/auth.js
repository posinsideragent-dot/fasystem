import crypto from 'node:crypto';

const COOKIE = 'fa_session';
const MAX_AGE = 60 * 60 * 12; // 12 hours

function sign(value) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || '').update(value).digest('hex');
}

export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function makeCookie() {
  const exp = Date.now() + MAX_AGE * 1000;
  const val = `${exp}.${sign(String(exp))}`;
  return `${COOKIE}=${val}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
}

export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function isAuthed(req) {
  if (!process.env.SESSION_SECRET || !process.env.APP_PASSWORD) return false;
  const raw = req.headers.cookie || '';
  const m = raw.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='));
  if (!m) return false;
  const [exp, sig] = m.slice(COOKIE.length + 1).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

export function requireAuth(req, res) {
  if (isAuthed(req)) return true;
  res.status(401).json({ error: 'Not signed in' });
  return false;
}
