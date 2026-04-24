import { hashPassword } from '../_lib/password.js'
import { signJWT } from '../_lib/jwt.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

const USERNAME_RE = /^[a-z0-9_.-]{3,30}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function onRequestPost(context) {
  const { request, env } = context

  let username, password, nome, email
  const ct = request.headers.get('Content-Type') || ''
  if (ct.includes('application/x-www-form-urlencoded')) {
    const form = await request.formData()
    username = form.get('username')
    password = form.get('password')
    nome = form.get('nome')
    email = form.get('email')
  } else {
    const body = await request.json().catch(() => ({}))
    username = body.username
    password = body.password
    nome = body.nome
    email = body.email
  }

  if (!username || !password || !nome || !email) {
    return json({ error: 'Todos os campos são obrigatórios' }, 400)
  }

  const uname = String(username).trim().toLowerCase()
  const mail = String(email).trim().toLowerCase()
  const fullName = String(nome).trim()

  if (!USERNAME_RE.test(uname)) {
    return json({ error: 'Usuário deve ter 3-30 caracteres (letras minúsculas, números, _ . -)' }, 400)
  }
  if (!EMAIL_RE.test(mail)) {
    return json({ error: 'E-mail inválido' }, 400)
  }
  if (String(password).length < 6) {
    return json({ error: 'A senha deve ter pelo menos 6 caracteres' }, 400)
  }
  if (fullName.length < 2) {
    return json({ error: 'Nome inválido' }, 400)
  }

  const existing = await env.USERS.get(`u:${uname}`)
  if (existing) {
    return json({ error: 'Este nome de usuário já está em uso' }, 409)
  }

  const nidRaw = await env.USERS.get('nid')
  const id = parseInt(nidRaw || '2')

  const hash = await hashPassword(password)
  const user = {
    id,
    username: uname,
    password_hash: hash,
    nome: fullName,
    email: mail,
    plano: 'basico',
    ativo: true,
    is_admin: false,
    validade: null,
    created_at: new Date().toISOString()
  }

  await env.USERS.put(`u:${uname}`, JSON.stringify(user))
  await env.USERS.put(`uid:${id}`, uname)
  await env.USERS.put('nid', String(id + 1))

  if (!env.JWT_SECRET) {
    return json({ success: true, autoLogin: false })
  }

  const token = await signJWT(
    { userId: user.id, username: user.username, isAdmin: user.is_admin },
    env.JWT_SECRET
  )

  return new Response(JSON.stringify({ success: true, autoLogin: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800; Secure`
    }
  })
}
