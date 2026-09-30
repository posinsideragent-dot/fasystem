// Shared helpers for all pages
export async function api(path, body) {
  const r = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  if (r.status === 401 && !location.pathname.endsWith('/login')) { location.href = '/login'; throw new Error('Not signed in'); }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.append(t); }
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(t._h); t._h = setTimeout(() => (t.style.display = 'none'), 2600);
}

export function shell(active) {
  const links = [['/', 'Dashboard'], ['/add', 'Add asset'], ['/update', 'Update assets'], ['/deactivate', 'Deactivate assets']];
  document.querySelector('header').innerHTML = `<div class="bar"><span class="logo">Fixed Assets</span><nav>${links.map(([h, l]) => `<a href="${h}" class="${h === active ? 'on' : ''}">${l}</a>`).join('')}</nav><button class="btn ghost" id="out">Sign out</button></div>`;
  document.getElementById('out').onclick = async () => { await fetch('/api/logout', { method: 'POST' }); location.href = '/login'; };
}

export function matches(a, q) {
  q = q.trim().toLowerCase();
  return !q || [a.model, a.brand, a.serial, a.person, a.location].some(v => (v || '').toLowerCase().includes(q));
}

// Count by key; brands are grouped case-insensitively
export function countBy(list, key, label = v => v) {
  const m = new Map();
  for (const a of list) {
    const raw = (a[key] || '').trim();
    const k = raw ? raw.toLowerCase() : '';
    const cur = m.get(k) || { name: raw ? label(raw) : 'Unassigned', n: 0 };
    cur.n++; m.set(k, cur);
  }
  return [...m.values()].sort((a, b) => b.n - a.n);
}
