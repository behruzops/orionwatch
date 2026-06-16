'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mask = (v) => (v && v.length > 4 ? '••••' + v.slice(-4) : '••••');

/* ===================== i18n: UZ / RU / EN ===================== */
const I18N = {
  uz: {
    auto: 'Auto 5s', check: '🔔 Tekshirish', checkTitle: 'Hozir yangi loyihalarni tekshirish',
    add: '➕ Loyiha', settingsTitle: 'Sozlamalar', refreshTitle: 'Yangilash',
    updated: 'Yangilangan', monEvery: 'har %n soatda monitoring',
    secDocker: '🐳 Docker containerlar', secLocal: '⚙️ Local serverlar', secManual: "📌 Qo'lda qo'shilgan",
    dockerHint: 'Docker Desktop ishlayaptimi?', empty: "Yo'q", edit: '✏️ Tahrirlash',
    newBadge: '🆕 YANGI', manualBadge: "qo'lda", noPorts: 'port nashr qilinmagan',
    copied: 'Nusxa olindi', copyFail: 'Nusxa olinmadi', saved: 'Saqlandi', deleted: "O'chirildi",
    added: "Qo'shildi", checked: 'Tekshirildi', settingsSaved: 'Sozlamalar saqlandi',
    nameReq: 'Nom kerak', confirmDel: "Loyiha o'chirilsinmi?",
    fName: 'Nomi', fUrl: 'URL / manzil', fDesc: 'Tavsif', fNote: 'Izoh', notePh: 'eslatma...',
    descPh: 'masalan: Node API', tokens: 'Tokenlar / maxfiy kalitlar', tokName: 'nom (Telegram)', tokVal: 'qiymat / token',
    addToken: '➕ Token', save: '💾 Saqlash', cancel: 'Bekor', del: "🗑️ O'chirish",
    addTitle: '➕ Yangi loyiha', addSubmit: "➕ Qo'shish",
    settingsH: '⚙️ Sozlamalar', intervalL: "Monitoring oralig'i (soat) — yangi loyiha tekshiruvi",
    tgHead: '📨 Telegram ogohlantirish (yangi loyiha aniqlanganda)', botToken: 'Bot token', chatId: 'Chat ID',
    checkNow: '🔔 Hozir tekshirish', rights: 'barcha huquqlar himoyalangan', err: 'Xato', loading: 'Yuklanmoqda…',
  },
  ru: {
    auto: 'Авто 5с', check: '🔔 Проверить', checkTitle: 'Проверить новые проекты сейчас',
    add: '➕ Проект', settingsTitle: 'Настройки', refreshTitle: 'Обновить',
    updated: 'Обновлено', monEvery: 'мониторинг каждые %n ч',
    secDocker: '🐳 Docker контейнеры', secLocal: '⚙️ Локальные серверы', secManual: '📌 Добавлены вручную',
    dockerHint: 'Docker Desktop запущен?', empty: 'Нет', edit: '✏️ Изменить',
    newBadge: '🆕 НОВЫЙ', manualBadge: 'вручную', noPorts: 'порты не опубликованы',
    copied: 'Скопировано', copyFail: 'Не удалось скопировать', saved: 'Сохранено', deleted: 'Удалено',
    added: 'Добавлено', checked: 'Проверено', settingsSaved: 'Настройки сохранены',
    nameReq: 'Нужно имя', confirmDel: 'Удалить проект?',
    fName: 'Название', fUrl: 'URL / адрес', fDesc: 'Описание', fNote: 'Заметка', notePh: 'заметка...',
    descPh: 'напр.: Node API', tokens: 'Токены / секретные ключи', tokName: 'имя (Telegram)', tokVal: 'значение / токен',
    addToken: '➕ Токен', save: '💾 Сохранить', cancel: 'Отмена', del: '🗑️ Удалить',
    addTitle: '➕ Новый проект', addSubmit: '➕ Добавить',
    settingsH: '⚙️ Настройки', intervalL: 'Интервал мониторинга (ч) — проверка новых проектов',
    tgHead: '📨 Telegram оповещение (при новом проекте)', botToken: 'Токен бота', chatId: 'Chat ID',
    checkNow: '🔔 Проверить сейчас', rights: 'все права защищены', err: 'Ошибка', loading: 'Загрузка…',
  },
  en: {
    auto: 'Auto 5s', check: '🔔 Check', checkTitle: 'Check for new projects now',
    add: '➕ Project', settingsTitle: 'Settings', refreshTitle: 'Refresh',
    updated: 'Updated', monEvery: 'monitoring every %nh',
    secDocker: '🐳 Docker containers', secLocal: '⚙️ Local servers', secManual: '📌 Added manually',
    dockerHint: 'Is Docker Desktop running?', empty: 'None', edit: '✏️ Edit',
    newBadge: '🆕 NEW', manualBadge: 'manual', noPorts: 'no published ports',
    copied: 'Copied', copyFail: 'Copy failed', saved: 'Saved', deleted: 'Deleted',
    added: 'Added', checked: 'Checked', settingsSaved: 'Settings saved',
    nameReq: 'Name required', confirmDel: 'Delete project?',
    fName: 'Name', fUrl: 'URL / address', fDesc: 'Description', fNote: 'Note', notePh: 'note...',
    descPh: 'e.g.: Node API', tokens: 'Tokens / secrets', tokName: 'name (Telegram)', tokVal: 'value / token',
    addToken: '➕ Token', save: '💾 Save', cancel: 'Cancel', del: '🗑️ Delete',
    addTitle: '➕ New project', addSubmit: '➕ Add',
    settingsH: '⚙️ Settings', intervalL: 'Monitoring interval (h) — new project check',
    tgHead: '📨 Telegram alert (when a new project appears)', botToken: 'Bot token', chatId: 'Chat ID',
    checkNow: '🔔 Check now', rights: 'all rights reserved', err: 'Error', loading: 'Loading…',
  },
};
let lang = localStorage.getItem('ow_lang') || 'uz';
if (!I18N[lang]) lang = 'uz';
const t = (k) => (I18N[lang] && I18N[lang][k]) ?? I18N.uz[k] ?? k;

