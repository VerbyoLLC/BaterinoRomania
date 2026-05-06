/**
 * Coșul e persistat per cont client (localStorage), ca la reautentificare să rămână articolele.
 * Cheie veche (fără userId) — migrată automat la prima încărcare ca client.
 */
export const BATERINO_CART_STORAGE_KEY = 'baterino-cart-v1'

export function clientCartStorageKey(userId: string): string {
  const id = String(userId || '').trim()
  return id ? `${BATERINO_CART_STORAGE_KEY}:user:${id}` : BATERINO_CART_STORAGE_KEY
}

export function clearClientCartStorage(userId: string): void {
  try {
    localStorage.removeItem(clientCartStorageKey(userId))
  } catch {
    /* ignore */
  }
}

/** Cheie globală veche (înainte de coș per user); poate fi ștearsă după migrare. */
export function clearLegacyCartStorage(): void {
  try {
    localStorage.removeItem(BATERINO_CART_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
