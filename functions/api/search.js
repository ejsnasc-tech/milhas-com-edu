// Usa queryOneWay do gflights com locale pt-BR para o Google retornar preços em BRL
let _queryOneWay = null

async function loadGflights() {
  if (_queryOneWay) return _queryOneWay
  const mod = await import('gflights')
  _queryOneWay = mod.queryOneWay
  return _queryOneWay
}

async function getUsdToBrl() {
  try {
    const r = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
      signal: AbortSignal.timeout(5000)
    })
    const data = await r.json()
    const rate = parseFloat(data.USDBRL.bid)
    if (rate > 0) return rate
  } catch {}
  return 5.80
}

function jsonError(msg, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestGet(context) {
  const { request } = context
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

  // Tenta usar Cache API do Workers para cache entre requests
  const cache = caches.default
  const cacheKey = new Request(`https://cache.internal/search/${origin}/${destination}/${date}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  try {
    const queryOneWay = await loadGflights()
    const r = await queryOneWay(origin, destination, date)
    if (r.error) throw new Error(r.error)

    const usdToBrl = await getUsdToBrl()

    const byAirline = {}
    for (const it of r.itineraries || []) {
      const airlines = (it.legs || []).map(l => l.airline).filter(Boolean)
      const mainAirline = airlines[0] || 'Unknown'
      const priceBrl = Math.round(it.price * usdToBrl)
      if (!byAirline[mainAirline] || priceBrl < byAirline[mainAirline].price) {
        byAirline[mainAirline] = {
          price: priceBrl,
          currency: 'BRL',
          airline: mainAirline,
          carriers: [...new Set(airlines)],
          stops: it.stops || 0,
          duration: it.totalDuration || 0
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
    // Armazena no cache por 30 minutos
    await cache.put(cacheKey, response.clone())
    return response
  } catch (err) {
    return jsonError('Erro na busca: ' + err.message, 500)
  }
}
