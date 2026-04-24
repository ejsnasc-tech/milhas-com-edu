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

  // Cache entre requests (30 min)
  const cache = caches.default
  const cacheKey = new Request(`https://cache.internal/search/${origin}/${destination}/${date}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  // Travelpayouts API: prices_for_dates
  const api = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates')
  api.searchParams.set('origin', origin)
  api.searchParams.set('destination', destination)
  api.searchParams.set('departure_at', date)
  api.searchParams.set('currency', 'brl')
  api.searchParams.set('sorting', 'price')
  api.searchParams.set('direct', 'false')
  api.searchParams.set('limit', '50')
  api.searchParams.set('one_way', 'true')
  api.searchParams.set('token', token)

  try {
    const r = await fetch(api.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    if (!r.ok) {
      return jsonError('Travelpayouts HTTP ' + r.status, 502)
    }
    const data = await r.json()
    const list = Array.isArray(data?.data) ? data.data : []

    // Agrupa por airline (IATA) — menor preço por companhia
    const byAirline = {}
    for (const it of list) {
      const carrier = (it.airline || '').toUpperCase()
      const price = Math.round(Number(it.price))
      if (!carrier || !Number.isFinite(price) || price <= 0) continue
      const stops = Number.isFinite(it.transfers) ? it.transfers : 0
      const duration = Number.isFinite(it.duration) ? it.duration : 0
      // Link de afiliado (Aviasales) — quando cliente clica/compra, voce ganha comissao
      let bookingLink = ''
      if (it.link) {
        const sep = it.link.includes('?') ? '&' : '?'
        bookingLink = 'https://www.aviasales.com' + it.link + (marker ? sep + 'marker=' + encodeURIComponent(marker) : '')
      }
      if (!byAirline[carrier] || price < byAirline[carrier].price) {
        byAirline[carrier] = {
          price,
          currency: 'BRL',
          airline: carrier,
          carriers: [carrier],
          stops,
          duration,
          bookingLink
        }
      }
    }

    const results = Object.values(byAirline).sort((a, b) => a.price - b.price)
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
