import { listPlans } from '../_lib/plans.js'

export async function onRequestGet(context) {
  const { env } = context
  const pix = await env.USERS.get('pixcfg', { type: 'json' })
  return new Response(JSON.stringify({
    planos: listPlans(),
    pix: pix || null
  }), { headers: { 'Content-Type': 'application/json' } })
}
