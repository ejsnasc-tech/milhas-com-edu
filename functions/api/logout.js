export async function onRequest() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/login.html',
      'Set-Cookie': 'session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Secure'
    }
  })
}
