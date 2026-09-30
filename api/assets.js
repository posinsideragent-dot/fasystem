import { requireAuth } from '../lib/auth.js';
import { listAssets, getLocations } from '../lib/notion.js';

// GET /api/assets            -> active assets only (default)
// GET /api/assets?status=all -> everything (not used by the UI by default)
export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    const [all, locations] = await Promise.all([listAssets(), getLocations()]);
    const assets = req.query?.status === 'all' ? all : all.filter(a => a.status !== 'Inactive');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ assets, locations });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
