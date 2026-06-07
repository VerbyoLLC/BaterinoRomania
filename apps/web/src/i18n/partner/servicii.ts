import type { LangCode } from '../menu'
import { PARTNER_SERVICII_OPTIONS } from '../../lib/partner-servicii-options'

export type PartnerServiciiOption = { id: (typeof PARTNER_SERVICII_OPTIONS)[number]['id']; label: string }

const labels: Record<LangCode, Record<(typeof PARTNER_SERVICII_OPTIONS)[number]['id'], string>> = {
  ro: {
    fotovoltaice: 'Instalare sisteme fotovoltaice',
    baterii: 'Instalare baterii LiFePO4',
    offgrid: 'Sisteme off-grid',
    ongrid: 'Sisteme on-grid',
    rezidential: 'Soluții rezidențiale',
    industrial: 'Soluții industriale',
    service: 'Service și mentenanță',
    consultanta: 'Consultanță energetică',
  },
  en: {
    fotovoltaice: 'Photovoltaic system installation',
    baterii: 'LiFePO4 battery installation',
    offgrid: 'Off-grid systems',
    ongrid: 'On-grid systems',
    rezidential: 'Residential solutions',
    industrial: 'Industrial solutions',
    service: 'Service & maintenance',
    consultanta: 'Energy consulting',
  },
}

export function getPartnerServiciiOptions(lang: LangCode): PartnerServiciiOption[] {
  const lb = labels[lang] ?? labels.ro
  return PARTNER_SERVICII_OPTIONS.map((opt) => ({
    id: opt.id,
    label: lb[opt.id],
  }))
}
