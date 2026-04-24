import { verifyJWT, getCookie } from './_lib/jwt.js'

const ASSET_EXTS = ['.css', '.js', '.svg', '.png', '.jpg', '.ico', '.woff', '.woff2', '.webp', '.map']
const LOGIN_PATHS = ['/login', '/login.html', '/register', '/register.html', '/forgot', '/forgot.html', '/reset', '/reset.html']
const PUBLIC_PATHS = ['/api/login', '/api/logout', '/api/register', '/api/forgot', '/api/reset', '/setup']

// Páginas e APIs liberadas mesmo para usuário com validade vencida
// (precisam funcionar para que o cliente possa renovar)
const EXPIRED_OK_PAGES = ['/planos', '/planos.html']
const EXPIRED_OK_API_PREFIXES = [
  '/api/logout', '/api/me', '/api/plans',
  '/api/promo/', '/api/payment/'
]

function isExpired(validade) {
  // Sem validade definida = sem plano ativo = considerado expirado
  if (!validade) return true
  return new Date(validade) < new Date()
}

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

  // Rotas API públicas (login/logout/setup/register)
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

    // Bloqueio por validade vencida (admin sempre passa)
    if (!user.isAdmin) {
      const isExpiredOkApi = EXPIRED_OK_API_PREFIXES.some(p => path === p || path.startsWith(p))
      if (!isExpiredOkApi) {
        const dbUser = await env.USERS.get(`u:${user.username}`, { type: 'json' })
        if (!dbUser || !dbUser.ativo) {
          return new Response(JSON.stringify({ error: 'Conta bloqueada' }), {
            status: 403, headers: { 'Content-Type': 'application/json' }
          })
        }
        if (isExpired(dbUser.validade)) {
          const semPlano = !dbUser.validade
          return new Response(JSON.stringify({
            error: semPlano ? 'Você precisa assinar um plano' : 'Plano expirado',
            expirado: true,
            semPlano,
            validade: dbUser.validade,
            redirect: '/planos'
          }), {
            status: 402, headers: { 'Content-Type': 'application/json' }
          })
        }
      }
    }

    return next()
  }

  // Páginas HTML protegidas
  if (!user) {
    return Response.redirect(new URL('/login', request.url), 302)
  }

  // /admin → exige admin
  if ((path === '/admin' || path === '/admin.html') && !user.isAdmin) {
    return Response.redirect(new URL('/', request.url), 302)
  }

  // Bloqueio por validade vencida em páginas HTML (exceto /planos e /admin)
  if (!user.isAdmin && !EXPIRED_OK_PAGES.includes(path)) {
    const dbUser = await env.USERS.get(`u:${user.username}`, { type: 'json' })
    if (!dbUser || !dbUser.ativo) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/login?error=blocked',
          'Set-Cookie': 'session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Secure'
        }
      })
    }
    if (isExpired(dbUser.validade)) {
      const motivo = dbUser.validade ? 'expirado' : 'semplano'
      return Response.redirect(new URL('/planos?motivo=' + motivo, request.url), 302)
    }
  }

  return next()
}
