// Per-device memory: which classes this browser hosts and who it joined as.
// Real accounts arrive in milestone 3; until then a rejoin on the same phone keeps its group.

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private mode or storage blocked: the session still works, it just won't be remembered.
  }
}

export function myParticipantId(code: string): string {
  const key = `wl:me:${code}`
  let id = read(key)
  if (!id) {
    id = crypto.randomUUID()
    write(key, id)
  }
  return id
}

export function rememberedName(): string {
  return read('wl:name') ?? ''
}

export function rememberName(name: string) {
  write('wl:name', name)
}

export function markHosting(code: string) {
  write(`wl:host:${code}`, '1')
}

export function isHosting(code: string): boolean {
  return read(`wl:host:${code}`) === '1'
}

export function cacheSnapshot(code: string, json: string) {
  write(`wl:cache:${code}`, json)
}

export function cachedSnapshot(code: string): string | null {
  return read(`wl:cache:${code}`)
}
