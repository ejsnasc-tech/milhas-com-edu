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

export async function onRequestPatch(context) {
  const { request, env, params } = context
  const { id } = params
  const body = await request.json().catch(() => ({}))
  const { ativo, validade, plano, password } = body

  const updates = {}
  if (ativo !== undefined) updates.ativo = ativo
  if (validade !== undefined) updates.validade = validade || null
  if (plano !== undefined) updates.plano = plano
  if (password) updates.password_hash = await bcrypt.hash(password, 10)

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)
  const { error } = await supabase.from('usuarios').update(updates).eq('id', id)
  if (error) return jsonError(error.message)
  return json({ success: true })
}

export async function onRequestDelete(context) {
  const { env, params } = context
  const { id } = params
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)
  const { error } = await supabase.from('usuarios').delete().eq('id', id)
  if (error) return jsonError(error.message)
  return json({ success: true })
}
