import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { KeyRound, Mail, MapPin, Shield, User } from 'lucide-react'
import {
  getClientProfile,
  postClientChangeEmail,
  postClientChangePassword,
  putClientProfile,
  setAuthToken,
  type ClientProfilePayload,
} from '../../lib/api'
import {
  formatRoNational9Display,
  sanitizeAddressField,
  sanitizeEmailTyping,
  sanitizePersonName,
  sanitizePostalField,
} from '../../lib/formInputSanitize'
import PasswordInput from '../../components/PasswordInput'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'

/** Matches `inputClass` visually; PasswordInput adds `pr-11` for the eye toggle. */
const passwordFieldClassName =
  '!h-12 !rounded-xl !border !border-slate-200 !bg-white !pl-3.5 !text-sm font-[\'Inter\'] !text-slate-900 placeholder:text-slate-400 focus:!outline-none focus:!ring-2 focus:!ring-slate-900/10'

const inputClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-[\'Inter\'] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10'
const inputClassError =
  'h-12 w-full rounded-xl border-2 border-red-500 bg-white px-3.5 text-sm font-[\'Inter\'] text-slate-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-500/25'
const phoneFieldShellClass =
  'flex h-12 w-full min-w-0 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10'
const phoneInnerInputClass =
  'min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm font-[\'Inter\'] text-slate-900 outline-none placeholder:text-slate-400'

const SETTINGS_NAV: readonly { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'date-personale', label: 'Date personale', Icon: User },
  { id: 'adresa-livrare', label: 'Adresa de livrare', Icon: MapPin },
  { id: 'schimba-parola', label: 'Schimbă parola', Icon: KeyRound },
  { id: 'schimba-email', label: 'Schimbă email', Icon: Mail },
  { id: 'autentificare-doi-pasi', label: 'Autentificare în doi pași', Icon: Shield },
] as const

function scrollToSettingsSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

type AddressFieldKey =
  | 'billAddress'
  | 'billCounty'
  | 'billCity'
  | 'billPostal'
  | 'delAddress'
  | 'delCounty'
  | 'delCity'
  | 'delPostal'

