// /api/search?origin=GRU&destination=LIS&date=2026-06-15&adults=1[&return_date=2026-06-22]
// Consulta a API do Travelpayouts (Aviasales v3 prices_for_dates).
// Quando return_date é informado, busca ida E ida+volta em paralelo
// e devolve { oneway: [...], roundtrip: [...] }.
// Sem return_date, devolve apenas array (compatível com versão antiga).

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
  const returnDate = url.searchParams.get('return_date') || ''

  if (!origin || !destination || !date) {
    return jsonError('Parâmetros obrigatórios: origin, destination, date', 400)
  }
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return jsonError('Códigos IATA inválidos', 400)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonError('Data inválida (YYYY-MM-DD)', 400)
  }
  if (returnDate && !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
    return jsonError('return_date inválida (YYYY-MM-DD)', 400)
  }

  const token = env.TP_TOKEN
  const marker = env.TP_MARKER || ''
  if (!token) return jsonError('TP_TOKEN não configurado', 500)

  // Cache entre requests (30 min) - v8 (com roundtrip)
  const cache = caches.default
  const cacheKey = new Request(`https://cache.internal/search/v8/${origin}/${destination}/${date}/${returnDate || 'oneway'}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  function buildUrl(opts) {
    const u = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates')
    u.searchParams.set('origin', origin)
    u.searchParams.set('destination', destination)
    u.searchParams.set('departure_at', date)
    if (opts && opts.returnAt) u.searchParams.set('return_at', opts.returnAt)
    u.searchParams.set('currency', 'brl')
    u.searchParams.set('sorting', 'price')
    u.searchParams.set('direct', 'false')
    u.searchParams.set('limit', '500')
    u.searchParams.set('one_way', opts && opts.returnAt ? 'false' : 'true')
    u.searchParams.set('token', token)
    return u.toString()
  }

  try {
    // Busca ida sempre; se houver return_date, busca também ida+volta em paralelo
    const tasks = [fetch(buildUrl({}), { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(15000) })]
    if (returnDate) {
      tasks.push(fetch(buildUrl({ returnAt: returnDate }), { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(15000) }))
    }
    const responses = await Promise.all(tasks)
    for (const r of responses) {
      if (!r.ok) return jsonError('Travelpayouts HTTP ' + r.status, 502)
    }
    const datas = await Promise.all(responses.map(r => r.json()))
    const list = Array.isArray(datas[0]?.data) ? datas[0].data : []
    const listRT = returnDate && Array.isArray(datas[1]?.data) ? datas[1].data : []

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
    const offersRT = []
    for (const it of listRT) {
      const o = buildOffer(it)
      if (o) offersRT.push(o)
    }
    function dedupSort(arr) {
      const seen = new Set()
      const out = []
      for (const o of arr) {
        const k = o.airline + '|' + o.price + '|' + o.stops + '|' + o.departure_at
        if (seen.has(k)) continue
        seen.add(k)
        out.push(o)
      }
      return out.sort((a, b) => a.price - b.price)
    }
    const oneway = dedupSort(offers)
    const roundtrip = dedupSort(offersRT)

    // Compatibilidade: sem return_date devolve array (formato antigo)
    const payload = returnDate ? { oneway, roundtrip } : oneway
    const response = new Response(JSON.stringify(payload), {
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
