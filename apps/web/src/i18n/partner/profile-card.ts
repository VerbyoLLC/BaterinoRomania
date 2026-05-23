import type { LangCode } from '../menu'

export type PartnerProfileCardTranslations = {
  defaultNamePublic: string
  defaultNamePreview: string
  badgePublic: string
  badgePrivate: string
  badgeActiveInstaller: string
  partnerBadgeAria: string
  partnerBadgeLabel: string
  locationPlaceholder: string
  noDescriptionPublic: string
  noDescriptionPreview: string
  servicesHeading: string
  servicePlaceholder1: string
  servicePlaceholder2: string
  servicePlaceholder3: string
  phoneFallback: string
  workGalleryHeading: string
  workPhotoAlt: string
  contactCta: string
}

const ro: PartnerProfileCardTranslations = {
  defaultNamePublic: 'Instalator',
  defaultNamePreview: 'Numele companiei tale',
  badgePublic: 'Public',
  badgePrivate: 'Privat',
  badgeActiveInstaller: 'Instalator Baterino — profil activ',
  partnerBadgeAria: 'Partener Baterino',
  partnerBadgeLabel: 'Partener Baterino',
  locationPlaceholder: 'Locație',
  noDescriptionPublic: 'Fără descriere publică disponibilă momentan.',
  noDescriptionPreview:
    'Descrierea companiei tale va apărea aici — prezintă experiența și valorile echipei tale.',
  servicesHeading: 'Servicii oferite',
  servicePlaceholder1: 'Serviciu 1',
  servicePlaceholder2: 'Serviciu 2',
  servicePlaceholder3: 'Serviciu 3',
  phoneFallback: 'Telefon',
  workGalleryHeading: 'Lucrări realizate',
  workPhotoAlt: 'Lucrare',
  contactCta: 'Contactează instalatorul',
}

const en: PartnerProfileCardTranslations = {
  defaultNamePublic: 'Installer',
  defaultNamePreview: 'Your company name',
  badgePublic: 'Public',
  badgePrivate: 'Private',
  badgeActiveInstaller: 'Baterino installer — active profile',
  partnerBadgeAria: 'Baterino partner',
  partnerBadgeLabel: 'Baterino partner',
  locationPlaceholder: 'Location',
  noDescriptionPublic: 'No public description available at the moment.',
  noDescriptionPreview:
    'Your company description will appear here — share your experience and what your team stands for.',
  servicesHeading: 'Services offered',
  servicePlaceholder1: 'Service 1',
  servicePlaceholder2: 'Service 2',
  servicePlaceholder3: 'Service 3',
  phoneFallback: 'Phone',
  workGalleryHeading: 'Completed projects',
  workPhotoAlt: 'Project',
  contactCta: 'Contact installer',
}

const zh: PartnerProfileCardTranslations = {
  defaultNamePublic: '安装商',
  defaultNamePreview: '您的公司名称',
  badgePublic: '公开',
  badgePrivate: '非公开',
  badgeActiveInstaller: 'Baterino 安装商 — 主页已启用',
  partnerBadgeAria: 'Baterino 合作伙伴',
  partnerBadgeLabel: 'Baterino 合作伙伴',
  locationPlaceholder: '位置',
  noDescriptionPublic: '暂无公开介绍。',
  noDescriptionPreview: '您的公司介绍将显示在此处 — 可介绍经验与团队价值。',
  servicesHeading: '提供的服务',
  servicePlaceholder1: '服务 1',
  servicePlaceholder2: '服务 2',
  servicePlaceholder3: '服务 3',
  phoneFallback: '电话',
  workGalleryHeading: '项目案例',
  workPhotoAlt: '项目',
  contactCta: '联系安装商',
}

const translations: Record<LangCode, PartnerProfileCardTranslations> = { ro, en, zh }

export function getPartnerProfileCardTranslations(lang: LangCode): PartnerProfileCardTranslations {
  return translations[lang] ?? translations.ro
}
