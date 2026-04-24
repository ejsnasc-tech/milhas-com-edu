function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
function jsonError(msg, status = 500) { return json({ error: msg }, status) }

const TYPES = ['percent', 'fixed']

export async function onRequestPatch(context) {
  const { request, env, params } = context
  const code = String(params.code || '').toUpperCase()
  const promo = await env.USERS.get(`promo:${code}`, { type: 'json' })
  if (!promo) return jsonError('Cupom não encontrado', 404)

  const body = await request.json().catch(() => ({}))
  if (body.tipo !== undefined) {
    if (!TYPES.includes(body.tipo)) return jsonError('Tipo inválido', 400)
    promo.tipo = body.tipo
  }
  if (body.valor !== undefined) {
    const v = Number(body.valor)
    if (!(v > 0)) return jsonError('Valor inválido', 400)
    if (promo.tipo === 'percent' && v > 100) return jsonError('Percentual máximo 100', 400)
    promo.valor = v
  }
  if (body.maxUsos !== undefined) promo.maxUsos = body.maxUsos === null || body.maxUsos === '' ? null : parseInt(body.maxUsos, 10)
  if (body.expiraEm !== undefined) promo.expiraEm = body.expiraEm || null
  if (body.descricao !== undefined) promo.descricao = body.descricao || ''
  if (body.ativo !== undefined) promo.ativo = !!body.ativo
  if (body.planos !== undefined && Array.isArray(body.planos)) promo.planos = body.planos

  await env.USERS.put(`promo:${code}`, JSON.stringify(promo))
  return json({ success: true, promo })
}

export async function onRequestDelete(context) {
  const { env, params } = context
  const code = String(params.code || '').toUpperCase()
  await env.USERS.delete(`promo:${code}`)
  return json({ success: true })
}
