import { getPlan, applyPromo, validatePromo } from '../../_lib/plans.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const code = String(body.code || '').trim().toUpperCase()
  const planoId = String(body.plano || '').trim().toLowerCase()

  if (!code) return json({ error: 'Código obrigatório' }, 400)
  const plano = getPlan(planoId)
  if (!plano) return json({ error: 'Plano inválido' }, 400)

  const promo = await env.USERS.get(`promo:${code}`, { type: 'json' })
  const check = validatePromo(promo, planoId)
  if (!check.ok) return json({ valid: false, error: check.error }, 200)

  const { final, descontoValor } = applyPromo(plano.preco, promo)
  return json({
    valid: true,
    code,
    tipo: promo.tipo,
    valor: promo.valor,
    descricao: promo.descricao || '',
    precoOriginal: plano.preco,
    desconto: descontoValor,
    precoFinal: final
  })
}
