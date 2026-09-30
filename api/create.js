import { requireAuth } from '../lib/auth.js';
import { createAsset, listAssets } from '../lib/notion.js';

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!requireAuth(req, res)) return;
  const b = req.body || {};
  const data = { model: clean(b.model), brand: clean(b.brand), serial: clean(b.serial), person: clean(b.person), location: clean(b.location), date: clean(b.date) };
  if (!data.model) return res.status(400).json({ error: 'Model is required' });
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  try {
    if (data.serial) {
      const dup = (await listAssets()).find(a => a.serial.toLowerCase() === data.serial.toLowerCase());
      if (dup) return res.status(409).json({ error: `Serial number already exists (${dup.model}, ${dup.status})` });
    }
    const asset = await createAsset(data);
    res.status(201).json({ asset });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
