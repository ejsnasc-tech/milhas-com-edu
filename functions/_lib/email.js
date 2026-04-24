// Envio de email via Resend (https://resend.com)
// Requer env vars: RESEND_API_KEY e EMAIL_FROM (ex: 'Milhas com Edu <noreply@seudominio.com>')

export async function sendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não configurada — email não enviado')
    return { success: false, error: 'Email service not configured' }
  }
  const from = env.EMAIL_FROM || 'Milhas com Edu <onboarding@resend.dev>'
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, html })
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    console.error('Resend error', resp.status, data)
    return { success: false, error: data.message || 'Send failed', status: resp.status }
  }
  return { success: true, id: data.id }
}

export function emailRecuperacaoSenha({ nome, link }) {
  return `
  <div style="background:#f4f6fa;padding:40px 20px;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <div style="background:linear-gradient(135deg,#1565c0,#7c4dff);padding:28px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:1.4rem;">Milhas com Edu</h1>
      </div>
      <div style="padding:32px;color:#222;line-height:1.6;">
        <h2 style="margin-top:0;color:#1565c0;">🔐 Recuperação de senha</h2>
        <p>Olá${nome ? ', <strong>' + escapeHtml(nome) + '</strong>' : ''}!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${link}" style="display:inline-block;background:linear-gradient(90deg,#1565c0,#7c4dff);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:1rem;">
            Redefinir minha senha
          </a>
        </div>
        <p style="font-size:.85rem;color:#666;">Ou copie e cole este link no navegador:<br>
          <a href="${link}" style="color:#1565c0;word-break:break-all;">${link}</a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="font-size:.8rem;color:#888;">⏰ Este link é válido por <strong>1 hora</strong>.</p>
        <p style="font-size:.8rem;color:#888;">Se você não solicitou a recuperação, ignore este email — sua senha continuará a mesma.</p>
      </div>
      <div style="background:#0a0e1a;padding:18px;text-align:center;color:#90a4ae;font-size:.78rem;">
        © Milhas com Edu — Não responda a este email.
      </div>
    </div>
  </div>`
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}
