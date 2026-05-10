import type { LangCode } from '../i18n/menu'
import { getClientProfile, type ClientProfileDto } from './api'

export type ClientNotificationItem = {
  id: 'profile_incomplete_for_warranty' | 'welcome_account_created'
  createdAt: string
  title: string
  message: string
  ctaLabel: string
  href: string
}

const NOTIF_READ_STORAGE_PREFIX = 'baterino-client-notifications-read:'

function notificationReadStorageKey(userId: string): string {
  return `${NOTIF_READ_STORAGE_PREFIX}${userId}`
}

function notificationFingerprint(item: ClientNotificationItem): string {
  return `${item.id}:${item.createdAt}`
}

function notifyNotificationsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('baterino-notifications-change'))
  }
}

export function getClientNotificationReadSet(userId: string | null): Set<string> {
  if (!userId || typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(notificationReadStorageKey(userId))
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

export function isClientNotificationRead(item: ClientNotificationItem, userId: string | null): boolean {
  return getClientNotificationReadSet(userId).has(notificationFingerprint(item))
}

export function markClientNotificationRead(item: ClientNotificationItem, userId: string | null): void {
  if (!userId || typeof window === 'undefined') return
  const set = getClientNotificationReadSet(userId)
  const fp = notificationFingerprint(item)
  if (set.has(fp)) return
  set.add(fp)
  localStorage.setItem(notificationReadStorageKey(userId), JSON.stringify([...set]))
  notifyNotificationsChanged()
}

export function getClientUnreadNotificationCount(
  items: ClientNotificationItem[],
  userId: string | null,
): number {
  const readSet = getClientNotificationReadSet(userId)
  return items.filter((item) => !readSet.has(notificationFingerprint(item))).length
}

export function isClientProfileCompleteForWarranty(profile: ClientProfileDto | null): boolean {
  if (!profile) return false
  const phoneDigits = String(profile.phone || '').replace(/\D/g, '')
  const hasPersonal = Boolean(
    String(profile.firstName || '').trim() &&
      String(profile.lastName || '').trim() &&
      phoneDigits.length === 9,
  )
  if (!hasPersonal) return false
  const hasBilling = Boolean(
    String(profile.billAddress || '').trim() &&
      String(profile.billCounty || '').trim() &&
      String(profile.billCity || '').trim() &&
      String(profile.billPostal || '').trim(),
  )
  if (!hasBilling) return false
  if (!profile.deliveryDifferent) return true
  return Boolean(
    String(profile.delAddress || '').trim() &&
      String(profile.delCounty || '').trim() &&
      String(profile.delCity || '').trim() &&
      String(profile.delPostal || '').trim(),
  )
}

export async function getClientNotificationItems(lang: LangCode): Promise<ClientNotificationItem[]> {
  const data = await getClientProfile()
  const items: ClientNotificationItem[] = [
    {
      id: 'welcome_account_created',
      createdAt: String(data.createdAt || ''),
      title: lang === 'en' ? 'Welcome to Baterino!' : lang === 'zh' ? '欢迎来到 Baterino！' : 'Bine ai venit pe Baterino!',
      message:
        lang === 'en'
          ? 'Your account was created successfully. You can now register products and manage warranties.'
          : lang === 'zh'
            ? '您的账户已成功创建。现在可以注册产品并管理保修。'
            : 'Contul tău îți permite să comanzi produse, să trimiți coduri de reducere prietenilor, să gestionezi garanțiile, să urmărești comenzile și să contactezi echipa noastră de suport — totul într-un singur loc.',
      ctaLabel: lang === 'en' ? 'My account' : lang === 'zh' ? '我的账户' : 'Contul meu',
      href: '/client',
    },
  ]
  if (!isClientProfileCompleteForWarranty(data.profile)) {
    items.push({
      id: 'profile_incomplete_for_warranty',
      createdAt: String(data.createdAt || ''),
      title:
        lang === 'en'
          ? 'Complete your profile for warranty certificate'
          : lang === 'zh'
            ? '请完善资料以生成保修证书'
            : 'Completeaza-ti profilul Baterino!',
      message:
        lang === 'en'
          ? 'Please complete your personal details and address so we can generate your warranty certificate.'
          : lang === 'zh'
            ? '请完善个人资料和地址信息，以便我们生成您的保修证书。'
            : 'Te rugam sa iti completezi datele personale. Acestea te ajuta sa iti generezi garantia pentru produsele achizitionate. Poti sa iti completezi datele aici.',
      ctaLabel: lang === 'en' ? 'Go to settings' : lang === 'zh' ? '前往设置' : 'Completează acum',
      href: '/client/setari',
    })
  }
  return items
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const at = new Date(a.item.createdAt).getTime()
      const bt = new Date(b.item.createdAt).getTime()
      if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) return bt - at
      // Tie-breaker: keep recently added notification definitions first.
      return b.idx - a.idx
    })
    .map((row) => row.item)
}
