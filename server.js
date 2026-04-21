const express = require('express');
const session = require('express-session');
const bcrypt  = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // necessário para cookies de sessão funcionarem atrás do proxy do Render

/* ── Supabase (service role — server only) ───────────────────── */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const SESSION_SECRET = process.env.SESSION_SECRET || 'milhas-edu-' + Math.random().toString(36);

/* ── Middleware ──────────────────────────────────────────────── */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

/* ── Auth Middlewares ────────────────────────────────────────── */
function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  res.redirect('/login');
}
function requireAdmin(req, res, next) {
  if (req.session && req.session.loggedIn && req.session.isAdmin) return next();
  res.redirect('/');
}

/* ── gflights ────────────────────────────────────────────────── */
let queryOneWay = null;
async function loadGflights() {
  // Intercepta o fetch global para forçar locale pt-BR e moeda BRL no Google Flights
  const originalFetch = globalThis.fetch;
  globalThis.fetch = function(url, opts = {}) {
    if (typeof url === 'string' && url.includes('FlightsFrontendUi')) {
      opts = { ...opts, headers: { ...(opts.headers || {}),
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Origin': 'https://www.google.com.br',
        'Referer': 'https://www.google.com.br/travel/flights',
      }};
      // Adiciona parâmetros de moeda/locale na URL
      if (!url.includes('hl=')) {
        url += (url.includes('?') ? '&' : '?') + 'hl=pt-BR&gl=BR&curr=BRL';
      }
    }
    return originalFetch(url, opts);
  };
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

/* ── Cotação USD→BRL (cache 4h) ──────────────────────────────── */
async function getUsdToBrl() {
  const cached = getCached('usd_brl');
  if (cached) return cached;
  try {
    const r = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
    const data = await r.json();
    const rate = parseFloat(data.USDBRL.bid);
    if (rate > 0) { setCache('usd_brl', rate, 4 * 60 * 60 * 1000); return rate; }
  } catch (e) { console.error('Cotação USD/BRL falhou:', e.message); }
  return 5.75; // fallback
}

/* ══════════════════════════════════════════════════════════════
   SETUP — cria o primeiro admin (só funciona se não há usuários)
   ══════════════════════════════════════════════════════════════ */
app.get('/setup', async (req, res) => {
  const { count, error: ce } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true });
  if (ce) return res.status(500).send('Erro ao verificar banco: ' + ce.message);
  if (count > 0) return res.status(403).send('Setup já realizado. <a href="/login">Ir para login</a>');

  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASS || 'milhas2026';
  const hash = await bcrypt.hash(pass, 10);

  const { error } = await supabase.from('usuarios').insert({
    username: user, password_hash: hash, nome: 'Administrador',
    plano: 'admin', ativo: true, is_admin: true
  });
  if (error) return res.status(500).send('Erro: ' + error.message);
  res.send(`<h2>✅ Admin criado!</h2><p>Usuário: <b>${user}</b> | Senha: <b>${pass}</b></p><p><a href="/login">→ Fazer login</a></p><p style="color:red">Altere a senha no painel admin após entrar!</p>`);
});

/* ══════════════════════════════════════════════════════════════
   AUTH ROUTES
   ══════════════════════════════════════════════════════════════ */
app.get('/login', (req, res) => {
  if (req.session && req.session.loggedIn) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.redirect('/login?error=1');

  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('username', username.trim().toLowerCase())
    .single();

  if (error || !user)  return res.redirect('/login?error=1');
  if (!user.ativo)     return res.redirect('/login?error=blocked');
  if (user.validade && new Date(user.validade) < new Date())
    return res.redirect('/login?error=expired');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.redirect('/login?error=1');

  req.session.loggedIn = true;
  req.session.userId   = user.id;
  req.session.username = user.username;
  req.session.nome     = user.nome;
  req.session.isAdmin  = user.is_admin;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

/* ══════════════════════════════════════════════════════════════
   ADMIN ROUTES
   ══════════════════════════════════════════════════════════════ */
app.get('/admin', requireAdmin, (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, nome, email, plano, ativo, validade, is_admin, created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  const { username, password, nome, email, plano, validade } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('usuarios').insert({
    username: username.trim().toLowerCase(),
    password_hash: hash,
    nome: nome || '', email: email || '',
    plano: plano || 'basico',
    validade: validade || null,
    ativo: true, is_admin: false
  }).select('id, username, nome, email, plano, ativo, validade, created_at').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, user: data });
});

app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { ativo, validade, plano, password } = req.body;
  const updates = {};
  if (ativo    !== undefined) updates.ativo    = ativo;
  if (validade !== undefined) updates.validade = validade || null;
  if (plano    !== undefined) updates.plano    = plano;
  if (password)               updates.password_hash = await bcrypt.hash(password, 10);
  const { error } = await supabase.from('usuarios').update(updates).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

/* ══════════════════════════════════════════════════════════════
   STATIC ROUTES (protegidos)
   ══════════════════════════════════════════════════════════════ */
app.get('/',         requireAuth, (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/logo.svg', requireAuth, (_req, res) => res.sendFile(path.join(__dirname, 'logo.svg')));

app.get('/api/status', requireAuth, (_req, res) => {
  res.json({ configured: !!queryOneWay });
});

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
      const priceBrl = Math.round(it.price); // já vem em BRL (locale pt-BR)
      if (!byAirline[mainAirline] || priceBrl < byAirline[mainAirline].price) {
        byAirline[mainAirline] = {
          price: priceBrl, currency: 'BRL', airline: mainAirline,
          carriers: [...new Set(airlines)], stops: it.stops || 0, duration: it.totalDuration || 0
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
  console.log('\n  ✈️  Milhas com Edu');
  await loadGflights();
  console.log('  ✅ Google Flights conectado');
  app.listen(PORT, () => console.log('  🚀 http://localhost:' + PORT + '\n'));
}
start().catch(err => { console.error('Erro ao iniciar:', err); process.exit(1); });

