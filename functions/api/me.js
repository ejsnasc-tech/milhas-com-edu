import { getCookie, verifyJWT } from '../_lib/jwt.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const token = getCookie(request, 'session')
  const user = token && env.JWT_SECRET ? await verifyJWT(token, env.JWT_SECRET) : null

  if (!user) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    })
  }
  return new Response(JSON.stringify({
    userId: user.userId,
    username: user.username,
    isAdmin: user.isAdmin
  }), { headers: { 'Content-Type': 'application/json' } })
}
