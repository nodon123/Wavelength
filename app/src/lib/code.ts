// No 0/O or 1/I/L so codes are easy to read off a projector.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateCode(length = 5): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function isValidCode(code: string): boolean {
  return /^[A-Z0-9]{3,10}$/.test(code)
}

export function joinUrl(code: string): string {
  return `${window.location.origin}/join/${code}`
}
