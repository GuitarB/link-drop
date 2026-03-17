/* ============================================================
STACKD — utils.js
Shared utility functions used across all JS files
============================================================ */

// ── TOAST NOTIFICATIONS ──────────────────────────────────────
let toastTimer = null;

/**

- Show a toast notification
- @param {string} message
- @param {‘default’|‘success’|‘error’} type
- @param {number} duration ms
  */
  export function showToast(message, type = ‘default’, duration = 3000) {
  const toast = document.getElementById(‘toast’);
  if (!toast) return;

// Clear any existing timer
if (toastTimer) clearTimeout(toastTimer);

toast.textContent = message;
toast.className = ‘show’;
if (type === ‘error’)   toast.classList.add(‘toast-error’);
if (type === ‘success’) toast.classList.add(‘toast-success’);

toastTimer = setTimeout(() => {
toast.classList.remove(‘show’, ‘toast-error’, ‘toast-success’);
}, duration);
}

// ── CLIPBOARD ────────────────────────────────────────────────
/**

- Copy text to clipboard with fallback
- @param {string} text
- @returns {Promise<boolean>}
  */
  export async function copyToClipboard(text) {
  try {
  if (navigator.clipboard && navigator.clipboard.writeText) {
  await navigator.clipboard.writeText(text);
  return true;
  }
  // Fallback for older browsers / iOS
  const el = document.createElement(‘textarea’);
  el.value = text;
  el.style.cssText = ‘position:fixed;opacity:0;’;
  document.body.appendChild(el);
  el.select();
  document.execCommand(‘copy’);
  document.body.removeChild(el);
  return true;
  } catch (err) {
  console.error(‘Copy failed:’, err);
  return false;
  }
  }

// ── DOM HELPERS ──────────────────────────────────────────────
/**

- Shorthand querySelector
- @param {string} selector
- @param {Element} [parent=document]
  */
  export function $(selector, parent = document) {
  return parent.querySelector(selector);
  }

/**

- Shorthand querySelectorAll
  */
  export function $$(selector, parent = document) {
  return […parent.querySelectorAll(selector)];
  }

/**

- Create element with attributes and children
- @param {string} tag
- @param {object} attrs
- @param {…string|Element} children
  */
  export function el(tag, attrs = {}, …children) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
  if (key === ‘class’) element.className = val;
  else if (key === ‘style’) element.style.cssText = val;
  else if (key.startsWith(‘on’)) element.addEventListener(key.slice(2), val);
  else element.setAttribute(key, val);
  }
  for (const child of children) {
  if (typeof child === ‘string’) element.insertAdjacentHTML(‘beforeend’, child);
  else if (child) element.appendChild(child);
  }
  return element;
  }

// ── STRING HELPERS ───────────────────────────────────────────
/**

- Slugify a string (for usernames / URLs)
- @param {string} str
  */
  export function slugify(str) {
  return str
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9-_]/g, ‘’)
  .replace(/\s+/g, ‘-’)
  .slice(0, 30);
  }

/**

- Truncate string to maxLength with ellipsis
  */
  export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + ‘…’;
  }

/**

- Validate a URL string
  */
  export function isValidURL(str) {
  try {
  const url = new URL(str);
  return url.protocol === ‘http:’ || url.protocol === ‘https:’;
  } catch {
  return false;
  }
  }

/**

- Validate an email address
  */
  export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email);
  }

// ── LOCAL STORAGE ────────────────────────────────────────────
const STORAGE_PREFIX = ‘stackd_’;

/**

- Save data to localStorage
  */
  export function saveLocal(key, value) {
  try {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  return true;
  } catch (err) {
  console.error(‘LocalStorage save failed:’, err);
  return false;
  }
  }

/**

- Load data from localStorage
- @returns {any} parsed value or null
  */
  export function loadLocal(key, fallback = null) {
  try {
  const item = localStorage.getItem(STORAGE_PREFIX + key);
  return item ? JSON.parse(item) : fallback;
  } catch {
  return fallback;
  }
  }

/**

- Remove item from localStorage
  */
  export function removeLocal(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
  }

// ── DATE/TIME HELPERS ────────────────────────────────────────
/**

- Format a date string to human readable
- @param {string|Date} date
  */
  export function formatDate(date) {
  return new Intl.DateTimeFormat(‘en-US’, {
  month: ‘short’, day: ‘numeric’, year: ‘numeric’
  }).format(new Date(date));
  }

/**

- Relative time (e.g. “2 hours ago”)
  */
  export function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

if (minutes < 1)  return ‘just now’;
if (minutes < 60) return `${minutes}m ago`;
if (hours < 24)   return `${hours}h ago`;
if (days < 7)     return `${days}d ago`;
return formatDate(date);
}

