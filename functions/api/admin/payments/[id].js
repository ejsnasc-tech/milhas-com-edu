import { extendValidade, getPlan } from '../../../_lib/plans.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
function jsonError(msg, status = 500) { return json({ error: msg }, status) }

export async function onRequestPatch(context) {
  const { request, env, params } = context
  const id = params.id
  const pay = await env.USERS.get(`pay:${id}`, { type: 'json' })
  if (!pay) return jsonError('Pagamento não encontrado', 404)

  const body = await request.json().catch(() => ({}))
  const action = body.action

  if (action === 'aprovar') {
    if (pay.status === 'aprovado') return jsonError('Já aprovado', 400)
    const uname = await env.USERS.get(`uid:${pay.userId}`)
    if (!uname) return jsonError('Usuário do pagamento não existe', 404)
    const user = await env.USERS.get(`u:${uname}`, { type: 'json' })
    if (!user) return jsonError('Usuário do pagamento não existe', 404)

    const plano = getPlan(pay.plano)
    if (!plano) return jsonError('Plano do pagamento inválido', 400)

    user.validade = extendValidade(user.validade, plano.dias)
    user.plano = pay.plano
    user.ativo = true
    await env.USERS.put(`u:${uname}`, JSON.stringify(user))

    pay.status = 'aprovado'
    pay.approvedAt = new Date().toISOString()
    await env.USERS.put(`pay:${id}`, JSON.stringify(pay))

    // Incrementa uso do cupom
    if (pay.codigo) {
      const promo = await env.USERS.get(`promo:${pay.codigo}`, { type: 'json' })
      if (promo) {
        promo.usos = (promo.usos || 0) + 1
        await env.USERS.put(`promo:${pay.codigo}`, JSON.stringify(promo))
      }
    }
    return json({ success: true, payment: pay, user: { ...user, password_hash: undefined } })
  }

  if (action === 'rejeitar') {
    if (pay.status === 'rejeitado') return jsonError('Já rejeitado', 400)
    pay.status = 'rejeitado'
    pay.rejectedAt = new Date().toISOString()
    await env.USERS.put(`pay:${id}`, JSON.stringify(pay))
    return json({ success: true, payment: pay })
  }

  return jsonError('Ação inválida (aprovar | rejeitar)', 400)
}

export async function onRequestDelete(context) {
  const { env, params } = context
  await env.USERS.delete(`pay:${params.id}`)
  return json({ success: true })
}
