import { hashPassword } from '../../../_lib/password.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
function jsonError(msg, status = 500) {
  return json({ error: msg }, status)
}

export async function onRequestPatch(context) {
  const { request, env, params } = context
  const { id } = params
  const body = await request.json().catch(() => ({}))
  const { ativo, validade, plano, password } = body

  const uname = await env.USERS.get(`uid:${id}`)
  if (!uname) return jsonError('Usuário não encontrado', 404)

  const user = await env.USERS.get(`u:${uname}`, { type: 'json' })
  if (!user) return jsonError('Usuário não encontrado', 404)

  if (ativo !== undefined) user.ativo = ativo
  if (validade !== undefined) user.validade = validade || null
  if (plano !== undefined) user.plano = plano
  if (password) user.password_hash = await hashPassword(password)

  await env.USERS.put(`u:${uname}`, JSON.stringify(user))
  return json({ success: true })
}

export async function onRequestDelete(context) {
  const { env, params } = context
  const { id } = params

  const uname = await env.USERS.get(`uid:${id}`)
  if (!uname) return jsonError('Usuário não encontrado', 404)

  await env.USERS.delete(`u:${uname}`)
  await env.USERS.delete(`uid:${id}`)
  return json({ success: true })
}
