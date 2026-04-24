import { verifyJWT, getCookie } from './_lib/jwt.js'

const ASSET_EXTS = ['.css', '.js', '.svg', '.png', '.jpg', '.ico', '.woff', '.woff2', '.webp', '.map']
// Páginas públicas (com e sem .html — Cloudflare Pages usa pretty URLs)
const LOGIN_PATHS = ['/login', '/login.html', '/register', '/register.html']
const PUBLIC_PATHS = ['/api/login', '/api/logout', '/api/register', '/setup']

export async function onRequest(context) {
  const { request, env, next } = context
  const url = new URL(request.url)
  const path = url.pathname

  // Assets estáticos — sempre público
  if (ASSET_EXTS.some(ext => path.endsWith(ext))) {
    return next()
  }

  // Página de login — pública, mas redireciona para home se já logado
  if (LOGIN_PATHS.includes(path)) {
    const token = getCookie(request, 'session')
    const user = token && env.JWT_SECRET ? await verifyJWT(token, env.JWT_SECRET) : null
    if (user) return Response.redirect(new URL('/', request.url), 302)
    return next()
  }

  // Rotas API públicas (login/logout/setup)
  if (PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
    return next()
  }

  // Verificar autenticação JWT
  const token = getCookie(request, 'session')
  const user = token && env.JWT_SECRET ? await verifyJWT(token, env.JWT_SECRET) : null

  // Rotas de API protegidas → retorna JSON
  if (path.startsWith('/api/')) {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      })
    }
    if (path.startsWith('/api/admin/') && !user.isAdmin) {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      })
    }
    return next()
  }

  // Páginas HTML protegidas
  if (!user) {
    return Response.redirect(new URL('/login', request.url), 302)
  }

  // /admin e /admin.html → exige admin
  if ((path === '/admin' || path === '/admin.html') && !user.isAdmin) {
    return Response.redirect(new URL('/', request.url), 302)
  }

  return next()
}
