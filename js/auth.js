/* ============================================================
STACKD — auth.js
Authentication: sign up, log in, log out, session management
Uses Supabase. Keys come from config.js (never hardcoded here)
============================================================ */

import { showToast, isValidEmail, saveLocal, removeLocal, openModal, closeModal } from ‘./utils.js’;
import { SUPABASE_URL, SUPABASE_ANON_KEY } from ‘./config.js’;

// ── SUPABASE CLIENT ──────────────────────────────────────────
// Supabase is loaded via CDN <script> in HTML — window.supabase
let supabase = null;

export function initSupabase() {
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
console.warn(‘Stackd: Supabase keys not set. Auth features disabled.’);
return false;
}
try {
supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
return true;
} catch (err) {
console.error(‘Supabase init failed:’, err);
return false;
}
}

// ── SESSION ──────────────────────────────────────────────────
let currentUser = null;

/**

- Get the currently logged-in user (or null)
  */
  export async function getUser() {
  if (!supabase) return null;
  try {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  return user;
  } catch {
  return null;
  }
  }

/**

- Check if a user is currently logged in
  */
  export async function isLoggedIn() {
  const user = await getUser();
  return !!user;
  }

/**

- Check if user has Pro subscription
- Reads from the `profiles` table in Supabase
  */
  export async function isPro() {
  if (!supabase) return false;
  const user = await getUser();
  if (!user) return false;
  try {
  const { data, error } = await supabase
  .from(‘profiles’)
  .select(‘is_pro’)
  .eq(‘id’, user.id)
  .single();
  if (error) return false;
  return data?.is_pro === true;
  } catch {
  return false;
  }
  }

// ── SIGN UP ──────────────────────────────────────────────────
/**

- Create a new account with email + password
- @param {string} email
- @param {string} password
- @param {string} [username]
  */
  export async function signUp(email, password, username = ‘’) {
  if (!supabase) { showToast(‘Auth not configured’, ‘error’); return { error: true }; }
  if (!isValidEmail(email)) { showToast(‘Please enter a valid email’, ‘error’); return { error: true }; }
  if (password.length < 8)  { showToast(‘Password must be 8+ characters’, ‘error’); return { error: true }; }

try {
const { data, error } = await supabase.auth.signUp({
email,
password,
options: {
data: { username: username || email.split(’@’)[0] }
}
});

```
if (error) {
  showToast(error.message || 'Sign up failed', 'error');
  return { error };
}

showToast('Check your email to confirm your account! 📬', 'success', 5000);
return { data };
```

} catch (err) {
showToast(‘Something went wrong. Try again.’, ‘error’);
return { error: err };
}
}

// ── LOG IN ───────────────────────────────────────────────────
/**

- Log in with email + password
  */
  export async function logIn(email, password) {
  if (!supabase) { showToast(‘Auth not configured’, ‘error’); return { error: true }; }

try {
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

```
if (error) {
  showToast('Incorrect email or password', 'error');
  return { error };
}

currentUser = data.user;
showToast('Welcome back! 👋', 'success');
onAuthSuccess(data.user);
return { data };
```

} catch (err) {
showToast(‘Login failed. Try again.’, ‘error’);
return { error: err };
}
}

// ── MAGIC LINK ───────────────────────────────────────────────
/**

- Send a magic link (passwordless login)
  */
  export async function sendMagicLink(email) {
  if (!supabase) { showToast(‘Auth not configured’, ‘error’); return { error: true }; }
  if (!isValidEmail(email)) { showToast(‘Enter a valid email’, ‘error’); return { error: true }; }

try {
const { error } = await supabase.auth.signInWithOtp({
email,
options: { emailRedirectTo: window.location.origin + ‘/app.html’ }
});

```
if (error) { showToast(error.message, 'error'); return { error }; }

showToast('Magic link sent! Check your inbox ✉️', 'success', 5000);
return { success: true };
```

} catch (err) {
return { error: err };
}
}

// ── LOG OUT ──────────────────────────────────────────────────
export async function logOut() {
if (!supabase) return;
await supabase.auth.signOut();
currentUser = null;
removeLocal(‘is_pro’);
showToast(‘Logged out. See you soon! 👋’);
setTimeout(() => { window.location.href = ‘/’; }, 1000);
}

// ── AUTH STATE LISTENER ──────────────────────────────────────
/**

- Listen for auth changes (login, logout, token refresh)
- Call this once on page load
  */
  export function watchAuthState(callback) {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null;
  callback(event, session);
  });
  }

// ── POST-AUTH ACTIONS ────────────────────────────────────────
function onAuthSuccess(user) {
// Close any open auth modals
closeModal(‘auth-modal’);
// Update UI nav (show avatar, hide login button)
updateNavForUser(user);
}

// ── UI UPDATES ───────────────────────────────────────────────
export function updateNavForUser(user) {
const loginBtn  = document.getElementById(‘nav-login-btn’);
const userMenu  = document.getElementById(‘nav-user-menu’);
const userEmail = document.getElementById(‘nav-user-email’);

if (user) {
if (loginBtn)  loginBtn.classList.add(‘hidden’);
if (userMenu)  userMenu.classList.remove(‘hidden’);
if (userEmail) userEmail.textContent = user.email;
} else {
if (loginBtn)  loginBtn.classList.remove(‘hidden’);
if (userMenu)  userMenu.classList.add(‘hidden’);
}
}

// ── FORM BINDINGS ────────────────────────────────────────────
/**

- Bind the login/signup form in the auth modal
- Expects elements: #auth-email, #auth-password, #auth-submit-btn
  */
  export function bindAuthForm() {
  const form      = document.getElementById(‘auth-form’);
  const emailInp  = document.getElementById(‘auth-email’);
  const passInp   = document.getElementById(‘auth-password’);
  const submitBtn = document.getElementById(‘auth-submit-btn’);
  const toggleBtn = document.getElementById(‘auth-toggle-btn’);
  const modeLabel = document.getElementById(‘auth-mode-label’);

if (!form) return;

let mode = ‘login’; // ‘login’ | ‘signup’

// Toggle between login/signup
if (toggleBtn) {
toggleBtn.addEventListener(‘click’, () => {
mode = mode === ‘login’ ? ‘signup’ : ‘login’;
if (modeLabel) modeLabel.textContent = mode === ‘login’ ? ‘Log In’ : ‘Create Account’;
toggleBtn.textContent = mode === ‘login’
? “Don’t have an account? Sign up”
: ‘Already have an account? Log in’;
if (passInp) passInp.style.display = mode === ‘login’ ? ‘’ : ‘’;
});
}

// Submit
form.addEventListener(‘submit’, async (e) => {
e.preventDefault();
const email    = emailInp?.value?.trim();
const password = passInp?.value;

```
if (!email || !password) return;

if (submitBtn) {
  submitBtn.disabled = true;
  submitBtn.textContent = mode === 'login' ? 'Logging in...' : 'Creating account...';
}

const result = mode === 'login'
  ? await logIn(email, password)
  : await signUp(email, password);

if (submitBtn) {
  submitBtn.disabled = false;
  submitBtn.textContent = mode === 'login' ? 'Log In' : 'Create Account';
}
```

});
}