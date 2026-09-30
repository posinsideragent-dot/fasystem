import { isAuthed } from '../lib/auth.js';

export default function handler(req, res) {
  res.status(isAuthed(req) ? 200 : 401).json({ authed: isAuthed(req) });
}
