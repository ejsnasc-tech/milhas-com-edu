// PBKDF2 hash/verify usando Web Crypto API nativa (sem dependências)
const ITERATIONS = 100000
const KEY_LEN = 32
const HASH = 'SHA-256'

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(password, salt)
  return `pbkdf2:${ITERATIONS}:${bufToHex(salt)}:${bufToHex(key)}`
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('pbkdf2:')) return false
  const parts = stored.split(':')
  if (parts.length !== 4) return false
  const [, iters, saltHex, keyHex] = parts
  const salt = hexToBuf(saltHex)
  const key = await deriveKey(password, salt, parseInt(iters))
  return bufToHex(key) === keyHex
}

async function deriveKey(password, salt, iterations = ITERATIONS) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: HASH },
    keyMaterial, KEY_LEN * 8
  )
  return new Uint8Array(bits)
}

function bufToHex(buf) {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBuf(hex) {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return arr
}