function applyI18n() {
  document.documentElement.lang = lang;
  $('#check').textContent = t('check');
  $('#check').title = t('checkTitle');
  $('#add').textContent = t('add');
  $('#settings').title = t('settingsTitle');
  $('#refresh').title = t('refreshTitle');
  $('#autoLabel').textContent = t('auto');
  $$('#langsw button').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
}

async function api(path, method = 'GET', body) {
  const r = await fetch('/api' + path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || t('err'));
  return d;
}
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  $('#toast').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
async function copy(v) {
  try { await navigator.clipboard.writeText(v); toast(t('copied')); } catch { toast(t('copyFail'), 'err'); }
}

/* ---------- Brend (qotirilgan) ---------- */
function applyBrand(b) {
  if (!b) return;
  document.title = b.product + ' — ' + b.vendor;
  const brand = $('#brand');
  if (brand) {
    const pre = b.product.replace(/Watch$/, '');
    brand.innerHTML = '🛰️ ' + esc(pre) + '<span>' + esc(b.product.slice(pre.length)) + '</span>';
  }
  const vendor = $('#vendor');
  if (vendor) vendor.textContent = 'by ' + b.vendor;
  const foot = $('#foot');
  if (foot) foot.textContent = '🛰️ ' + b.product + ' v' + b.version + ' · © ' + b.year + ' ' + b.vendor + ' — ' + t('rights');
}

/* ---------- Kartochka ---------- */
function card(p) {
  const stateBadge =
    p.kind === 'manual' ? `<span class="badge manual">${t('manualBadge')}</span>`
    : p.state === 'running' || p.state === 'listening' ? `<span class="badge up">${esc(p.status)}</span>`
    : `<span class="badge down">${esc(p.status)}</span>`;
  const urls = p.urls.length
    ? '<div class="chips">' + p.urls.map((u) => `<a class="chip" href="${esc(u)}" target="_blank">${esc(u.replace(/^https?:\/\//, ''))}</a>`).join('') + '</div>'
    : (p.kind !== 'manual' ? `<div class="sub">${t('noPorts')}</div>` : '');
  const toks = p.tokens.length
    ? '<div class="chips">' + p.tokens.map((tk, i) => `<span class="tok" data-key="${esc(p.key)}" data-i="${i}">🔑 ${esc(tk.label || 'token')} <span class="v">${esc(mask(tk.value))}</span></span>`).join('') + '</div>'
    : '';
  const note = p.notes ? `<div class="note">📝 ${esc(p.notes)}</div>` : '';
  return `<div class="card ${p.isNew ? 'new' : ''}" data-key="${esc(p.key)}">
    <div class="top"><b>${esc(p.name)}</b>${p.isNew ? `<span class="badge new">${t('newBadge')}</span>` : ''}${stateBadge}</div>
    ${p.sub ? `<div class="sub">${esc(p.sub)}</div>` : ''}
    ${urls}${toks}${note}
    <div class="cardfoot"><button class="btn sm ghost" data-edit="${esc(p.key)}">${t('edit')}</button></div>
  </div>`;
}

