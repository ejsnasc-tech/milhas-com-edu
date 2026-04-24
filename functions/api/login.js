import { signJWT } from '../_lib/jwt.js'
import { verifyPassword } from '../_lib/password.js'

export async function onRequestPost(context) {
  const { request, env } = context

  let username, password
  const ct = request.headers.get('Content-Type') || ''
  if (ct.includes('application/x-www-form-urlencoded')) {
    const form = await request.formData()
    username = form.get('username')
    password = form.get('password')
  } else {
    const body = await request.json().catch(() => ({}))
    username = body.username
    password = body.password
  }

  if (!username || !password) {
    return Response.redirect(new URL('/login?error=1', request.url), 302)
  }

  const user = await env.USERS.get(`u:${username.trim().toLowerCase()}`, { type: 'json' })

  if (!user) {
    return Response.redirect(new URL('/login?error=1', request.url), 302)
  }
  if (!user.ativo) {
    return Response.redirect(new URL('/login?error=blocked', request.url), 302)
  }
  // Nota: usuários com validade vencida PODEM entrar (para renovar via /planos).
  // O middleware/search redireciona quem está vencido para /planos.

  const match = await verifyPassword(password, user.password_hash)
  if (!match) {
    return Response.redirect(new URL('/login?error=1', request.url), 302)
  }

  const token = await signJWT(
    { userId: user.id, username: user.username, isAdmin: user.is_admin },
    env.JWT_SECRET
  )

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800; Secure`
    }
  })
}
