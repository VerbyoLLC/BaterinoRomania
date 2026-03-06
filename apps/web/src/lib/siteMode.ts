/** When true: only Instalatori page + partner login (no register, no other public pages). Set VITE_SITE_MODE=full for full site. */
export const INSTALATORI_ONLY = import.meta.env.VITE_SITE_MODE !== 'full'