function SettingsSection({
  id,
  title,
  Icon,
  children,
}: {
  id: string
  title: string
  Icon?: LucideIcon
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6 last:mb-0"
    >
      <h2 className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900 font-['Inter']">
        {Icon ? (
          <Icon className="h-5 w-5 shrink-0 text-slate-600" strokeWidth={2} aria-hidden />
        ) : null}
        <span>{title}</span>
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function ClientSettings() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [billAddress, setBillAddress] = useState('')
  const [billCounty, setBillCounty] = useState('')
  const [billCity, setBillCity] = useState('')
  const [billPostal, setBillPostal] = useState('')
  const [deliveryDifferent, setDeliveryDifferent] = useState(false)
  const [delAddress, setDelAddress] = useState('')
  const [delCounty, setDelCounty] = useState('')
  const [delCity, setDelCity] = useState('')
  const [delPostal, setDelPostal] = useState('')

  const [loadError, setLoadError] = useState<string | null>(null)
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [personalSaveMsg, setPersonalSaveMsg] = useState<string | null>(null)
  const [addressSaveMsg, setAddressSaveMsg] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [personalSaveErr, setPersonalSaveErr] = useState<string | null>(null)
  const [addressSaveErr, setAddressSaveErr] = useState<string | null>(null)
  const [addressFieldErrors, setAddressFieldErrors] = useState<Partial<Record<AddressFieldKey, string>>>({})

  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [newPwd2, setNewPwd2] = useState('')
  const [pwdMsg, setPwdMsg] = useState<string | null>(null)
  const [pwdErr, setPwdErr] = useState<string | null>(null)
  const [pwdLoading, setPwdLoading] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [emailPwd, setEmailPwd] = useState('')
  const [emailMsg, setEmailMsg] = useState<string | null>(null)
  const [emailErr, setEmailErr] = useState<string | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  const billCities = useMemo(() => getCitiesForCounty(billCounty), [billCounty])
  const delCities = useMemo(() => getCitiesForCounty(delCounty), [delCounty])

  function buildPayload(): ClientProfilePayload {
    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.replace(/\D/g, '').slice(0, 9),
      billAddress: billAddress.trim(),
      billCounty: billCounty.trim(),
      billCity: billCity.trim(),
      billPostal: billPostal.trim(),
      deliveryDifferent,
      delAddress: deliveryDifferent ? delAddress.trim() : undefined,
      delCounty: deliveryDifferent ? delCounty.trim() : undefined,
      delCity: deliveryDifferent ? delCity.trim() : undefined,
      delPostal: deliveryDifferent ? delPostal.trim() : undefined,
    }
  }

  useEffect(() => {
    let c = false
    getClientProfile()
      .then(({ email: em, profile }) => {
        if (c) return
        setEmail(em)
        if (profile) {
          setFirstName(profile.firstName || '')
          setLastName(profile.lastName || '')
          setPhone(profile.phone || '')
          setBillAddress(profile.billAddress || '')
          setBillCounty(profile.billCounty || '')
          setBillCity(profile.billCity || '')
          setBillPostal(profile.billPostal || '')
          setDeliveryDifferent(Boolean(profile.deliveryDifferent))
          setDelAddress(profile.delAddress || '')
          setDelCounty(profile.delCounty || '')
          setDelCity(profile.delCity || '')
          setDelPostal(profile.delPostal || '')
        }
      })
      .catch((e) => {
        if (!c) setLoadError(e instanceof Error ? e.message : 'Eroare')
      })
    return () => {
      c = true
    }
  }, [])

  async function handleSavePersonal(e: React.FormEvent) {
    e.preventDefault()
    setSavingPersonal(true)
    setPersonalSaveMsg(null)
    setAddressSaveMsg(null)
    setPersonalSaveErr(null)
    setPhoneError(null)
    setLastNameError(null)
    setFirstNameError(null)
    try {
      const payload = buildPayload()
      let hasErr = false
      if (!payload.lastName) {
        setLastNameError('Introdu numele de familie (doar litere).')
        hasErr = true
      }
      if (!payload.firstName) {
        setFirstNameError('Introdu prenumele (doar litere).')
        hasErr = true
      }
      if (payload.phone.length !== 9) {
        setPhoneError('Introdu exact 9 cifre după +40.')
        hasErr = true
      }
      if (hasErr) return

      await putClientProfile(payload, 'personal')
      setPhoneError(null)
      setLastNameError(null)
      setFirstNameError(null)
      setPersonalSaveMsg('Datele personale au fost salvate.')
    } catch (err) {
      setPersonalSaveErr(err instanceof Error ? err.message : 'Eroare')
    } finally {
      setSavingPersonal(false)
    }
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    setSavingAddress(true)
    setAddressSaveMsg(null)
    setPersonalSaveMsg(null)
    setAddressSaveErr(null)
    setAddressFieldErrors({})
    try {
      const payload = buildPayload()
      const errs: Partial<Record<AddressFieldKey, string>> = {}
      if (!payload.billAddress.trim()) errs.billAddress = 'Completează adresa de facturare.'
      if (!payload.billCounty.trim()) errs.billCounty = 'Alege județul.'
      if (!payload.billCity.trim()) errs.billCity = 'Alege localitatea.'
      if (!payload.billPostal.trim()) errs.billPostal = 'Completează codul poștal.'
      if (deliveryDifferent) {
        if (!payload.delAddress?.trim()) errs.delAddress = 'Completează adresa de livrare.'
        if (!payload.delCounty?.trim()) errs.delCounty = 'Alege județul de livrare.'
        if (!payload.delCity?.trim()) errs.delCity = 'Alege localitatea de livrare.'
        if (!payload.delPostal?.trim()) errs.delPostal = 'Completează codul poștal de livrare.'
      }
      if (Object.keys(errs).length > 0) {
        setAddressFieldErrors(errs)
        return
      }

      await putClientProfile(payload, 'address')
      setAddressFieldErrors({})
      setAddressSaveMsg('Adresa a fost salvată.')
    } catch (err) {
      setAddressSaveErr(err instanceof Error ? err.message : 'Eroare')
    } finally {
      setSavingAddress(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdMsg(null)
    setPwdErr(null)
    if (newPwd.length < 8) {
      setPwdErr('Parola nouă: minimum 8 caractere.')
      return
    }
    if (newPwd !== newPwd2) {
      setPwdErr('Parolele noi nu coincid.')
      return
    }
    setPwdLoading(true)
    try {
      await postClientChangePassword(curPwd, newPwd)
      setPwdMsg('Parola a fost schimbată.')
      setCurPwd('')
      setNewPwd('')
      setNewPwd2('')
    } catch (err) {
      setPwdErr(err instanceof Error ? err.message : 'Eroare')
    } finally {
      setPwdLoading(false)
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailMsg(null)
    setEmailErr(null)
    const em = newEmail.trim().toLowerCase()
    if (!em) {
      setEmailErr('Introdu noul email.')
      return
    }
    setEmailLoading(true)
    try {
      const { token, email: nextEmail } = await postClientChangeEmail(em, emailPwd)
      setAuthToken(token)
      setEmail(nextEmail)
      setNewEmail('')
      setEmailPwd('')
      setEmailMsg('Emailul a fost actualizat. Folosește noul email la următoarea autentificare.')
    } catch (err) {
      setEmailErr(err instanceof Error ? err.message : 'Eroare')
    } finally {
      setEmailLoading(false)
    }
  }

  if (loadError) {
    return (
      <div>
        <p className="text-red-600 text-sm">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Setări</h1>
      <p className="text-slate-600 text-sm font-['Inter'] mb-6">
        Gestionează datele contului, adresa de livrare și securitatea autentificării.
      </p>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <nav
          aria-label="Secțiuni setări"
          className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-2 lg:w-56 lg:sticky lg:top-24 lg:self-start"
        >
          <ul className="flex flex-col gap-0.5">
            {SETTINGS_NAV.map((item) => {
              const NavIcon = item.Icon
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSettingsSection(item.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 font-['Inter'] transition-colors hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                  >
                    <NavIcon className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">
      <SettingsSection id="date-personale" title="Date personale" Icon={User}>
        <form onSubmit={handleSavePersonal} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Email curent</span>
            <input
              type="email"
              value={email}
              readOnly
              autoComplete="off"
              aria-readonly="true"
              title="Emailul se schimbă doar din secțiunea Schimbă email"
              className={`${inputClass} mt-1 cursor-default bg-slate-100 text-slate-600 border-slate-200 focus:border-slate-200 focus:ring-0`}
            />
            <span className="mt-1 block text-xs text-slate-500 font-['Inter']">
              Emailul nu poate fi editat aici. Pentru schimbare folosește secțiunea „Schimbă email”.
            </span>
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800 font-['Inter']">Nume</span>
              <input
                className={`${lastNameError ? inputClassError : inputClass} mt-1`}
                value={lastName}
                placeholder="Ex.: Popescu"
                autoComplete="family-name"
                aria-invalid={Boolean(lastNameError)}
                aria-describedby={lastNameError ? 'settings-nume-err' : undefined}
                onChange={(e) => {
                  setLastNameError(null)
                  setPersonalSaveMsg(null)
                  setLastName(sanitizePersonName(e.target.value))
                }}
              />
              {lastNameError ? (
                <p id="settings-nume-err" className="mt-1.5 text-sm text-red-600 font-['Inter']">
                  {lastNameError}
                </p>
              ) : null}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-800 font-['Inter']">Prenume</span>
              <input
                className={`${firstNameError ? inputClassError : inputClass} mt-1`}
                value={firstName}
                placeholder="Ex.: Maria"
                autoComplete="given-name"
                aria-invalid={Boolean(firstNameError)}
                aria-describedby={firstNameError ? 'settings-prenume-err' : undefined}
                onChange={(e) => {
                  setFirstNameError(null)
                  setPersonalSaveMsg(null)
                  setFirstName(sanitizePersonName(e.target.value))
                }}
              />
              {firstNameError ? (
                <p id="settings-prenume-err" className="mt-1.5 text-sm text-red-600 font-['Inter']">
                  {firstNameError}
                </p>
              ) : null}
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Telefon</span>
            <span className="mt-1 mb-1.5 block text-xs text-slate-500 font-['Inter']">Prefix +40 (fix); introdu exact 9 cifre.</span>
            <div
              className={
                phoneError
                  ? 'flex h-12 w-full min-w-0 items-stretch overflow-hidden rounded-xl border-2 border-red-500 bg-white transition-colors focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-500/25'
                  : phoneFieldShellClass
              }
            >
              <span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold tabular-nums text-slate-700">
                +40
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                className={`${phoneInnerInputClass} mt-0`}
                placeholder="7XX XXX XXX"
                value={formatRoNational9Display(phone)}
                maxLength={11}
                aria-invalid={Boolean(phoneError)}
                aria-describedby={phoneError ? 'settings-phone-err' : undefined}
                onChange={(e) => {
                  setPhoneError(null)
                  setPersonalSaveMsg(null)
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))
                }}
              />
            </div>
            {phoneError ? (
              <p id="settings-phone-err" className="mt-1.5 text-sm text-red-600 font-['Inter']">
                {phoneError}
              </p>
            ) : null}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={savingPersonal}
              className="min-h-11 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 font-['Inter']"
            >
              {savingPersonal ? 'Se salvează…' : 'Salvează datele personale'}
            </button>
            {personalSaveMsg ? (
              <p className="text-sm font-medium text-green-700 font-['Inter']" role="status">
                {personalSaveMsg}
              </p>
            ) : null}
          </div>
          {personalSaveErr ? (
            <p className="text-sm text-red-600 font-['Inter']">{personalSaveErr}</p>
          ) : null}
        </form>
      </SettingsSection>

      <SettingsSection id="adresa-livrare" title="Adresa de livrare" Icon={MapPin}>
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <p className="text-sm text-slate-600 font-['Inter'] -mt-1">
            Adresa de facturare este folosită implicit pentru livrare. Bifează mai jos dacă livrarea este în altă locație.
          </p>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 font-['Inter']">Facturare / livrare implicită</h3>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Adresă</span>
            <input
              className={`${addressFieldErrors.billAddress ? inputClassError : inputClass} mt-1`}
              value={billAddress}
              placeholder="Ex.: Str. Florilor nr. 5, bl. A, ap. 12"
              aria-invalid={Boolean(addressFieldErrors.billAddress)}
              onChange={(e) => {
                setAddressFieldErrors((p) => {
                  if (!p.billAddress) return p
                  const n = { ...p }
                  delete n.billAddress
                  return n
                })
                setBillAddress(sanitizeAddressField(e.target.value))
              }}
            />
            {addressFieldErrors.billAddress ? (
              <p className="mt-1.5 text-sm text-red-600 font-['Inter']">{addressFieldErrors.billAddress}</p>
            ) : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Județ</span>
            <select
              className={`${addressFieldErrors.billCounty ? inputClassError : inputClass} mt-1`}
              value={billCounty}
              aria-invalid={Boolean(addressFieldErrors.billCounty)}
              onChange={(e) => {
                setAddressFieldErrors((p) => {
                  const n = { ...p }
                  delete n.billCounty
                  delete n.billCity
                  return n
                })
                setBillCounty(e.target.value)
                setBillCity('')
              }}
            >
              <option value="">Alege județul</option>
              {ROMANIAN_COUNTIES.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
            {addressFieldErrors.billCounty ? (
              <p className="mt-1.5 text-sm text-red-600 font-['Inter']">{addressFieldErrors.billCounty}</p>
            ) : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Localitate</span>
            <select
              className={`${addressFieldErrors.billCity ? inputClassError : inputClass} mt-1`}
              value={billCity}
              aria-invalid={Boolean(addressFieldErrors.billCity)}
              onChange={(e) => {
                setAddressFieldErrors((p) => {
                  if (!p.billCity) return p
                  const n = { ...p }
                  delete n.billCity
                  return n
                })
                setBillCity(e.target.value)
              }}
            >
              <option value="">Alege localitatea</option>
              {billCities.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
            {addressFieldErrors.billCity ? (
              <p className="mt-1.5 text-sm text-red-600 font-['Inter']">{addressFieldErrors.billCity}</p>
            ) : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Cod poștal</span>
            <input
              className={`${addressFieldErrors.billPostal ? inputClassError : inputClass} mt-1`}
              value={billPostal}
              placeholder="Ex.: 010101"
              aria-invalid={Boolean(addressFieldErrors.billPostal)}
              onChange={(e) => {
                setAddressFieldErrors((p) => {
                  if (!p.billPostal) return p
                  const n = { ...p }
                  delete n.billPostal
                  return n
                })
                setBillPostal(sanitizePostalField(e.target.value))
              }}
            />
            {addressFieldErrors.billPostal ? (
              <p className="mt-1.5 text-sm text-red-600 font-['Inter']">{addressFieldErrors.billPostal}</p>
            ) : null}
          </label>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={deliveryDifferent}
              onChange={(e) => {
                const on = e.target.checked
                if (!on) setAddressFieldErrors((p) => {
                  const n = { ...p }
                  delete n.delAddress
                  delete n.delCounty
                  delete n.delCity
                  delete n.delPostal
                  return n
                })
                setDeliveryDifferent(on)
              }}
            />
            <span className="text-sm font-medium text-slate-800 font-['Inter']">Adresă de livrare diferită</span>
          </label>

          {deliveryDifferent ? (
            <div className="space-y-4 pl-1 border-l-2 border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 font-['Inter']">Livrare</h3>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800 font-['Inter']">Adresă livrare</span>
                <input
                  className={`${addressFieldErrors.delAddress ? inputClassError : inputClass} mt-1`}
                  value={delAddress}
                  placeholder="Ex.: Bd. Livrării nr. 20"
                  aria-invalid={Boolean(addressFieldErrors.delAddress)}
                  onChange={(e) => {
                    setAddressFieldErrors((p) => {
                      if (!p.delAddress) return p
                      const n = { ...p }
                      delete n.delAddress
                      return n
                    })
                    setDelAddress(sanitizeAddressField(e.target.value))
                  }}
                />
                {addressFieldErrors.delAddress ? (
                  <p className="mt-1.5 text-sm text-red-600 font-['Inter']">{addressFieldErrors.delAddress}</p>
                ) : null}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800 font-['Inter']">Județ</span>
                <select
                  className={`${addressFieldErrors.delCounty ? inputClassError : inputClass} mt-1`}
                  value={delCounty}
                  aria-invalid={Boolean(addressFieldErrors.delCounty)}
                  onChange={(e) => {
                    setAddressFieldErrors((p) => {
                      const n = { ...p }
                      delete n.delCounty
                      delete n.delCity
                      return n
                    })
                    setDelCounty(e.target.value)
                    setDelCity('')
                  }}
                >
                  <option value="">Alege județul</option>
                  {ROMANIAN_COUNTIES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
                {addressFieldErrors.delCounty ? (
                  <p className="mt-1.5 text-sm text-red-600 font-['Inter']">{addressFieldErrors.delCounty}</p>
                ) : null}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800 font-['Inter']">Localitate</span>
                <select
                  className={`${addressFieldErrors.delCity ? inputClassError : inputClass} mt-1`}
                  value={delCity}
                  aria-invalid={Boolean(addressFieldErrors.delCity)}
                  onChange={(e) => {
                    setAddressFieldErrors((p) => {
                      if (!p.delCity) return p
                      const n = { ...p }
                      delete n.delCity
                      return n
                    })
                    setDelCity(e.target.value)
                  }}
                >
                  <option value="">Alege localitatea</option>
                  {delCities.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
                {addressFieldErrors.delCity ? (
                  <p className="mt-1.5 text-sm text-red-600 font-['Inter']">{addressFieldErrors.delCity}</p>
                ) : null}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-800 font-['Inter']">Cod poștal</span>
                <input
                  className={`${addressFieldErrors.delPostal ? inputClassError : inputClass} mt-1`}
                  value={delPostal}
                  placeholder="Ex.: 020123"
                  aria-invalid={Boolean(addressFieldErrors.delPostal)}
                  onChange={(e) => {
                    setAddressFieldErrors((p) => {
                      if (!p.delPostal) return p
                      const n = { ...p }
                      delete n.delPostal
                      return n
                    })
                    setDelPostal(sanitizePostalField(e.target.value))
                  }}
                />
                {addressFieldErrors.delPostal ? (
                  <p className="mt-1.5 text-sm text-red-600 font-['Inter']">{addressFieldErrors.delPostal}</p>
                ) : null}
              </label>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={savingAddress}
              className="min-h-11 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 font-['Inter']"
            >
              {savingAddress ? 'Se salvează…' : 'Salvează adresa'}
            </button>
            {addressSaveMsg ? (
              <p className="text-sm font-medium text-green-700 font-['Inter']" role="status">
                {addressSaveMsg}
              </p>
            ) : null}
          </div>
          {addressSaveErr ? (
            <p className="text-sm text-red-600 font-['Inter']">{addressSaveErr}</p>
          ) : null}
        </form>
      </SettingsSection>

      <SettingsSection id="schimba-parola" title="Schimbă parola" Icon={KeyRound}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Parola curentă</span>
            <div className="mt-1">
              <PasswordInput
                value={curPwd}
                onChange={setCurPwd}
                autoComplete="current-password"
                placeholder="Parola cu care te autentifici acum"
                inputClassName={passwordFieldClassName}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Parola nouă</span>
            <div className="mt-1">
              <PasswordInput
                value={newPwd}
                onChange={setNewPwd}
                autoComplete="new-password"
                placeholder="Minimum 8 caractere"
                inputClassName={passwordFieldClassName}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Confirmă parola nouă</span>
            <div className="mt-1">
              <PasswordInput
                value={newPwd2}
                onChange={setNewPwd2}
                autoComplete="new-password"
                placeholder="Reintrodu parola nouă"
                inputClassName={passwordFieldClassName}
              />
            </div>
          </label>
          {pwdErr ? <p className="text-sm text-red-600 font-['Inter']">{pwdErr}</p> : null}
          {pwdMsg ? <p className="text-sm text-green-700 font-['Inter']">{pwdMsg}</p> : null}
          <button
            type="submit"
            disabled={pwdLoading}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-900 hover:bg-slate-50 disabled:opacity-60 font-['Inter']"
          >
            {pwdLoading ? '…' : 'Actualizează parola'}
          </button>
        </form>
      </SettingsSection>

      <SettingsSection id="schimba-email" title="Schimbă email" Icon={Mail}>
        <p className="text-sm text-slate-600 font-['Inter'] -mt-1">
          Pentru schimbarea emailului este necesar să introduci parola curentă.
        </p>
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Email nou</span>
            <input
              type="email"
              className={`${inputClass} mt-1`}
              value={newEmail}
              onChange={(e) => setNewEmail(sanitizeEmailTyping(e.target.value))}
              autoComplete="email"
              placeholder="adresa.ta.noua@exemplu.ro"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 font-['Inter']">Parola curentă (confirmare)</span>
            <div className="mt-1">
              <PasswordInput
                value={emailPwd}
                onChange={setEmailPwd}
                autoComplete="current-password"
                placeholder="Parola pentru a confirma schimbarea de email"
                inputClassName={passwordFieldClassName}
              />
            </div>
          </label>
          {emailErr ? <p className="text-sm text-red-600 font-['Inter']">{emailErr}</p> : null}
          {emailMsg ? <p className="text-sm text-green-700 font-['Inter']">{emailMsg}</p> : null}
          <button
            type="submit"
            disabled={emailLoading}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-900 hover:bg-slate-50 disabled:opacity-60 font-['Inter']"
          >
            {emailLoading ? '…' : 'Actualizează emailul'}
          </button>
        </form>
      </SettingsSection>

      <SettingsSection id="autentificare-doi-pasi" title="Autentificare în doi pași" Icon={Shield}>
        <p className="text-sm text-slate-600 font-['Inter'] -mt-1">
          Vom integra autentificarea cu două factori (2FA) folosind aplicații compatibile TOTP, cum ar fi{' '}
          <span className="font-semibold text-slate-800">Google Authenticator</span>, pentru a cere un cod suplimentar
          la conectare, pe lângă parolă.
        </p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-['Inter']">
          <p className="font-semibold text-slate-900">În lucru</p>
          <p className="mt-1">
            Activarea 2FA, legarea secretului cu QR / cod manual și gestionarea codurilor de recuperare vor fi
            disponibile aici după finalizarea integrării în backend.
          </p>
        </div>
      </SettingsSection>
        </div>
      </div>
    </div>
  )
}
