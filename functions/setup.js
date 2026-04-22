import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const html = (body) =>
  new Response(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Setup</title>
  <style>body{font-family:system-ui;background:#0a0e1a;color:#e8eaf6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .box{background:#0d1b2e;border:1px solid #1a2744;border-radius:16px;padding:40px;max-width:480px;width:100%}
  h2{margin-bottom:16px}p{color:#90a4ae;line-height:1.6;margin-bottom:12px}a{color:#64b5f6}
  b{color:#e8eaf6}.warn{color:#ef9a9a}</style></head><body><div class="box">${body}</div></body></html>`,
  { headers: { 'Content-Type': 'text/html; charset=utf-8' } })

export async function onRequestGet(context) {
  const { env } = context
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)

  const { count, error: ce } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true })

  if (ce) return html(`<h2>❌ Erro</h2><p>Erro ao verificar banco: ${ce.message}</p>`)
  if (count > 0) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Setup</title></head><body>
      <p>Setup já realizado. <a href="/login.html">Ir para login</a></p></body></html>`,
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const user = env.ADMIN_USER || 'admin'
  const pass = env.ADMIN_PASS || 'milhas2026'
  const hash = await bcrypt.hash(pass, 10)

  const { error } = await supabase.from('usuarios').insert({
    username: user,
    password_hash: hash,
    nome: 'Administrador',
    plano: 'admin',
    ativo: true,
    is_admin: true
  })

  if (error) return html(`<h2>❌ Erro</h2><p>${error.message}</p>`)

  return html(`
    <h2>✅ Admin criado com sucesso!</h2>
    <p>Usuário: <b>${user}</b></p>
    <p>Senha: <b>${pass}</b></p>
    <p><a href="/login.html">→ Fazer login</a></p>
    <p class="warn">⚠️ Altere a senha no painel admin após entrar!</p>
  `)
}
