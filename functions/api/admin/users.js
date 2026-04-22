import { hashPassword } from '../../_lib/password.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
function jsonError(msg, status = 500) {
  return json({ error: msg }, status)
}

export async function onRequestGet(context) {
  const { env } = context
  const listed = await env.USERS.list({ prefix: 'u:' })
  const users = await Promise.all(
    listed.keys.map(k => env.USERS.get(k.name, { type: 'json' }))
  )
  const safe = users
    .filter(Boolean)
    .map(({ password_hash, ...u }) => u)
    .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
  return json(safe)
}

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const { username, password, nome, email, plano, validade } = body

  if (!username || !password) {
    return jsonError('Usuário e senha são obrigatórios', 400)
  }

  const uname = username.trim().toLowerCase()
  const existing = await env.USERS.get(`u:${uname}`)
  if (existing) return jsonError('Usuário já existe', 409)

  const nidRaw = await env.USERS.get('nid')
  const id = parseInt(nidRaw || '2')

  const hash = await hashPassword(password)
  const user = {
    id,
    username: uname,
    password_hash: hash,
    nome: nome || '',
    email: email || '',
    plano: plano || 'basico',
    ativo: true,
    is_admin: false,
    validade: validade || null,
    created_at: new Date().toISOString()
  }

  await env.USERS.put(`u:${uname}`, JSON.stringify(user))
  await env.USERS.put(`uid:${id}`, uname)
  await env.USERS.put('nid', String(id + 1))

  const { password_hash, ...safe } = user
  return json({ success: true, user: safe })
}
