// Usa gflights payload/parser mas faz a request com locale pt-BR
// para o Google retornar preços em BRL (não USD)
let _gflightsBuilders = null

async function loadGflights() {
  if (_gflightsBuilders) return _gflightsBuilders
  const mod = await import('gflights')
  _gflightsBuilders = { buildOneWayPayload: mod.buildOneWayPayload, parseResponse: mod.parseResponse }
  return _gflightsBuilders
}

const ENDPOINT = 'https://www.google.com/_/FlightsFrontendUi/data/' +
  'travel.frontend.flights.FlightsFrontendService/GetShoppingResults' +
  '?hl=pt-BR&gl=BR'

async function searchFlightsBRL(origin, destination, date, options = {}) {
  const { buildOneWayPayload, parseResponse } = await loadGflights()
  const payload = buildOneWayPayload(origin, destination, date, options)
  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'Origin': 'https://www.google.com',
      'Referer': 'https://www.google.com/travel/flights?hl=pt-BR&gl=BR',
    },
    signal: AbortSignal.timeout(15000)
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  const text = await resp.text()
  return parseResponse(text) // retorna Itinerary[] com price em BRL
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
    // Preços já em BRL (locale pt-BR/GL=BR)
    const itineraries = await searchFlightsBRL(origin, destination, date)

    const byAirline = {}
    for (const it of itineraries) {
      const airlines = (it.legs || []).map(l => l.airline).filter(Boolean)
      const mainAirline = airlines[0] || 'Unknown'
      const priceBrl = Math.round(it.price) // já em BRL
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
