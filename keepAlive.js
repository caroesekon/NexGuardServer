// ┌─────────────────────────────────────────────────────────┐
// │                      NEXGUARD                           │
// │              Next-Gen Cybersecurity Suite               │
// │                                                         │
// │  Owner:     Davis Okoth                                 │
// │  Author:    Davis Okoth                                 │
// │  Publisher: Davis Okoth                                 │
// │                                                         │
// │  © 2026 Davis Okoth. All rights reserved.               │
// └─────────────────────────────────────────────────────────┘

require('dotenv').config();

const RUST_API = process.env.RUST_API_URL || 'https://nexguardapi-gz13.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

const ping = async () => {
  try {
    const res = await fetch(`${RUST_API}/`);
    const text = await res.text();
    console.log(`[${new Date().toISOString()}] ✅ Rust API pinged — ${text}`);
  } catch (err) {
    console.log(`[${new Date().toISOString()}] ❌ Rust API ping failed: ${err.message}`);
  }
};

// Initial ping
ping();

// Keep alive every 10 minutes
setInterval(ping, PING_INTERVAL);

console.log(`[KeepAlive] Pinging ${RUST_API}/ every 10 minutes`);