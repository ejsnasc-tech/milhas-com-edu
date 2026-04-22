import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

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
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, nome, email, plano, ativo, validade, is_admin, created_at')
    .order('created_at', { ascending: false })
  if (error) return jsonError(error.message)
  return json(data)
}

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const { username, password, nome, email, plano, validade } = body

  if (!username || !password) {
    return jsonError('Usuário e senha são obrigatórios', 400)
  }

  const hash = await bcrypt.hash(password, 10)
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      username: username.trim().toLowerCase(),
      password_hash: hash,
      nome: nome || '',
      email: email || '',
      plano: plano || 'basico',
      validade: validade || null,
      ativo: true,
      is_admin: false
    })
    .select('id, username, nome, email, plano, ativo, validade, created_at')
    .single()

  if (error) return jsonError(error.message)
  return json({ success: true, user: data })
}
