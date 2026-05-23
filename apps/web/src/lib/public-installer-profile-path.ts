/**
 * Segment URL SPA pentru paginile publice ale instalatorilor.
 * Ex.: /companii-instalatori-fotovoltaice/@nume-companie
 */
export const PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT = 'companii-instalatori-fotovoltaice'

/** `handleRaw` din ruta `:handle`, poate fi `@firma` sau `firma`. */
export function publicInstallerProfileUrlPath(handleRaw: string): string {
  let h = String(handleRaw ?? '').trim()
  if (!h) return `/${PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT}`
  if (!h.startsWith('@')) h = `@${h}`
  return `/${PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT}/${h}`
}

/** Canonical (slug JSON deja fără `@`, lowercase). */
export function publicInstallerProfileCanonical(slugNormalizedNoAt: string): string {
  const s = String(slugNormalizedNoAt ?? '').trim().replace(/^@/, '').toLowerCase()
  if (!s) return `/${PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT}`
  return `/${PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT}/@${s}`
}
