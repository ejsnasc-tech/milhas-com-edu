const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Credenciais (variáveis de ambiente) ─────────────────────── */
const AUTH_USER = process.env.AUTH_USER || 'admin';
const AUTH_PASS = process.env.AUTH_PASS || 'milhas2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 'milhas-edu-secret-' + Math.random().toString(36);

/* ── Session ─────────────────────────────────────────────────── */
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
  }
}));

/* ── Auth Middleware ─────────────────────────────────────────── */
function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  res.redirect('/login');
}

/* ── gflights (ESM dynamic import) ──────────────────────────── */
let queryOneWay = null;
async function loadGflights() {
  const mod = await import('gflights');
  queryOneWay = mod.queryOneWay;
}

/* ── Cache ───────────────────────────────────────────────────── */
const cache = new Map();
function getCached(key) {
  const e = cache.get(key);
  if (e && Date.now() < e.expiry) return e.data;
  if (e) cache.delete(key);
  return null;
}
function setCache(key, data, ttl) { cache.set(key, { data, expiry: Date.now() + ttl }); }
setInterval(() => { const now = Date.now(); for (const [k, v] of cache) { if (now >= v.expiry) cache.delete(k); } }, 300000);

/* ── Login routes ────────────────────────────────────────────── */
app.get('/login', (req, res) => {
  if (req.session && req.session.loggedIn) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === AUTH_USER && password === AUTH_PASS) {
    req.session.loggedIn = true;
    res.redirect('/');
  } else {
    res.redirect('/login?error=1');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

/* ── Static & main app (protegidos) ─────────────────────────── */
app.get('/', requireAuth, (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/logo.svg', requireAuth, (_req, res) => {
  res.sendFile(path.join(__dirname, 'logo.svg'));
});

/* ── API: Status ─────────────────────────────────────────────── */
app.get('/api/status', requireAuth, (_req, res) => {
  res.json({ configured: !!queryOneWay });
});

/* ── API: Search Flights ─────────────────────────────────────── */
app.get('/api/search', requireAuth, async (req, res) => {
  const { origin, destination, date } = req.query;
  if (!origin || !destination || !date)
    return res.status(400).json({ error: 'Parâmetros obrigatórios: origin, destination, date' });
  if (!/^[A-Z]{3}$/i.test(origin) || !/^[A-Z]{3}$/i.test(destination))
    return res.status(400).json({ error: 'Códigos IATA inválidos' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Data inválida (YYYY-MM-DD)' });

  const cacheKey = 'search:' + origin.toUpperCase() + ':' + destination.toUpperCase() + ':' + date;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    if (!queryOneWay) throw new Error('gflights não carregado');
    const r = await queryOneWay(origin.toUpperCase(), destination.toUpperCase(), date);
    if (r.error) throw new Error(r.error);

    const byAirline = {};
    (r.itineraries || []).forEach(it => {
      const airlines = it.legs?.map(l => l.airline).filter(Boolean) || [];
      const mainAirline = airlines[0] || 'Unknown';
      const priceBrl = Math.round(it.price);
      if (!byAirline[mainAirline] || priceBrl < byAirline[mainAirline].price) {
        byAirline[mainAirline] = {
          price: priceBrl,
          currency: 'BRL',
          airline: mainAirline,
          carriers: [...new Set(airlines)],
          stops: it.stops || 0,
          duration: it.totalDuration || 0
        };
      }
    });

    const results = Object.values(byAirline).sort((a, b) => a.price - b.price);
    setCache(cacheKey, results, 1800000);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Erro na busca: ' + err.message });
  }
});

/* ── Start ───────────────────────────────────────────────────── */
async function start() {
  console.log('');
  console.log('  ✈️  Milhas com Edu');
  await loadGflights();
  console.log('  ✅ Google Flights conectado (sem API key)');
  app.listen(PORT, () => {
    console.log('  📡 http://localhost:' + PORT);
    console.log('');
  });
}
start().catch(err => { console.error('Erro ao iniciar:', err); process.exit(1); });

