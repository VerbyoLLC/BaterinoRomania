/** When true: only Instalatori page + partner login (no register, no other public pages).
 *  Development (`vite dev`): always full site.
 *  Production build: full site only when VITE_SITE_MODE=full.
 */
export const INSTALATORI_ONLY = import.meta.env.DEV
  ? false
  : import.meta.env.VITE_SITE_MODE !== 'full'