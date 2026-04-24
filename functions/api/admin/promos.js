function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
function jsonError(msg, status = 500) { return json({ error: msg }, status) }

const TYPES = ['percent', 'fixed']

export async function onRequestGet(context) {
  const { env } = context
  const listed = await env.USERS.list({ prefix: 'promo:' })
  const items = await Promise.all(
    listed.keys.map(k => env.USERS.get(k.name, { type: 'json' }))
  )
  const sorted = items
    .filter(Boolean)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  return json(sorted)
}

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const code = String(body.code || '').trim().toUpperCase()
  const tipo = String(body.tipo || '').trim()
  const valor = Number(body.valor)
  const maxUsos = body.maxUsos ? parseInt(body.maxUsos, 10) : null
  const expiraEm = body.expiraEm || null
  const descricao = body.descricao || ''
  const planos = Array.isArray(body.planos) ? body.planos : []

  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    return jsonError('Código deve ter 3-30 caracteres (A-Z, 0-9, _ -)', 400)
  }
  if (!TYPES.includes(tipo)) return jsonError('Tipo inválido', 400)
  if (!(valor > 0)) return jsonError('Valor deve ser positivo', 400)
  if (tipo === 'percent' && valor > 100) return jsonError('Percentual máximo 100', 400)

  const existing = await env.USERS.get(`promo:${code}`)
  if (existing) return jsonError('Código já existe', 409)

  const promo = {
    code, tipo, valor,
    maxUsos, usos: 0,
    expiraEm: expiraEm || null,
    descricao,
    planos,
    ativo: true,
    createdAt: new Date().toISOString()
  }
  await env.USERS.put(`promo:${code}`, JSON.stringify(promo))
  return json({ success: true, promo })
}
