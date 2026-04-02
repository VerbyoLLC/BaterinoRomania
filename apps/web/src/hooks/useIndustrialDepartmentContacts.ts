import { useEffect, useState } from 'react'
import {
  CONTACT_WHATSAPP_WAME,
  digitsForWaMe,
  formatPhoneDisplay,
  telHrefFromStored,
} from '../lib/contactWhatsApp'
import { departmentRow, ensurePublicDepartmentPhones } from '../lib/departmentPhones'

function firstNonEmpty(...vals: (string | undefined | null)[]): string | undefined {
  for (const v of vals) {
    const t = v != null ? String(v).trim() : ''
    if (t) return t
  }
  return undefined
}

/**
 * Panou industrial (template / produs): folosește **întâi** rândul Industrial din admin,
 * apoi **General**; doar dacă tot lipsește → fallback hardcodat.
 *
 * - **Apel (tel / text):** industrial telefon → industrial WhatsApp → general telefon → general WhatsApp.
 * - **WhatsApp (wa.me):** industrial WhatsApp → industrial telefon → general WhatsApp → general telefon.
 */
export function useIndustrialDepartmentContacts(): {
  whatsappWaMeDigits: string
  phoneDisplay: string
  phoneTelHref: string
} {
  const [whatsappWaMeDigits, setWhatsappWaMeDigits] = useState(CONTACT_WHATSAPP_WAME)
  const [phone, setPhone] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    ensurePublicDepartmentPhones()
      .then((rows) => {
        if (cancelled) return
        const ind = departmentRow(rows, 'industrial')
        const gen = departmentRow(rows, 'general')
        const waRaw = firstNonEmpty(
          ind?.whatsapp,
          ind?.phone,
          gen?.whatsapp,
          gen?.phone,
        )
        setWhatsappWaMeDigits(digitsForWaMe(waRaw))
        const telRaw = firstNonEmpty(
          ind?.phone,
          ind?.whatsapp,
          gen?.phone,
          gen?.whatsapp,
        )
        setPhone(telRaw)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return {
    whatsappWaMeDigits,
    phoneDisplay: formatPhoneDisplay(phone),
    phoneTelHref: telHrefFromStored(phone),
  }
}
