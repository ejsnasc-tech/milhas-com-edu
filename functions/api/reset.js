import { hashPassword } from '../_lib/password.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const token = String(body.token || '').trim()
  const password = String(body.password || '')

  if (!token) return json({ error: 'Token ausente' }, 400)
  if (password.length < 6) return json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400)

  const reset = await env.USERS.get(`reset:${token}`, { type: 'json' })
  if (!reset) return json({ error: 'Link inválido ou expirado' }, 400)

  const user = await env.USERS.get(`u:${reset.username}`, { type: 'json' })
  if (!user) return json({ error: 'Usuário não encontrado' }, 404)

  user.password_hash = await hashPassword(password)
  await env.USERS.put(`u:${user.username}`, JSON.stringify(user))
  await env.USERS.delete(`reset:${token}`)

  return json({ success: true, message: 'Senha redefinida com sucesso!' })
}

// Validar token (usado pela página /reset para mostrar o form se válido)
export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  if (!token) return json({ valid: false, error: 'Token ausente' }, 400)
  const reset = await env.USERS.get(`reset:${token}`, { type: 'json' })
  if (!reset) return json({ valid: false, error: 'Link inválido ou expirado' }, 400)
  return json({ valid: true, email: reset.email })
}
