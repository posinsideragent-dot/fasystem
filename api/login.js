import { makeCookie, safeEqual } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) {
    return res.status(500).json({ error: 'Server not configured (APP_PASSWORD / SESSION_SECRET missing)' });
  }
  const { password } = req.body || {};
  if (!password || !safeEqual(password, process.env.APP_PASSWORD)) {
    return res.status(401).json({ error: 'Wrong password' });
  }
  res.setHeader('Set-Cookie', makeCookie());
  res.status(200).json({ ok: true });
}
