/* ============================================================
STACKD — app.js
Core builder logic: links, preview, tabs, theme picker
Imports from utils.js — no Supabase yet (added in auth.js)
============================================================ */

import {
showToast, copyToClipboard, shareTwitter,
saveLocal, loadLocal, slugify, debounce,
THEMES, getTheme, $, $$, el
} from ‘./utils.js’;

// ── STATE ────────────────────────────────────────────────────
const FREE_LINK_LIMIT = 5;

let state = loadLocal(‘builder_state’) || {
name:      ‘Your Name’,
bio:       ‘Creator · Maker · Dreamer ✨’,
emoji:     ‘🌟’,
username:  ‘yourname’,
themeId:   ‘purple’,
btnStyle:  ‘pill’,
bgStyle:   ‘dark’,
links: [
{ id: uid(), emoji: ‘📸’, label: ‘Instagram’, url: ‘https://instagram.com’ },
{ id: uid(), emoji: ‘🎵’, label: ‘My Music’,  url: ‘https://spotify.com’  },
{ id: uid(), emoji: ‘🛍️’, label: ‘Shop’,      url: ‘https://yourshop.com’ },
]
};

// Simulated pro status — replaced by auth.js later
let isPro = loadLocal(‘is_pro’) || false;

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener(‘DOMContentLoaded’, () => {
buildThemeGrid();
renderLinkList();
syncFormToState();
updatePreview();
bindEvents();
});

// ── UNIQUE ID ────────────────────────────────────────────────
function uid() {
return Math.random().toString(36).slice(2, 9);
}

// ── SYNC FORM → STATE ────────────────────────────────────────
function syncFormToState() {
const set = (id, key) => {
const el = document.getElementById(id);
if (el) el.value = state[key] ?? ‘’;
};
set(‘inp-name’,     ‘name’);
set(‘inp-bio’,      ‘bio’);
set(‘inp-emoji’,    ‘emoji’);
set(‘inp-username’, ‘username’);
set(‘btn-style’,    ‘btnStyle’);
set(‘bg-style’,     ‘bgStyle’);
}

// ── BIND EVENTS ──────────────────────────────────────────────
function bindEvents() {
const onInput = (id, key) => {
const el = document.getElementById(id);
if (!el) return;
el.addEventListener(‘input’, debounce(() => {
state[key] = el.value;
if (key === ‘username’) state.username = slugify(el.value) || ‘yourname’;
saveLocal(‘builder_state’, state);
updatePreview();
}, 150));
};

onInput(‘inp-name’,     ‘name’);
onInput(‘inp-bio’,      ‘bio’);
onInput(‘inp-emoji’,    ‘emoji’);
onInput(‘inp-username’, ‘username’);
onInput(‘btn-style’,    ‘btnStyle’);
onInput(‘bg-style’,     ‘bgStyle’);

// Publish copy button
const copyBtn = document.getElementById(‘copy-btn’);
if (copyBtn) {
copyBtn.addEventListener(‘click’, async () => {
const url = document.getElementById(‘page-url’)?.value;
if (!url) return;
const ok = await copyToClipboard(url);
if (ok) {
copyBtn.textContent = ‘✓ Copied’;
copyBtn.classList.add(‘copied’);
showToast(‘Link copied! 🎉’, ‘success’);
setTimeout(() => {
copyBtn.textContent = ‘Copy’;
copyBtn.classList.remove(‘copied’);
}, 2500);
}
});
}

// Share chips
document.querySelectorAll(’[data-share]’).forEach(btn => {
btn.addEventListener(‘click’, () => {
const platform = btn.dataset.share;
const url = document.getElementById(‘page-url’)?.value || ‘’;
if (platform === ‘twitter’) {
shareTwitter(url);
} else {
showToast(`Paste your link in your ${platform} bio!`, ‘default’);
}
});
});
}

// ── TABS ─────────────────────────────────────────────────────
export function switchTab(name) {
$$(’.tab-panel’).forEach(p => p.classList.remove(‘active’));
$$(’.tab-btn’).forEach(b => b.classList.remove(‘active’));
const panel = document.getElementById(‘tab-’ + name);
const btn   = document.querySelector(`[data-tab="${name}"]`);
if (panel) panel.classList.add(‘active’);
if (btn)   btn.classList.add(‘active’);
}

// Make switchTab globally available for inline onclick in HTML
window.switchTab = switchTab;

// ── THEME GRID ───────────────────────────────────────────────
function buildThemeGrid() {
const grid = document.getElementById(‘theme-grid’);
if (!grid) return;
grid.innerHTML = ‘’;
THEMES.forEach(t => {
const swatch = el(‘div’, {
class: ‘theme-swatch’ + (t.id === state.themeId ? ’ active’ : ‘’),
title: t.name,
style: `background: linear-gradient(${t.grad})`,
onclick: () => setTheme(t.id),
});
grid.appendChild(swatch);
});
}

function setTheme(id) {
state.themeId = id;
$$(’.theme-swatch’).forEach((s, i) => {
s.classList.toggle(‘active’, THEMES[i].id === id);
});
saveLocal(‘builder_state’, state);
updatePreview();
}

// ── LINK LIST ────────────────────────────────────────────────
function renderLinkList() {
const list = document.getElementById(‘link-list’);
if (!list) return;
list.innerHTML = ‘’;

state.links.forEach((link, i) => {
const card = el(‘div’, { class: ‘link-card’ });
card.innerHTML = `<button class="link-del-btn" data-index="${i}" aria-label="Remove link">×</button> <div class="link-card-row"> <input class="emoji-inp" type="text" value="${link.emoji}" maxlength="4" placeholder="🔗" data-field="emoji" data-index="${i}"> <input type="text" value="${link.label}" placeholder="Link title" data-field="label" data-index="${i}"> </div> <div class="link-card-row"> <input type="url" value="${link.url}" placeholder="https://..." data-field="url" data-index="${i}"> </div>`;
list.appendChild(card);
});

// Update link count badge
const countEl = document.getElementById(‘link-count’);
if (countEl) {
countEl.textContent = `${state.links.length}/${isPro ? '∞' : FREE_LINK_LIMIT}`;
countEl.className = ‘link-count’ + (!isPro && state.links.length >= FREE_LINK_LIMIT ? ’ at-limit’ : ‘’);
}

// Bind input events
list.querySelectorAll(‘input[data-field]’).forEach(input => {
input.addEventListener(‘input’, debounce(() => {
const idx   = parseInt(input.dataset.index);
const field = input.dataset.field;
if (state.links[idx]) {
state.links[idx][field] = input.value;
saveLocal(‘builder_state’, state);
updatePreview();
}
}, 150));
});

// Bind delete buttons
list.querySelectorAll(’.link-del-btn’).forEach(btn => {
btn.addEventListener(‘click’, () => {
const idx = parseInt(btn.dataset.index);
removeLink(idx);
});
});

updatePreview();
}

export function addLink() {
if (!isPro && state.links.length >= FREE_LINK_LIMIT) {
showToast(`Free plan allows ${FREE_LINK_LIMIT} links. Upgrade to Pro for unlimited! ✦`, ‘error’);
return;
}
state.links.push({ id: uid(), emoji: ‘✨’, label: ‘New Link’, url: ‘https://’ });
saveLocal(‘builder_state’, state);
renderLinkList();
}

function removeLink(index) {
state.links.splice(index, 1);
saveLocal(‘builder_state’, state);
renderLinkList();
}

// Make globally accessible
window.addLink = addLink;

// ── LIVE PREVIEW ─────────────────────────────────────────────
export function updatePreview() {
const t         = getTheme(state.themeId);
const btnStyle  = state.btnStyle  || ‘pill’;
const bgStyle   = state.bgStyle   || ‘dark’;

// Background
const phone = document.getElementById(‘preview-phone’);
if (!phone) return;

let bg = t.bg;
if (bgStyle === ‘gradient’) bg = `linear-gradient(160deg, ${t.bg} 0%, ${t.accent}22 100%)`;
if (bgStyle === ‘light’)    bg = ‘#F5F5F5’;
phone.style.background = bg;

// Button border radius
const br = btnStyle === ‘square’ ? ‘8px’ : btnStyle === ‘outline’ ? ‘12px’ : ‘100px’;

// Avatar
const avatar = document.getElementById(‘pp-avatar’);
if (avatar) {
avatar.textContent = state.emoji || ‘😊’;
avatar.style.background = `linear-gradient(${t.grad})`;
}

// Name & bio
const nameEl = document.getElementById(‘pp-name’);
const bioEl  = document.getElementById(‘pp-bio’);
if (nameEl) { nameEl.textContent = state.name || ‘Your Name’; nameEl.style.color = t.text; }
if (bioEl)  { bioEl.textContent  = state.bio  || ‘’; }

// Links
const linksDiv = document.getElementById(‘pp-links’);
if (!linksDiv) return;
linksDiv.innerHTML = ‘’;

state.links.forEach(link => {
const a = document.createElement(‘a’);
a.className = ‘pp-link’;
a.href      = link.url;
a.target    = ‘_blank’;
a.rel       = ‘noopener noreferrer’;

```
let bgColor, border, color;
if (btnStyle === 'outline') {
  bgColor = 'transparent';
  border  = `1.5px solid ${t.accent}`;
  color   = t.accent;
} else {
  bgColor = `${t.accent}18`;
  border  = `1px solid ${t.accent}33`;
  color   = t.text;
}

a.style.cssText = `background:${bgColor};border:${border};color:${color};border-radius:${br};`;
a.innerHTML = `
  <span style="font-size:.95rem">${link.emoji}</span>
  <span style="flex:1;font-size:.7rem;font-weight:700">${link.label}</span>
  <span style="opacity:.4;font-size:.62rem">→</span>
`;
linksDiv.appendChild(a);
```

});

// Page URL
const urlInput = document.getElementById(‘page-url’);
if (urlInput) {
urlInput.value = `https://stackd.bio/${state.username || 'yourname'}`;
}
}

window.updatePreview = updatePreview;