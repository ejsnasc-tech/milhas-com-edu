import { hashPassword } from './_lib/password.js'

const html = (body) =>
  new Response(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Setup</title>
  <style>body{font-family:system-ui;background:#0a0e1a;color:#e8eaf6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .box{background:#0d1b2e;border:1px solid #1a2744;border-radius:16px;padding:40px;max-width:480px;width:100%}
  h2{margin-bottom:16px}p{color:#90a4ae;line-height:1.6;margin-bottom:12px}a{color:#64b5f6}
  b{color:#e8eaf6}.warn{color:#ef9a9a}</style></head><body><div class="box">${body}</div></body></html>`,
  { headers: { 'Content-Type': 'text/html; charset=utf-8' } })

export async function onRequestGet(context) {
  const { env } = context

  const existing = await env.USERS.get('u:admin')
  if (existing) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Setup</title></head><body>
      <p>Setup já realizado. <a href="/login">Ir para login</a></p></body></html>`,
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const username = 'admin'
  const pass = env.ADMIN_PASS || 'milhas2026'
  const hash = await hashPassword(pass)

  const user = {
    id: 1,
    username,
    password_hash: hash,
    nome: 'Administrador',
    email: '',
    plano: 'admin',
    ativo: true,
    is_admin: true,
    validade: null,
    created_at: new Date().toISOString()
  }

  await env.USERS.put(`u:${username}`, JSON.stringify(user))
  await env.USERS.put('uid:1', username)
  await env.USERS.put('nid', '2')

  return html(`
    <h2>✅ Admin criado com sucesso!</h2>
    <p>Usuário: <b>${username}</b></p>
    <p>Senha: <b>${pass}</b></p>
    <p><a href="/login">→ Fazer login</a></p>
    <p class="warn">⚠️ Altere a senha no painel admin após entrar!</p>
  `)
}
