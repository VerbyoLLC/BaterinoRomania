/**
 * Client-account notifications are only ever shown when `authRole === 'client'`, which never
 * happens on this public SSR site (client accounts sign in on the Vite-hosted /client area).
 * Stubbed here so Header/MobileMenu compile without porting the full client-profile stack.
 */
export type ClientNotificationItem = { id: string; createdAt: string }

export function getClientUnreadNotificationCount(
  _items: ClientNotificationItem[],
  _userId: string | null,
): number {
  return 0
}

export async function getClientNotificationItems(): Promise<ClientNotificationItem[]> {
  return []
}
