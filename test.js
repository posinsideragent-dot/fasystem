// Runs the API handlers against a mocked Notion API.
import assert from 'node:assert/strict';
process.env.NOTION_TOKEN = 't'; process.env.NOTION_DATABASE_ID = 'db1';
process.env.APP_PASSWORD = 'pw'; process.env.SESSION_SECRET = 'sec';

const mk = (id, model, brand, loc, person, status) => ({ id, properties: {
  Model: { title: model ? [{ plain_text: model }] : [] }, Brand: { rich_text: brand ? [{ plain_text: brand }] : [] },
  'Serial Number': { rich_text: [] }, 'Person in Charge': { rich_text: person ? [{ plain_text: person }] : [] },
  Location: { select: loc ? { name: loc } : null }, Date: { date: null }, Status: { select: status ? { name: status } : null } } });
const pages = [mk('1','X1','Lenovo','Office','Ann','Active'), mk('2','T14','lenovo','Store','Bob',null),
  mk('3','MBP','Apple','Warehouse','Cy','Inactive'), mk('4','','','',' ',null)];
const calls = [];
globalThis.fetch = async (url, opt = {}) => {
  calls.push([opt.method, url]);
  const j = (o) => ({ ok: true, json: async () => o });
  if (url.endsWith('/databases/db1/query')) return j({ results: pages, has_more: false });
  if (url.endsWith('/databases/db1')) return j({ properties: { Location: { select: { options: [{ name: 'Office' }, { name: 'Store' }] } } } });
  if (url.includes('/pages/')) {
    const id = url.split('/').pop(); const p = pages.find(x => x.id === id); const b = JSON.parse(opt.body).properties;
    if (b.Location) p.properties.Location = b.Location; if (b['Person in Charge']) p.properties['Person in Charge'] = { rich_text: b['Person in Charge'].rich_text.map(t => ({ plain_text: t.text.content })) };
    if (b.Status) p.properties.Status = b.Status; return j(p);
  }
  throw new Error('unexpected ' + url);
};
const run = async (mod, { method = 'GET', body, cookie, query } = {}) => {
  const h = (await import(mod)).default; let out = {};
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { out.code = c; return this; }, json(o) { out.body = o; return this; } };
  await h({ method, body, query, headers: { cookie } }, res); out.headers = res.headers; return out;
};

let r = await run('./api/assets.js'); assert.equal(r.code, 401);
r = await run('./api/login.js', { method: 'POST', body: { password: 'bad' } }); assert.equal(r.code, 401);
r = await run('./api/login.js', { method: 'POST', body: { password: 'pw' } }); assert.equal(r.code, 200);
const cookie = r.headers['Set-Cookie'].split(';')[0];
r = await run('./api/assets.js', { cookie });
assert.equal(r.code, 200); assert.deepEqual(r.body.assets.map(a => a.id), ['1', '2']); // inactive + blank hidden, no-status = active
assert.deepEqual(r.body.locations, ['Office', 'Store']);
r = await run('./api/update.js', { method: 'POST', cookie, body: { id: '1', location: 'Store', person: '  Dee ' } });
assert.equal(r.body.asset.location, 'Store'); assert.equal(r.body.asset.person, 'Dee');
r = await run('./api/deactivate.js', { method: 'POST', cookie, body: { id: '2' } }); assert.equal(r.body.asset.status, 'Inactive');
r = await run('./api/assets.js', { cookie }); assert.deepEqual(r.body.assets.map(a => a.id), ['1']);
r = await run('./api/deactivate.js', { method: 'POST', body: { id: '1' } }); assert.equal(r.code, 401);
console.log('all tests passed');
