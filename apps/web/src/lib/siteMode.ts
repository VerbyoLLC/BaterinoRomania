/** When true: only Instalatori page + partner login (no register, no other public pages).
 *  Development (`vite dev`): always full site.
 *  Production: full site by default; set VITE_SITE_MODE=instalatori for event-only mode.
 */
export const INSTALATORI_ONLY = import.meta.env.DEV
  ? false
  : import.meta.env.VITE_SITE_MODE === 'instalatori'