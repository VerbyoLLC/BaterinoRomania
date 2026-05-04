/** Session drafts for partner onboarding so „Înapoi” / refresh keeps in-progress fields. */

export const PARTNER_SIGNUP_COMPANY_DRAFT_KEY = 'baterino:partnerSignup:company:v1'
export const PARTNER_SIGNUP_ACTIVITY_DRAFT_KEY = 'baterino:partnerSignup:activity:v1'

export type PartnerCompanyDraft = {
  companyName: string
  cui: string
  companyStreet: string
  companyCounty: string
  companyCity: string
  companyPostalCode: string
}

export type PartnerActivityDraft = {
  activities: string[]
  contactFirstName: string
  contactLastName: string
  legalPhone: string
  /** Opțional — URL site companie */
  website?: string
}
