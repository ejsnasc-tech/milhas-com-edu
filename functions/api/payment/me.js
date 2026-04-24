import { getCookie, verifyJWT } from '../../_lib/jwt.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestGet(context) {
  const { request, env } = context
  const token = getCookie(request, 'session')
  const sess = token && env.JWT_SECRET ? await verifyJWT(token, env.JWT_SECRET) : null
  if (!sess) return json({ error: 'Não autenticado' }, 401)

  const listed = await env.USERS.list({ prefix: 'pay:' })
  const items = await Promise.all(
    listed.keys.map(k => env.USERS.get(k.name, { type: 'json' }))
  )
  const mine = items
    .filter(p => p && p.userId === sess.userId)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  return json(mine)
}
