import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { signJWT } from '../_lib/jwt.js'

export async function onRequestPost(context) {
  const { request, env } = context

  // Suporta form-urlencoded (do HTML) e JSON (chamadas fetch)
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
    return Response.redirect(new URL('/login.html?error=1', request.url), 302)
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('username', username.trim().toLowerCase())
    .single()

  if (error || !user) {
    return Response.redirect(new URL('/login.html?error=1', request.url), 302)
  }
  if (!user.ativo) {
    return Response.redirect(new URL('/login.html?error=blocked', request.url), 302)
  }
  if (user.validade && new Date(user.validade) < new Date()) {
    return Response.redirect(new URL('/login.html?error=expired', request.url), 302)
  }

  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) {
    return Response.redirect(new URL('/login.html?error=1', request.url), 302)
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
