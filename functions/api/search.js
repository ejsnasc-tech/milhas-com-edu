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

  // Cache entre requests (30 min) - v9 (fallback mensal)
  const cache = caches.default
  const cacheKey = new Request(`https://cache.internal/search/v10/${origin}/${destination}/${date}/${returnDate || 'oneway'}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  function buildUrl(opts) {
    const u = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates')
    u.searchParams.set('origin', origin)
    u.searchParams.set('destination', destination)
    u.searchParams.set('departure_at', opts && opts.departAt ? opts.departAt : date)
    if (opts && opts.returnAt) u.searchParams.set('return_at', opts.returnAt)
    u.searchParams.set('currency', 'brl')
    u.searchParams.set('sorting', 'price')
    u.searchParams.set('direct', 'false')
    u.searchParams.set('limit', '500')
    u.searchParams.set('one_way', opts && opts.returnAt ? 'false' : 'true')
    u.searchParams.set('token', token)
    return u.toString()
  }

  async function fetchOffers(opts) {
    const r = await fetch(buildUrl(opts), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    if (!r.ok) return { ok: false, status: r.status, list: [] }
    const j = await r.json()
    return { ok: true, list: Array.isArray(j?.data) ? j.data : [] }
  }

  // Fallback 3: v1/prices/cheap (sem data) - sempre retorna com airline,
  // útil quando data exata e mês estão vazios. Formato aninhado: data[CITY][index] = {airline,price,...}
  async function fetchCheap() {
    const u = new URL('https://api.travelpayouts.com/v1/prices/cheap')
    u.searchParams.set('origin', origin)
    u.searchParams.set('destination', destination)
    u.searchParams.set('currency', 'brl')
    u.searchParams.set('token', token)
    try {
      const r = await fetch(u.toString(), {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      })
      if (!r.ok) return []
      const j = await r.json()
      const out = []
      if (j?.data && typeof j.data === 'object') {
        for (const city of Object.keys(j.data)) {
          const offersByIdx = j.data[city]
          if (offersByIdx && typeof offersByIdx === 'object') {
            for (const idx of Object.keys(offersByIdx)) {
              const o = offersByIdx[idx]
              if (o && o.airline && o.price) {
                out.push({
                  airline: o.airline,
                  price: o.price,
                  transfers: 0,
                  duration: o.duration_to || o.duration || 0,
                  departure_at: o.departure_at || '',
                  flight_number: o.flight_number || ''
                })
              }
            }
          }
        }
      }
      return out
    } catch (_) { return [] }
  }

  try {
    const month = date.slice(0, 7) // YYYY-MM
    const returnMonth = returnDate ? returnDate.slice(0, 7) : ''

    // 1) Tenta data exata (ida sempre; ida+volta se houver return_date)
    const tasks = [fetchOffers({})]
    if (returnDate) tasks.push(fetchOffers({ returnAt: returnDate }))
    const exact = await Promise.all(tasks)
    for (const r of exact) {
      if (r.ok === false) return jsonError('Travelpayouts HTTP ' + r.status, 502)
    }
    let list = exact[0].list
    let listRT = returnDate ? exact[1].list : []
    let approxOneway = false
    let approxRoundtrip = false

    // 2) Fallback mensal: se data exata não retornou nada, busca o mês inteiro
    const fallbacks = []
    if (list.length === 0) {
      fallbacks.push(fetchOffers({ departAt: month }).then(r => { list = r.list; approxOneway = true }))
    }
    if (returnDate && listRT.length === 0) {
      fallbacks.push(fetchOffers({ departAt: month, returnAt: returnMonth }).then(r => { listRT = r.list; approxRoundtrip = true }))
    }
    if (fallbacks.length) await Promise.all(fallbacks)

    // 3) Último recurso: v1/prices/cheap (sem data) — para rotas regionais sem cache
    if (list.length === 0) {
      list = await fetchCheap()
      if (list.length) approxOneway = true
    }

    function buildOffer(it, isApprox) {
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
        approximate: !!isApprox,
        bookingLink
      }
    }

    const offers = []
    for (const it of list) {
      const o = buildOffer(it, approxOneway)
      if (o) offers.push(o)
    }
    const offersRT = []
    for (const it of listRT) {
      const o = buildOffer(it, approxRoundtrip)
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
