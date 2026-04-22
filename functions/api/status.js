export async function onRequestGet() {
  return new Response(JSON.stringify({ configured: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