let DATA = { projects: [] };
function render(d) {
  DATA = d;
  applyBrand(d.brand);
  applyI18n();
  $('#meta').textContent = `${t('updated')}: ${d.generatedAt} · ${d.platform || ''} · ${t('monEvery').replace('%n', d.settings.checkIntervalHours)}` + (d.settings.tgConfigured ? ' · TG ✓' : '');
  const groups = [
    { kind: 'docker', title: t('secDocker'), err: !d.docker.ok ? d.docker.error : '' },
    { kind: 'port', title: t('secLocal'), err: !d.listeners.ok ? d.listeners.error : '' },
    { kind: 'manual', title: t('secManual'), err: '' },
  ];
  let html = '';
  for (const g of groups) {
    const items = d.projects.filter((p) => p.kind === g.kind);
    html += `<h2>${g.title} <span class="count">${items.length}</span></h2>`;
    if (g.err) html += `<div class="notice">${esc(g.err)}${g.kind === 'docker' ? ' — ' + t('dockerHint') : ''}</div>`;
    html += items.length ? `<div class="grid">${items.map(card).join('')}</div>` : `<div class="empty">${t('empty')}</div>`;
  }
  app.innerHTML = html;
  $$('[data-edit]').forEach((b) => (b.onclick = () => editModal(DATA.projects.find((p) => p.key === b.dataset.edit))));
  $$('.tok').forEach((el) => (el.onclick = () => { const p = DATA.projects.find((x) => x.key === el.dataset.key); copy(p.tokens[+el.dataset.i].value); }));
}

async function load() {
  try { render(await api('/projects')); }
  catch (e) { app.innerHTML = `<div class="notice">${t('err')}: ${esc(e.message)}</div>`; }
}

/* ---------- Modal ---------- */
function openModal(html) { $('#modalCard').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }
$('#modal').onclick = (e) => { if (e.target.id === 'modal') closeModal(); };

function tokenRow(label = '', value = '') {
  return `<div class="tokrow">
    <input class="tk-label" placeholder="${t('tokName')}" value="${esc(label)}">
    <input class="tk-value" placeholder="${t('tokVal')}" value="${esc(value)}">
    <button class="btn ghost danger sm tk-del">✕</button>
  </div>`;
}
function wireTokens() {
  const box = $('#tokbox');
  const bindDel = () => $$('.tk-del', box).forEach((b) => (b.onclick = () => b.closest('.tokrow').remove()));
  bindDel();
  $('#tokAdd').onclick = () => { box.insertAdjacentHTML('beforeend', tokenRow()); bindDel(); };
  $('#tokTg').onclick = () => { box.insertAdjacentHTML('beforeend', tokenRow('Telegram')); bindDel(); };
  $('#tokGh').onclick = () => { box.insertAdjacentHTML('beforeend', tokenRow('GitHub')); bindDel(); };
}
const readTokens = () => $$('#tokbox .tokrow').map((r) => ({ label: $('.tk-label', r).value.trim(), value: $('.tk-value', r).value.trim() })).filter((x) => x.label || x.value);
function tokenEditor(tokens) {
  return `<div class="field"><label>${t('tokens')}</label>
    <div id="tokbox">${(tokens || []).map((x) => tokenRow(x.label, x.value)).join('')}</div>
    <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
      <button class="btn sm" id="tokAdd">${t('addToken')}</button>
      <button class="btn sm" id="tokTg">📨 Telegram</button>
      <button class="btn sm" id="tokGh">🐙 GitHub</button>
    </div></div>`;
}

