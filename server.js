#!/usr/bin/env node
// OrionWatch — local loyihalar/portlar/Docker monitoringi.  © OrionSystems
// Yengil: nol qo'shimcha kutubxona (Node ichidagi http + child_process + fs).
// Cross-platform: Windows (netstat), Linux (ss), macOS (lsof).
import { createServer } from 'node:http';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// === OrionSystems brendi — mahsulot identifikatori, o'zgartirilmaydi ===
const BRAND = Object.freeze({ product: 'OrionWatch', vendor: 'OrionSystems', year: 2026, version: '1.0.0' });

const run = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLATFORM = process.platform;
const PORT = Number(process.env.PORT) || 7575;
const HOST = process.env.HOST || 'localhost';
const OPTS = { maxBuffer: 16 * 1024 * 1024, windowsHide: true };
const STORE = process.env.STORE_PATH || path.join(__dirname, 'store.json');
const PUBLIC = path.join(__dirname, 'public');
const NEW_MS = 24 * 3600 * 1000;

const DOCKERISH = /docker|vpnkit|wslrelay|com\.docker/i;
const SYSTEM_WIN = /^(System|Idle|svchost|lsass|wininit|services|csrss|smss|spoolsv|fontdrvhost|dwm|jhi_service|WUDFHost|esrv|esrv_svc|SecurityHealthService|OneDrive\.Sync\.Service|WsToastNotification|wpscloudsvr)$/i;
const SYSTEM_NIX = /^(systemd-resolved?|systemd|rpcbind|chronyd|avahi-daemon|cupsd|dnsmasq)$/i;

/* ============================ Saqlash ============================ */
let store = { settings: { checkIntervalHours: 3, tgToken: '', tgChatId: '' }, manual: [], meta: {}, discovered: {}, lastAlertAt: 0 };
function loadStore() {
  if (existsSync(STORE)) {
    try {
      const d = JSON.parse(readFileSync(STORE, 'utf8'));
      store = { ...store, ...d, settings: { ...store.settings, ...(d.settings || {}) } };
    } catch (e) { console.error('store.json o\'qishda xato:', e.message); }
  }
}
async function saveStore() {
  try { await writeFile(STORE, JSON.stringify(store, null, 2)); } catch (e) { console.error('saqlashda xato:', e.message); }
}
loadStore();

/* ============================ Docker ============================ */
function extractPorts(s) {
  const set = new Map();
  const re = /(?:0\.0\.0\.0|127\.0\.0\.1|\[::1?\]):(\d+)->(\d+)\/(tcp|udp)/g;
  let m;
  while ((m = re.exec(s))) set.set(m[1] + '/' + m[3], { host: +m[1], container: +m[2], proto: m[3] });
  return [...set.values()];
}
async function getDocker() {
  try {
    const { stdout } = await run('docker ps --format "{{json .}}"', OPTS);
    const items = stdout.trim().split('\n').filter(Boolean).map(JSON.parse).map((c) => {
      const ports = extractPorts(c.Ports || '');
      return { key: 'docker:' + c.Names, kind: 'docker', name: c.Names, sub: c.Image, status: c.Status, state: c.State, ports, urls: ports.map((p) => `http://${HOST}:${p.host}`) };
    });
    return { ok: true, items };
  } catch (e) {
    return { ok: false, error: (e.stderr || e.message || '').split('\n')[0], items: [] };
  }
}

/* ============================ Local serverlar (platformaga qarab) ============================ */
function isLocalAddr(a) {
  return a === '0.0.0.0' || a === '*' || a === '::' || a === '[::]' || a === '127.0.0.1' || a === '::1' || a === '[::1]' || a.startsWith('127.');
}
function mkListener(port, proc, pid) {
  return { key: 'port:' + port, kind: 'port', name: proc || 'port ' + port, sub: pid ? 'PID ' + pid : '', status: 'LISTENING', state: 'listening', ports: [{ host: port, container: port }], urls: [`http://${HOST}:${port}`] };
}
const finalize = (items) => { items.sort((a, b) => a.ports[0].host - b.ports[0].host); return { ok: true, items }; };

