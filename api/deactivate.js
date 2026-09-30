import { requireAuth } from '../lib/auth.js';
import { setStatus } from '../lib/notion.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!requireAuth(req, res)) return;
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    const asset = await setStatus(id, 'Inactive');
    res.status(200).json({ asset });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
