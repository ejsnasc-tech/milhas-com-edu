import { getPlan, applyPromo, validatePromo, extendValidade } from '../../_lib/plans.js'
import { getCookie, verifyJWT } from '../../_lib/jwt.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const token = getCookie(request, 'session')
  const sess = token && env.JWT_SECRET ? await verifyJWT(token, env.JWT_SECRET) : null
  if (!sess) return json({ error: 'Não autenticado' }, 401)

  const body = await request.json().catch(() => ({}))
  const planoId = String(body.plano || '').trim().toLowerCase()
  const code = body.code ? String(body.code).trim().toUpperCase() : null

  const plano = getPlan(planoId)
  if (!plano) return json({ error: 'Plano inválido' }, 400)

  let promo = null
  if (code) {
    promo = await env.USERS.get(`promo:${code}`, { type: 'json' })
    const check = validatePromo(promo, planoId)
    if (!check.ok) return json({ error: check.error }, 400)
  }

  const { final, descontoValor } = applyPromo(plano.preco, promo)
  const pix = await env.USERS.get('pixcfg', { type: 'json' })

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const payment = {
    id,
    userId: sess.userId,
    username: sess.username,
    plano: planoId,
    planoNome: plano.nome,
    dias: plano.dias,
    valorOriginal: plano.preco,
    desconto: descontoValor,
    valor: final,
    codigo: code || null,
    status: 'pendente',
    createdAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null
  }

  // ✅ Aprovação automática para TODOS os pagamentos
  // (cliente confia que vai pagar; admin pode revisar depois e rejeitar se necessário)
  const uname = await env.USERS.get(`uid:${sess.userId}`)
  if (uname) {
    const user = await env.USERS.get(`u:${uname}`, { type: 'json' })
    if (user) {
      user.validade = extendValidade(user.validade, plano.dias)
      user.plano = planoId
      user.ativo = true
      await env.USERS.put(`u:${uname}`, JSON.stringify(user))
    }
  }
  payment.status = 'aprovado'
  payment.approvedAt = new Date().toISOString()
  payment.autoAprovado = true
  await env.USERS.put(`pay:${id}`, JSON.stringify(payment))

  if (code && promo) {
    promo.usos = (promo.usos || 0) + 1
    await env.USERS.put(`promo:${code}`, JSON.stringify(promo))
  }

  const semCusto = final <= 0
  return json({
    success: true,
    autoAprovado: true,
    semCusto,
    payment,
    pix: semCusto ? null : (pix || null)
  })
}
