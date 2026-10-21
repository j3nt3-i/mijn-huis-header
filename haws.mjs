// Tiny Home Assistant websocket client.
// Usage: node haws.mjs '<json message>' ['<json message>' ...]
// Reads HA_URL and HA_TOKEN from the environment or ~/.ha-env, sends the messages one after another
// and prints a JSON array with each result (or {"error": ...} when a call fails).
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const env = { ...process.env };
try {
  for (const line of readFileSync(homedir() + '/.ha-env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].trim();
  }
} catch { /* no ~/.ha-env: rely on the environment */ }
if (!env.HA_URL || !env.HA_TOKEN) { console.error('HA_URL / HA_TOKEN missing'); process.exit(1); }

const msgs = process.argv.slice(2).map((a) => JSON.parse(a));
const ws = new WebSocket(env.HA_URL.replace(/^http/, 'ws').replace(/\/$/, '') + '/api/websocket');
const results = [];
let id = 0;
const timer = setTimeout(() => { console.error('timeout'); process.exit(2); }, 120000);
const next = () => {
  if (id >= msgs.length) { clearTimeout(timer); console.log(JSON.stringify(results, null, 1)); ws.close(); return; }
  id += 1;
  ws.send(JSON.stringify({ ...msgs[id - 1], id }));
};
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.type === 'auth_required') ws.send(JSON.stringify({ type: 'auth', access_token: env.HA_TOKEN }));
  else if (m.type === 'auth_ok') next();
  else if (m.type === 'auth_invalid') { console.error('auth failed'); process.exit(3); }
  else if (m.type === 'result' && m.id === id) { results.push(m.success ? m.result : { error: m.error }); next(); }
};
ws.onerror = () => { console.error('connection failed'); process.exit(4); };
