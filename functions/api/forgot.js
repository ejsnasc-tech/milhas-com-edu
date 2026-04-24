import { sendEmail, emailRecuperacaoSenha } from '../_lib/email.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Email inválido' }, 400)
  }

  // Procura usuário pelo email (varre KV — pequeno volume)
  const list = await env.USERS.list({ prefix: 'u:' })
  let user = null
  for (const k of list.keys) {
    const u = await env.USERS.get(k.name, { type: 'json' })
    if (u && u.email && u.email.toLowerCase() === email) { user = u; break }
  }

  // Resposta sempre igual (não revelar se email existe)
  if (!user) {
    return json({ success: true, message: 'Se o email estiver cadastrado, você receberá as instruções.' })
  }

  // Gera token de reset (válido por 1h)
  const token = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).slice(2, 10)
  await env.USERS.put(`reset:${token}`, JSON.stringify({
    userId: user.id,
    username: user.username,
    email: user.email,
    createdAt: new Date().toISOString()
  }), { expirationTtl: 3600 }) // 1 hora

  const url = new URL(request.url)
  const link = `${url.protocol}//${url.host}/reset?token=${token}`

  const result = await sendEmail(env, {
    to: user.email,
    subject: '🔐 Recuperação de senha — Milhas com Edu',
    html: emailRecuperacaoSenha({ nome: user.nome, link })
  })

  if (!result.success) {
    console.error('Falha ao enviar email:', result)
    return json({
      error: 'Não foi possível enviar o email: ' + (result.error || 'erro desconhecido'),
      detalhe: result
    }, 500)
  }

  return json({ success: true, message: 'Email enviado! Verifique sua caixa de entrada (e spam).' })
}
