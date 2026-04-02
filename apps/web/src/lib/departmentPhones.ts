import { getPublicDepartmentPhones, type DepartmentPhoneKey, type DepartmentPhoneRow } from './api'

let inflight: Promise<DepartmentPhoneRow[]> | undefined

/**
 * Liste numere din admin (public API). Fără cache persistent — după fiecare „val” din request,
 * următorul apel ia date proaspete (ex. după salvare în admin + revenire pe site).
 * Apelurile simultane din aceeași „undă” folosesc același fetch (deduplicare).
 */
export function ensurePublicDepartmentPhones(): Promise<DepartmentPhoneRow[]> {
  if (inflight) return inflight
  inflight = getPublicDepartmentPhones()
    .then((rows) => rows)
    .finally(() => {
      inflight = undefined
    })
  return inflight
}

/** Pentru teste sau după ce știi că datele s-au schimbat în alt tab. */
export function clearDepartmentPhonesInflight(): void {
  inflight = undefined
}

export function departmentRow(
  rows: DepartmentPhoneRow[],
  key: DepartmentPhoneKey,
): DepartmentPhoneRow | undefined {
  return rows.find((r) => r.department === key)
}
