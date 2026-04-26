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
  const cacheKey = new Request(`https://cache.internal/search/v7/${origin}/${destination}/${date}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  function buildUrl() {
    const u = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates')
    u.searchParams.set('origin', origin)
    u.searchParams.set('destination', destination)
    u.searchParams.set('departure_at', date)
    u.searchParams.set('currency', 'brl')
    u.searchParams.set('sorting', 'price')
    u.searchParams.set('direct', 'false')
    u.searchParams.set('limit', '500')
    u.searchParams.set('one_way', 'true')
    u.searchParams.set('token', token)
    return u.toString()
  }

  // Apenas a data exata pedida — sem estimativas de outras datas
  try {
    const r = await fetch(buildUrl(), { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(15000) })
    if (!r.ok) return jsonError('Travelpayouts HTTP ' + r.status, 502)
    const data = await r.json()
    const list = Array.isArray(data?.data) ? data.data : []

    function buildOffer(it) {
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
        price, currency: 'BRL', airline: carrier, carriers: [carrier],
        stops, duration,
        departure_at: it.departure_at || '',
        flight_number: it.flight_number || '',
        approximate: false,
        bookingLink
      }
    }

    const offers = []
    for (const it of list) {
      const o = buildOffer(it)
      if (o) offers.push(o)
    }
    const seen = new Set()
    const dedup = []
    for (const o of offers) {
      const k = o.airline + '|' + o.price + '|' + o.stops + '|' + o.departure_at
      if (seen.has(k)) continue
      seen.add(k)
      dedup.push(o)
    }
    const results = dedup.sort((a, b) => a.price - b.price)

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