// ── NUMBER HELPERS ───────────────────────────────────────────
/**

- Format a number with commas (e.g. 1234 → “1,234”)
  */
  export function formatNumber(n) {
  return new Intl.NumberFormat(‘en-US’).format(n);
  }

/**

- Format a large number compactly (e.g. 1234 → “1.2K”)
  */
  export function formatCompact(n) {
  return new Intl.NumberFormat(‘en-US’, { notation: ‘compact’ }).format(n);
  }

// ── DEBOUNCE ─────────────────────────────────────────────────
/**

- Debounce a function call
- @param {Function} fn
- @param {number} delay ms
  */
  export function debounce(fn, delay = 300) {
  let timer;
  return (…args) => {
  clearTimeout(timer);
  timer = setTimeout(() => fn(…args), delay);
  };
  }

// ── MODAL HELPERS ────────────────────────────────────────────
/**

- Open a modal overlay
  */
  export function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
  overlay.classList.add(‘open’);
  document.body.style.overflow = ‘hidden’;
  }
  }

/**

- Close a modal overlay
  */
  export function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
  overlay.classList.remove(‘open’);
  document.body.style.overflow = ‘’;
  }
  }

// ── SHARE HELPERS ────────────────────────────────────────────
/**

- Share a URL using the Web Share API or fallback to copy
- @param {string} url
- @param {string} title
  */
  export async function shareURL(url, title = ‘Check out my Stackd page!’) {
  if (navigator.share) {
  try {
  await navigator.share({ title, url });
  return true;
  } catch { /* user cancelled */ }
  }
  // Fallback: copy to clipboard
  const copied = await copyToClipboard(url);
  if (copied) showToast(‘Link copied to clipboard! 🎉’, ‘success’);
  return copied;
  }

/**

- Open Twitter share dialog
  */
  export function shareTwitter(url, text = ‘Check out my Stackd page!’) {
  window.open(
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  ‘_blank’,
  ‘width=550,height=420’
  );
  }

// ── THEME HELPERS ────────────────────────────────────────────
export const THEMES = [
{ id: ‘purple’,  name: ‘Purple’,  bg: ‘#0D0D0D’, card: ‘#181818’, accent: ‘#A855F7’, text: ‘#FFFFFF’, grad: ‘135deg,#A855F7,#EC4899’ },
{ id: ‘cyan’,    name: ‘Cyan’,    bg: ‘#020F12’, card: ‘#071418’, accent: ‘#06B6D4’, text: ‘#F0FFFE’, grad: ‘135deg,#06B6D4,#6366F1’ },
{ id: ‘lime’,    name: ‘Lime’,    bg: ‘#080C00’, card: ‘#0F1500’, accent: ‘#84CC16’, text: ‘#F7FFE0’, grad: ‘135deg,#84CC16,#22C55E’ },
{ id: ‘rose’,    name: ‘Rose’,    bg: ‘#0F0508’, card: ‘#1A0810’, accent: ‘#F43F5E’, text: ‘#FFF0F3’, grad: ‘135deg,#F43F5E,#FB923C’ },
{ id: ‘indigo’,  name: ‘Indigo’,  bg: ‘#06060F’, card: ‘#0E0E1A’, accent: ‘#6366F1’, text: ‘#F0F0FF’, grad: ‘135deg,#6366F1,#A855F7’ },
{ id: ‘amber’,   name: ‘Amber’,   bg: ‘#0C0800’, card: ‘#180D00’, accent: ‘#F59E0B’, text: ‘#FFFBEB’, grad: ‘135deg,#F59E0B,#EF4444’ },
{ id: ‘teal’,    name: ‘Teal’,    bg: ‘#00080A’, card: ‘#001215’, accent: ‘#14B8A6’, text: ‘#F0FFFD’, grad: ‘135deg,#14B8A6,#6366F1’ },
{ id: ‘pink’,    name: ‘Pink’,    bg: ‘#0F0008’, card: ‘#1A0010’, accent: ‘#EC4899’, text: ‘#FFF0F8’, grad: ‘135deg,#EC4899,#A855F7’ },
{ id: ‘orange’,  name: ‘Orange’,  bg: ‘#0C0400’, card: ‘#180600’, accent: ‘#F97316’, text: ‘#FFF7F0’, grad: ‘135deg,#F97316,#EAB308’ },
{ id: ‘white’,   name: ‘White’,   bg: ‘#F5F5F5’, card: ‘#FFFFFF’, accent: ‘#6366F1’, text: ‘#111111’, grad: ‘135deg,#6366F1,#A855F7’ },
];

/**

- Get theme object by id
  */
  export function getTheme(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
  }