async function listenersWin(dockerPorts) {
  const [ns, tl] = await Promise.all([run('netstat -ano', OPTS), run('tasklist /fo csv /nh', OPTS)]);
  const pidName = {};
  for (const line of tl.stdout.split('\n')) { const m = line.match(/^"([^"]+)","(\d+)"/); if (m) pidName[m[2]] = m[1].replace(/\.exe$/i, ''); }
  const seen = new Set(), items = [];
  for (const line of ns.stdout.split('\n')) {
    const m = line.match(/^\s*TCP\s+(.+):(\d+)\s+\S+\s+LISTENING\s+(\d+)/i);
    if (!m) continue;
    const addr = m[1], port = +m[2], pid = m[3];
    if (!isLocalAddr(addr) || seen.has(port) || port >= 49152) continue;
    seen.add(port);
    const proc = pidName[pid] || '';
    if (DOCKERISH.test(proc) || dockerPorts.has(port) || SYSTEM_WIN.test(proc)) continue;
    items.push(mkListener(port, proc, pid));
  }
  return finalize(items);
}
async function listenersLinux(dockerPorts) {
  let out = '';
  try { out = (await run('ss -ltnpH', OPTS)).stdout; } catch {}
  if (!out.trim()) { try { out = (await run('ss -ltnp', OPTS)).stdout; } catch {} }
  const seen = new Set(), items = [];
  for (const line of out.split('\n')) {
    if (!/LISTEN/i.test(line)) continue;
    const cols = line.trim().split(/\s+/);
    const local = cols.find((c) => /:\d+$/.test(c) && !c.includes('users:'));
    if (!local) continue;
    const i = local.lastIndexOf(':');
    const port = +local.slice(i + 1), addr = local.slice(0, i);
    if (!isLocalAddr(addr) || seen.has(port) || port >= 49152) continue;
    seen.add(port);
    const um = line.match(/users:\(\("([^"]+)",pid=(\d+)/);
    const proc = um ? um[1] : '', pid = um ? um[2] : '';
    if (DOCKERISH.test(proc) || dockerPorts.has(port) || SYSTEM_NIX.test(proc)) continue;
    items.push(mkListener(port, proc, pid));
  }
  return finalize(items);
}
async function listenersMac(dockerPorts) {
  const { stdout } = await run('lsof -nP -iTCP -sTCP:LISTEN', OPTS);
  const seen = new Set(), items = [];
  for (const line of stdout.split('\n')) {
    const m = line.match(/^(\S+)\s+(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+(\S+):(\d+) \(LISTEN\)/);
    if (!m) continue;
    const proc = m[1], pid = m[2], addr = m[3], port = +m[4];
    if (!isLocalAddr(addr) || seen.has(port) || port >= 49152) continue;
    seen.add(port);
    if (DOCKERISH.test(proc) || dockerPorts.has(port)) continue;
    items.push(mkListener(port, proc, pid));
  }
  return finalize(items);
}
async function getListeners(dockerPorts) {
  try {
    if (PLATFORM === 'win32') return await listenersWin(dockerPorts);
    if (PLATFORM === 'darwin') return await listenersMac(dockerPorts);
    return await listenersLinux(dockerPorts);
  } catch (e) {
    return { ok: false, error: (e.message || '').split('\n')[0], items: [] };
  }
}

async function detect() {
  const docker = await getDocker();
  const dockerPorts = new Set(docker.items.flatMap((c) => c.ports.map((p) => p.host)));
  const listeners = await getListeners(dockerPorts);
  return { docker, listeners, items: [...docker.items, ...listeners.items] };
}

/* ============================ Snapshot ============================ */
async function snapshot() {
  const { docker, listeners, items } = await detect();
  const now = Date.now();
  let changed = false;
  for (const p of items) {
    if (!store.discovered[p.key]) { store.discovered[p.key] = { firstSeen: now, label: p.name }; changed = true; }
  }
  if (changed) saveStore();

  const enrich = (p) => {
    const meta = store.meta[p.key] || {};
    const firstSeen = store.discovered[p.key]?.firstSeen || now;
    return { ...p, notes: meta.notes || '', tokens: meta.tokens || [], firstSeen, isNew: now - firstSeen < NEW_MS };
  };
  const projects = items.map(enrich);
  for (const m of store.manual) {
    projects.push({ key: 'manual:' + m.id, kind: 'manual', name: m.name, sub: m.sub || '', status: 'qo\'lda', state: 'manual', ports: [], urls: m.url ? [m.url] : [], notes: m.notes || '', tokens: m.tokens || [], firstSeen: m.createdAt || now, isNew: false });
  }
  return {
    brand: BRAND,
    platform: PLATFORM,
    generatedAt: new Date().toLocaleString('ru-RU'),
    docker: { ok: docker.ok, error: docker.error },
    listeners: { ok: listeners.ok, error: listeners.error },
    settings: { checkIntervalHours: store.settings.checkIntervalHours, tgConfigured: Boolean(store.settings.tgToken && store.settings.tgChatId) },
    projects,
  };
}

/* ============================ Telegram + monitoring ============================ */
async function tgAlert(text) {
  const { tgToken, tgChatId } = store.settings;
  if (!tgToken || !tgChatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
  } catch (e) { console.error('Telegram xato:', e.message); }
}
let monitorTimer = null;
async function runCheck(notify) {
  await snapshot();
  const since = store.lastAlertAt || 0;
  const fresh = Object.entries(store.discovered).filter(([, v]) => v.firstSeen > since);
  if (notify && fresh.length) {
    await tgAlert(`🆕 <b>${BRAND.product}</b> — yangi loyiha(lar):\n` + fresh.map(([k, v]) => `• ${v.label}  <code>${k}</code>`).join('\n'));
  }
  store.lastAlertAt = Date.now();
  await saveStore();
}
function scheduleMonitor() {
  if (monitorTimer) clearInterval(monitorTimer);
  const h = Math.max(0.05, Number(store.settings.checkIntervalHours) || 3);
  monitorTimer = setInterval(() => runCheck(true).catch(() => {}), h * 3600 * 1000);
}

/* ============================ HTTP ============================ */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
async function serveStatic(p, res) {
  const rel = p === '/' ? 'index.html' : p.replace(/^\/+/, '');
  const full = path.join(PUBLIC, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!full.startsWith(PUBLIC)) { res.statusCode = 403; return res.end('Forbidden'); }
  try {
    const data = await readFile(full);
    res.setHeader('Content-Type', TYPES[path.extname(full)] || 'application/octet-stream');
    res.end(data);
  } catch { res.statusCode = 404; res.end('Not found'); }
}
const json = (res, data, code = 200) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
const newId = () => 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
function cleanTokens(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((t) => ({ label: String(t.label || '').trim(), value: String(t.value || '').trim() })).filter((t) => t.label || t.value);
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (p.startsWith('/api/')) {
      if (p === '/api/projects' && req.method === 'GET') return json(res, await snapshot());
      if (p === '/api/manual' && req.method === 'POST') {
        const b = await readBody(req);
        if (!b.name) return json(res, { error: 'Nom kerak' }, 400);
        const m = { id: newId(), name: b.name.trim(), url: (b.url || '').trim(), sub: (b.sub || '').trim(), notes: (b.notes || '').trim(), tokens: cleanTokens(b.tokens), createdAt: Date.now() };
        store.manual.push(m); await saveStore(); return json(res, m);
      }
      const mm = p.match(/^\/api\/manual\/(.+)$/);
      if (mm) {
        const id = decodeURIComponent(mm[1]);
        const idx = store.manual.findIndex((x) => x.id === id);
        if (idx < 0) return json(res, { error: 'Topilmadi' }, 404);
        if (req.method === 'PUT') {
          const b = await readBody(req); const m = store.manual[idx];
          m.name = (b.name ?? m.name).trim(); m.url = (b.url ?? m.url).trim(); m.sub = (b.sub ?? m.sub).trim(); m.notes = (b.notes ?? m.notes).trim();
          if (b.tokens) m.tokens = cleanTokens(b.tokens);
          await saveStore(); return json(res, m);
        }
        if (req.method === 'DELETE') { store.manual.splice(idx, 1); await saveStore(); return json(res, { ok: true }); }
      }
      const meta = p.match(/^\/api\/meta\/(.+)$/);
      if (meta && req.method === 'PUT') {
        const key = decodeURIComponent(meta[1]); const b = await readBody(req);
        store.meta[key] = { notes: (b.notes || '').trim(), tokens: cleanTokens(b.tokens) };
        await saveStore(); return json(res, store.meta[key]);
      }
      if (p === '/api/settings' && req.method === 'GET') return json(res, store.settings);
      if (p === '/api/settings' && req.method === 'PUT') {
        const b = await readBody(req);
        if (b.checkIntervalHours != null) store.settings.checkIntervalHours = Math.max(0.05, Number(b.checkIntervalHours) || 3);
        if (b.tgToken != null) store.settings.tgToken = String(b.tgToken).trim();
        if (b.tgChatId != null) store.settings.tgChatId = String(b.tgChatId).trim();
        await saveStore(); scheduleMonitor(); return json(res, store.settings);
      }
      if (p === '/api/check' && req.method === 'POST') { await runCheck(true); return json(res, { ok: true }); }
      return json(res, { error: 'not found' }, 404);
    }
    return serveStatic(p, res);
  } catch (e) { return json(res, { error: e.message }, 500); }
}).listen(PORT, async () => {
  console.log(`\n🛰️  ${BRAND.product} (by ${BRAND.vendor}) → http://${HOST}:${PORT}  [${PLATFORM}]\n`);
  await runCheck(false).catch(() => {});
  scheduleMonitor();
});