function editModal(p) {
  if (!p) return;
  const isManual = p.kind === 'manual';
  openModal(`
    <h3>✏️ ${esc(p.name)}</h3>
    ${isManual ? `
      <div class="field"><label>${t('fName')}</label><input id="f-name" value="${esc(p.name)}"></div>
      <div class="field"><label>${t('fUrl')}</label><input id="f-url" value="${esc(p.urls[0] || '')}" placeholder="http://localhost:3000"></div>
      <div class="field"><label>${t('fDesc')}</label><input id="f-sub" value="${esc(p.sub)}" placeholder="${t('descPh')}"></div>`
      : `<div class="sub" style="margin-bottom:12px">${esc(p.key)}</div>`}
    <div class="field"><label>${t('fNote')}</label><textarea id="f-notes" placeholder="${t('notePh')}">${esc(p.notes)}</textarea></div>
    ${tokenEditor(p.tokens)}
    <div class="modal-actions">
      ${isManual ? `<button class="btn danger" id="del">${t('del')}</button>` : ''}
      <span class="spacer" style="flex:1"></span>
      <button class="btn ghost" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn primary" id="save">${t('save')}</button>
    </div>`);
  wireTokens();
  $('#save').onclick = async () => {
    try {
      const tokens = readTokens();
      if (isManual) {
        await api('/manual/' + encodeURIComponent(p.key.replace('manual:', '')), 'PUT', { name: $('#f-name').value, url: $('#f-url').value, sub: $('#f-sub').value, notes: $('#f-notes').value, tokens });
      } else {
        await api('/meta/' + encodeURIComponent(p.key), 'PUT', { notes: $('#f-notes').value, tokens });
      }
      closeModal(); toast(t('saved')); load();
    } catch (e) { toast(e.message, 'err'); }
  };
  if (isManual) $('#del').onclick = async () => {
    if (!confirm(t('confirmDel'))) return;
    try { await api('/manual/' + encodeURIComponent(p.key.replace('manual:', '')), 'DELETE'); closeModal(); toast(t('deleted')); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
}

function addModal() {
  openModal(`
    <h3>${t('addTitle')}</h3>
    <div class="field"><label>${t('fName')} *</label><input id="f-name"></div>
    <div class="field"><label>${t('fUrl')}</label><input id="f-url" placeholder="http://localhost:3000"></div>
    <div class="field"><label>${t('fDesc')}</label><input id="f-sub" placeholder="${t('descPh')}"></div>
    <div class="field"><label>${t('fNote')}</label><textarea id="f-notes"></textarea></div>
    ${tokenEditor([])}
    <div class="modal-actions">
      <button class="btn ghost" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn primary" id="save">${t('addSubmit')}</button>
    </div>`);
  wireTokens();
  $('#save').onclick = async () => {
    const name = $('#f-name').value.trim();
    if (!name) return toast(t('nameReq'), 'err');
    try { await api('/manual', 'POST', { name, url: $('#f-url').value, sub: $('#f-sub').value, notes: $('#f-notes').value, tokens: readTokens() }); closeModal(); toast(t('added')); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
}

async function settingsModal() {
  const s = await api('/settings');
  openModal(`
    <h3>${t('settingsH')}</h3>
    <div class="field"><label>${t('intervalL')}</label><input id="s-int" type="number" step="0.5" min="0.05" value="${esc(s.checkIntervalHours)}"></div>
    <h3 style="font-size:14px;margin:18px 0 10px">${t('tgHead')}</h3>
    <div class="field"><label>${t('botToken')}</label><input id="s-tok" value="${esc(s.tgToken || '')}" placeholder="123456:ABC..."></div>
    <div class="field"><label>${t('chatId')}</label><input id="s-chat" value="${esc(s.tgChatId || '')}" placeholder="123456789"></div>
    <div class="modal-actions">
      <button class="btn" id="now">${t('checkNow')}</button>
      <span class="spacer" style="flex:1"></span>
      <button class="btn ghost" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn primary" id="save">${t('save')}</button>
    </div>`);
  $('#save').onclick = async () => {
    try { await api('/settings', 'PUT', { checkIntervalHours: $('#s-int').value, tgToken: $('#s-tok').value, tgChatId: $('#s-chat').value }); closeModal(); toast(t('settingsSaved')); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  $('#now').onclick = async () => { try { await api('/check', 'POST'); toast(t('checked')); } catch (e) { toast(e.message, 'err'); } };
}

/* ---------- Boshqaruv ---------- */
window.closeModal = closeModal;
$('#refresh').onclick = load;
$('#add').onclick = addModal;
$('#settings').onclick = settingsModal;
$('#check').onclick = async () => { try { await api('/check', 'POST'); toast(t('checked')); load(); } catch (e) { toast(e.message, 'err'); } };
$$('#langsw button').forEach((b) => (b.onclick = () => { lang = b.dataset.lang; localStorage.setItem('ow_lang', lang); applyI18n(); load(); }));
let timer = setInterval(load, 5000);
$('#auto').onchange = (e) => { clearInterval(timer); if (e.target.checked) timer = setInterval(load, 5000); };
applyI18n();
load();
