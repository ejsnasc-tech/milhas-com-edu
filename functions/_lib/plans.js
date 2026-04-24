// Planos disponíveis e helpers de pagamento
export const PLANS = {
  mensal: {
    id: 'mensal',
    nome: 'Mensal',
    dias: 30,
    preco: 30.00,
    descricao: 'Acesso por 30 dias'
  },
  semestral: {
    id: 'semestral',
    nome: 'Semestral',
    dias: 180,
    preco: 150.00,
    descricao: 'Acesso por 6 meses (economize R$30)'
  },
  anual: {
    id: 'anual',
    nome: 'Anual',
    dias: 365,
    preco: 270.00,
    descricao: 'Acesso por 12 meses (economize R$90)'
  }
}

export function getPlan(id) {
  return PLANS[id] || null
}

export function listPlans() {
  return Object.values(PLANS)
}

// Aplica desconto de promo ao preço base. Retorna { final, descontoValor }.
export function applyPromo(precoBase, promo) {
  if (!promo) return { final: precoBase, descontoValor: 0 }
  let desconto = 0
  if (promo.tipo === 'percent') {
    desconto = (precoBase * Number(promo.valor)) / 100
  } else if (promo.tipo === 'fixed') {
    desconto = Number(promo.valor)
  }
  if (desconto < 0) desconto = 0
  if (desconto > precoBase) desconto = precoBase
  const final = Math.max(0, precoBase - desconto)
  return { final: round2(final), descontoValor: round2(desconto) }
}

function round2(n) { return Math.round(n * 100) / 100 }

// Estende validade existente do usuário, ou usa hoje como base se vencida.
export function extendValidade(currentValidade, dias) {
  const now = new Date()
  let base = now
  if (currentValidade) {
    const cur = new Date(currentValidade)
    if (!isNaN(cur) && cur > now) base = cur
  }
  const next = new Date(base.getTime() + dias * 24 * 60 * 60 * 1000)
  return next.toISOString()
}

// Valida promo (existência, ativo, expiração, usos restantes, plano permitido)
export function validatePromo(promo, planoId) {
  if (!promo) return { ok: false, error: 'Cupom não encontrado' }
  if (promo.ativo === false) return { ok: false, error: 'Cupom desativado' }
  if (promo.expiraEm && new Date(promo.expiraEm) < new Date()) {
    return { ok: false, error: 'Cupom expirado' }
  }
  if (promo.maxUsos && promo.usos >= promo.maxUsos) {
    return { ok: false, error: 'Cupom esgotado' }
  }
  if (promo.planos && Array.isArray(promo.planos) && promo.planos.length > 0
      && !promo.planos.includes(planoId)) {
    return { ok: false, error: 'Cupom não válido para este plano' }
  }
  return { ok: true }
}
