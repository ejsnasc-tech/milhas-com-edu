function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const filter = url.searchParams.get('status') // pendente | aprovado | rejeitado | (vazio = todos)

  const listed = await env.USERS.list({ prefix: 'pay:' })
  const items = await Promise.all(
    listed.keys.map(k => env.USERS.get(k.name, { type: 'json' }))
  )
  const sorted = items
    .filter(p => p && (!filter || p.status === filter))
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  return json(sorted)
}
