/* ============================================================
STACKD — config.js
Public configuration — safe to commit to GitHub.
Secret keys NEVER go here. They go in .env (gitignored).

For Cloudflare Pages, set environment variables in:
Cloudflare Dashboard → Pages → Your project → Settings →
Environment Variables

These are the ONLY keys safe to expose in frontend code
because Supabase anon keys are designed to be public —
Row Level Security (RLS) policies protect your data.
============================================================ */

// ── SUPABASE ─────────────────────────────────────────────────
// Replace these with your actual Supabase project values.
// Get them from: supabase.com → Your Project → Settings → API

export const SUPABASE_URL      = ‘YOUR_SUPABASE_URL’;
// e.g. ‘https://xyzcompany.supabase.co’

export const SUPABASE_ANON_KEY = ‘YOUR_SUPABASE_ANON_KEY’;
// e.g. ‘eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…’
// This key is SAFE to commit — it’s designed to be public.
// RLS policies (set in Supabase) protect your data.

// ── STRIPE ───────────────────────────────────────────────────
// Replace with your Stripe publishable key (also safe to commit).
// Get it from: dashboard.stripe.com → Developers → API Keys

export const STRIPE_PUBLISHABLE_KEY = ‘YOUR_STRIPE_PUBLISHABLE_KEY’;
// e.g. ‘pk_live_…’ or ‘pk_test_…’ for testing

// ── STRIPE PRICE IDs ─────────────────────────────────────────
// Create products in Stripe Dashboard and paste the Price IDs here.

export const STRIPE_PRO_MONTHLY_PRICE_ID      = ‘price_XXXX’; // $5/month
export const STRIPE_BUSINESS_MONTHLY_PRICE_ID = ‘price_XXXX’; // $19/month

// ── APP CONFIG ───────────────────────────────────────────────
export const APP_NAME    = ‘Stackd’;
export const APP_DOMAIN  = ‘stackd.bio’;
export const APP_URL     = ‘https://stackd.bio’;

export const FREE_LINK_LIMIT = 5;
export const PRO_LINK_LIMIT  = Infinity;

// ── FEATURE FLAGS ────────────────────────────────────────────
// Toggle features on/off without changing code
export const FEATURES = {
auth:       true,   // Enable login/signup
analytics:  true,   // Enable click tracking (Pro)
stripe:     false,  // Enable payments (set true when Stripe is live)
affiliate:  false,  // Enable affiliate program tracking
};