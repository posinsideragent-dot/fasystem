const API = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';

function headers() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    'Notion-Version': VERSION,
    'Content-Type': 'application/json',
  };
}

async function call(path, method, body) {
  const r = await fetch(API + path, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || `Notion error ${r.status}`);
  return data;
}

const text = (p) => (p?.rich_text || p?.title || []).map(t => t.plain_text).join('').trim();

export function toAsset(page) {
  const p = page.properties;
  return {
    id: page.id,
    model: text(p['Model']),
    brand: text(p['Brand']),
    serial: text(p['Serial Number']),
    person: text(p['Person in Charge']),
    location: p['Location']?.select?.name || '',
    date: p['Date']?.date?.start || '',
    // Rows without a status are treated as Active
    status: p['Status']?.select?.name || 'Active',
  };
}

export async function listAssets() {
  const dbId = process.env.NOTION_DATABASE_ID;
  const out = [];
  let cursor;
  do {
    const data = await call(`/databases/${dbId}/query`, 'POST', { page_size: 100, start_cursor: cursor });
    out.push(...data.results.map(toAsset));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  // Ignore fully blank rows
  return out.filter(a => a.model || a.brand || a.serial);
}

export async function getLocations() {
  const db = await call(`/databases/${process.env.NOTION_DATABASE_ID}`, 'GET');
  return (db.properties['Location']?.select?.options || []).map(o => o.name);
}

const rt = (s) => ({ rich_text: s ? [{ text: { content: s } }] : [] });

export async function updateAsset(id, { location, person }) {
  const properties = {};
  if (location !== undefined) properties['Location'] = location ? { select: { name: location } } : { select: null };
  if (person !== undefined) properties['Person in Charge'] = rt(person);
  const page = await call(`/pages/${id}`, 'PATCH', { properties });
  return toAsset(page);
}

export async function setStatus(id, status) {
  const page = await call(`/pages/${id}`, 'PATCH', { properties: { Status: { select: { name: status } } } });
  return toAsset(page);
}
