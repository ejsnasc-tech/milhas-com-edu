function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
function jsonError(msg, status = 500) { return json({ error: msg }, status) }

export async function onRequestGet(context) {
  const { env } = context
  const cfg = await env.USERS.get('pixcfg', { type: 'json' })
  return json(cfg || { chave: '', tipoChave: '', banco: '', titular: '', instrucoes: '' })
}

export async function onRequestPut(context) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const cfg = {
    chave: String(body.chave || '').trim(),
    tipoChave: String(body.tipoChave || '').trim(),
    banco: String(body.banco || '').trim(),
    titular: String(body.titular || '').trim(),
    instrucoes: String(body.instrucoes || '').trim(),
    updatedAt: new Date().toISOString()
  }
  if (!cfg.chave) return jsonError('Chave Pix é obrigatória', 400)
  await env.USERS.put('pixcfg', JSON.stringify(cfg))
  return json({ success: true, cfg })
}
