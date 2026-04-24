// /api/search?origin=GRU&destination=LIS&date=2026-06-15&adults=1
// Consulta a API do Travelpayouts (Aviasales v3 prices_for_dates) e devolve no
// mesmo formato que o front ja consome: [{ price, currency, airline, carriers, stops, duration }]
// Os precos sao reais (cache atualizado da Aviasales) em BRL.

function jsonError(msg, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const origin = (url.searchParams.get('origin') || '').toUpperCase()
  const destination = (url.searchParams.get('destination') || '').toUpperCase()
  const date = url.searchParams.get('date') || ''

  if (!origin || !destination || !date) {
    return jsonError('Parâmetros obrigatórios: origin, destination, date', 400)
  }
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return jsonError('Códigos IATA inválidos', 400)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonError('Data inválida (YYYY-MM-DD)', 400)
  }

  const token = env.TP_TOKEN
  const marker = env.TP_MARKER || ''
  if (!token) return jsonError('TP_TOKEN não configurado', 500)

  // Cache entre requests (30 min) - v4 (com preços do mês como fallback)
  const cache = caches.default
  const cacheKey = new Request(`https://cache.internal/search/v4/${origin}/${destination}/${date}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  function buildUrl(departure_at) {
    const u = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates')
    u.searchParams.set('origin', origin)
    u.searchParams.set('destination', destination)
    u.searchParams.set('departure_at', departure_at)
    u.searchParams.set('currency', 'brl')
    u.searchParams.set('sorting', 'price')
    u.searchParams.set('direct', 'false')
    u.searchParams.set('limit', '100')
    u.searchParams.set('one_way', 'true')
    u.searchParams.set('token', token)
    return u.toString()
  }

  // Busca paralela: data exata + mês inteiro (pra cobrir mais companhias)
  const month = date.slice(0, 7) // YYYY-MM
  try {
    const [r1, r2] = await Promise.all([
      fetch(buildUrl(date), { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(15000) }),
      fetch(buildUrl(month), { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(15000) })
    ])
    if (!r1.ok && !r2.ok) {
      return jsonError('Travelpayouts HTTP ' + r1.status + '/' + r2.status, 502)
    }
    const data1 = r1.ok ? await r1.json() : { data: [] }
    const data2 = r2.ok ? await r2.json() : { data: [] }
    const exactList = Array.isArray(data1?.data) ? data1.data : []
    const monthList = Array.isArray(data2?.data) ? data2.data : []

    function buildOffer(it, approximate) {
      const carrier = (it.airline || '').toUpperCase()
      const price = Math.round(Number(it.price))
      if (!carrier || !Number.isFinite(price) || price <= 0) return null
      const stops = Number.isFinite(it.transfers) ? it.transfers : 0
      const duration = Number.isFinite(it.duration) ? it.duration : 0
      let bookingLink = ''
      if (it.link) {
        const sep = it.link.includes('?') ? '&' : '?'
        bookingLink = 'https://www.aviasales.com' + it.link + (marker ? sep + 'marker=' + encodeURIComponent(marker) : '')
      }
      return {
        price,
        currency: 'BRL',
        airline: carrier,
        carriers: [carrier],
        stops,
        duration,
        departure_at: it.departure_at || '',
        flight_number: it.flight_number || '',
        approximate: !!approximate,
        bookingLink
      }
    }

    // Preços EXATOS (data pedida) — todos
    const exactOffers = []
    for (const it of exactList) {
      const o = buildOffer(it, false)
      if (o) exactOffers.push(o)
    }
    // Preços APROXIMADOS (mês) — só carriers que ainda não apareceram nos exatos
    const exactCarriers = new Set(exactOffers.map(o => o.airline))
    const monthByCarrier = {}
    for (const it of monthList) {
      const o = buildOffer(it, true)
      if (!o) continue
      if (exactCarriers.has(o.airline)) continue
      if (!monthByCarrier[o.airline] || o.price < monthByCarrier[o.airline].price) {
        monthByCarrier[o.airline] = o
      }
    }
    // Dedup exatos
    const seen = new Set()
    const dedup = []
    for (const o of exactOffers) {
      const k = o.airline + '|' + o.price + '|' + o.stops + '|' + o.departure_at
      if (seen.has(k)) continue
      seen.add(k)
      dedup.push(o)
    }
    const exactSorted = dedup.sort((a, b) => a.price - b.price).slice(0, 20)
    const approxSorted = Object.values(monthByCarrier).sort((a, b) => a.price - b.price)
    const results = exactSorted.concat(approxSorted)

    const response = new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800'
      }
    })
    await cache.put(cacheKey, response.clone())
    return response
  } catch (err) {
    return jsonError('Erro na busca: ' + (err.message || err), 500)
  }
}
