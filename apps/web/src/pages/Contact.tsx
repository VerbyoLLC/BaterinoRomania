import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getContactTranslations } from '../i18n/contact'
import SEO from '../components/SEO'

const COMPANY_LEGAL_NAME = 'Baterino Energy SRL'
const CONTACT_PHONE = '+40770106374'
const CONTACT_EMAIL = 'suport@baterino.ro'
const CONTACT_WHATSAPP = '40770106374'
const CONTACT_HOURS = 'Luni - Vineri | 8AM - 8PM'

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-5 h-5 text-slate-600'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-8 h-8 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

type ContactTab = 'whatsapp' | 'phone' | 'mail'

export default function Contact() {
  const { language } = useLanguage()
  const tr = getContactTranslations(language.code)
  const [activeTab, setActiveTab] = useState<ContactTab>('whatsapp')

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/contact"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-16 lg:pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-12 lg:gap-20 items-start">
          {/* Header - mobile: 1st, desktop: left col row 1 */}
          <header className="order-1 lg:row-start-1 lg:col-start-1 flex flex-col items-center lg:items-stretch text-center lg:text-left">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">
              {tr.subtitle}
            </p>
            <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold font-['Inter'] leading-tight tracking-tight">
              {tr.heroTitle}
            </h1>
            <p className="text-slate-600 text-base font-medium font-['Inter'] leading-6 mt-4 max-w-xl mx-auto lg:mx-0">
              {tr.heroDesc}
            </p>
          </header>

          {/* Contact modalities - mobile: 2nd (above address cards), desktop: right col */}
          <div className="order-2 lg:row-start-1 lg:row-span-2 lg:col-start-2 flex flex-col gap-6 pt-0 lg:pt-12 items-center lg:items-stretch text-center lg:text-left w-full">
            <h2 className="text-black text-xl sm:text-2xl font-extrabold font-['Inter'] leading-tight -mb-2 w-full">
              {tr.chooseMethodLabel}
            </h2>

            {/* Contact method tabs */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`w-full min-h-[7rem] rounded-[10px] flex flex-col items-center justify-center gap-2 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${activeTab === 'whatsapp' ? 'bg-neutral-200 shadow-sm' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                aria-label="WhatsApp"
                aria-pressed={activeTab === 'whatsapp'}
              >
                <WhatsAppIcon />
                <span className="text-slate-600 text-xs font-['Inter'] text-center leading-tight">{tr.responseTime}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('phone')}
                className={`w-full min-h-[7rem] rounded-[10px] flex flex-col items-center justify-center gap-2 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${activeTab === 'phone' ? 'bg-neutral-200 shadow-sm' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                aria-label="Phone"
                aria-pressed={activeTab === 'phone'}
              >
                <PhoneIcon />
                <span className="text-slate-600 text-xs font-['Inter'] text-center leading-tight">{tr.callResponseTime}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mail')}
                className={`w-full min-h-[7rem] rounded-[10px] flex flex-col items-center justify-center gap-2 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${activeTab === 'mail' ? 'bg-neutral-200 shadow-sm' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                aria-label="Email"
                aria-pressed={activeTab === 'mail'}
              >
                <EmailIcon />
                <span className="text-slate-600 text-xs font-['Inter'] text-center leading-tight">{tr.mailResponseTime}</span>
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'whatsapp' && (
              <a
                href={`https://wa.me/${CONTACT_WHATSAPP}`}
                className="w-full flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 p-8 min-h-[8rem] bg-neutral-100 rounded-[10px] hover:bg-neutral-200 hover:shadow-sm transition-all group focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 text-white group-hover:bg-slate-800 transition-colors [&_svg]:w-5 [&_svg]:h-5">
                    <ChevronRightIcon />
                  </div>
                  <div className="min-w-0 w-full sm:w-auto text-center sm:text-left">
                    <div className="text-black text-xl font-semibold font-['Inter'] leading-6">
                      {tr.chatWhatsappLabel}
                    </div>
                    <div className="text-black text-base font-normal font-['Inter'] leading-6">
                      {CONTACT_HOURS}
                    </div>
                  </div>
                </div>
                <span className="flex-shrink-0 h-12 px-6 bg-slate-900 text-white rounded-[10px] inline-flex items-center justify-center text-sm font-bold uppercase tracking-wide group-hover:bg-slate-800 transition-colors">
                  {tr.chatBtn}
                </span>
              </a>
            )}

            {activeTab === 'phone' && (
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="w-full flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 p-8 min-h-[8rem] bg-neutral-100 rounded-[10px] hover:bg-neutral-200 hover:shadow-sm transition-all group focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 text-white group-hover:bg-slate-800 transition-colors [&_svg]:w-5 [&_svg]:h-5">
                    <ChevronRightIcon />
                  </div>
                  <div className="min-w-0 w-full sm:w-auto text-center sm:text-left">
                    <div className="text-black text-xl font-semibold font-['Inter'] leading-6">
                      {tr.callUsLabel}
                    </div>
                    <div className="text-black text-base font-normal font-['Inter'] leading-6">
                      {CONTACT_HOURS}
                    </div>
                  </div>
                </div>
                <span className="flex-shrink-0 h-12 px-6 bg-slate-900 text-white rounded-[10px] inline-flex items-center justify-center text-sm font-bold uppercase tracking-wide group-hover:bg-slate-800 transition-colors">
                  {tr.viewNumberBtn}
                </span>
              </a>
            )}

            {activeTab === 'mail' && (
              <form className="w-full p-4 sm:p-8 min-h-[8rem] bg-neutral-100 rounded-[10px] space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1 font-['Inter']">{tr.formName}</label>
                    <input type="text" required className="w-full h-11 px-4 rounded-[10px] border border-neutral-200 bg-white text-slate-800 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder={tr.formName} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1 font-['Inter']">{tr.formCompany}</label>
                    <input type="text" required className="w-full h-11 px-4 rounded-[10px] border border-neutral-200 bg-white text-slate-800 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder={tr.formCompany} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1 font-['Inter']">{tr.formEmail}</label>
                  <input type="email" required className="w-full h-11 px-4 rounded-[10px] border border-neutral-200 bg-white text-slate-800 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder={tr.formEmail} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1 font-['Inter']">{tr.formDomain}</label>
                    <select required className="w-full h-11 pl-4 pr-12 rounded-[10px] border border-neutral-200 bg-white text-slate-800 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none bg-no-repeat bg-[length:12px] bg-[right_20px_center]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L2 4h8z'/%3E%3C/svg%3E\")" }}>
                      <option value="">{tr.formDomainPlaceholder}</option>
                      <option value="rezidential">{tr.domainRezidential}</option>
                      <option value="industrial">{tr.domainIndustrial}</option>
                      <option value="medical">{tr.domainMedical}</option>
                      <option value="maritim">{tr.domainMaritim}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1 font-['Inter']">{tr.formRequestType}</label>
                    <select required className="w-full h-11 pl-4 pr-12 rounded-[10px] border border-neutral-200 bg-white text-slate-800 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none bg-no-repeat bg-[length:12px] bg-[right_20px_center]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L2 4h8z'/%3E%3C/svg%3E\")" }}>
                      <option value="">{tr.formRequestType}</option>
                      <option value="sales">{tr.requestSales}</option>
                      <option value="technical">{tr.requestTechnical}</option>
                      <option value="service">{tr.requestService}</option>
                      <option value="partnership">{tr.requestPartnership}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1 font-['Inter']">{tr.formMessage}</label>
                  <textarea rows={4} required className="w-full min-h-[10rem] sm:min-h-[6rem] px-4 py-3 rounded-[10px] border border-neutral-200 bg-white text-slate-800 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-300 resize-y overflow-hidden sm:overflow-auto" placeholder={tr.formMessage} />
                </div>
                <button type="submit" className="h-12 px-6 bg-slate-900 text-white rounded-[10px] text-sm font-bold font-['Inter'] uppercase hover:bg-slate-800 transition-colors w-full sm:w-auto">
                  {tr.formSubmit}
                </button>
              </form>
            )}
          </div>

          {/* Address cards - mobile: 3rd (below modalities), desktop: left col row 2 */}
          <div className="order-3 lg:row-start-2 lg:col-start-1 flex flex-col gap-10 items-center lg:items-stretch text-center lg:text-left">
            <div className="grid sm:grid-cols-2 gap-4 w-full max-w-xl lg:max-w-none">
            {/* Baterino Romania / Address */}
            <div className="p-4 bg-neutral-50 rounded-[10px] border border-neutral-100">
              <div className="flex flex-col gap-0 text-center lg:text-left">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 [&_svg]:text-white mx-auto lg:mx-0 lg:self-start">
                  <LocationIcon />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold font-['Inter'] text-base mb-2">Baterino Romania</h3>
                  <p className="text-slate-600 text-sm font-['Inter'] leading-5">{COMPANY_LEGAL_NAME}</p>
                  <p className="text-slate-600 text-sm font-['Inter'] leading-5">Strada 23 August, 244-43A</p>
                  <p className="text-slate-600 text-sm font-['Inter'] leading-5">Otopeni, 077010</p>
                </div>
              </div>
            </div>

            {/* Contact direct */}
            <div className="p-4 bg-neutral-50 rounded-[10px] border border-neutral-100">
              <div className="flex flex-col gap-0 text-center lg:text-left">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 [&_svg]:text-white mx-auto lg:mx-0 lg:self-start">
                  <PhoneIcon />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold font-['Inter'] text-base mb-2">{tr.contactDirectLabel}</h3>
                  <p className="text-slate-600 text-sm font-['Inter'] leading-5">
                    Tel: <a href={`tel:${CONTACT_PHONE}`} className="text-slate-900 hover:underline font-medium">{CONTACT_PHONE}</a>
                  </p>
                  <p className="text-slate-600 text-sm font-['Inter'] leading-5">
                    Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-900 hover:underline font-medium break-all">{CONTACT_EMAIL}</a>
                  </p>
                  <p className="text-slate-500 text-sm font-['Inter'] leading-5 mt-1">{CONTACT_HOURS}</p>
                </div>
              </div>
            </div>
          </div>
          </div>

        </div>

        {/* Company & partners section - bottom */}
        <section className="w-full max-w-[1200px] mx-auto mt-8 lg:mt-12 pt-10 pb-5 border-t border-neutral-200 text-center lg:text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <a href="https://baterino.com" target="_blank" rel="noopener noreferrer" className="group">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all duration-200 self-center">
                  <ChevronRightIcon />
                </div>
                <h3 className="text-black text-xl font-semibold font-['Inter'] leading-6 m-0 self-center">{tr.baterinoGlobalLabel}</h3>
              </div>
              <p className="text-black text-base font-normal font-['Inter'] leading-6 pl-0 lg:pl-8">{tr.accessLabel}: baterino.com</p>
            </a>
            <a href="https://www.ltc-energy.com/" target="_blank" rel="noopener noreferrer" className="group">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all duration-200 self-center">
                  <ChevronRightIcon />
                </div>
                <h3 className="text-black text-xl font-semibold font-['Inter'] leading-6 m-0 self-center">{tr.lithtechLabel}</h3>
              </div>
              <p className="text-black text-base font-normal font-['Inter'] leading-6 pl-0 lg:pl-8">{tr.accessLabel}: ltc-energy.com</p>
            </a>
            <Link to="/login?tab=partener" className="group block">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all duration-200 self-center">
                  <ChevronRightIcon />
                </div>
                <h3 className="text-black text-xl font-semibold font-['Inter'] leading-6 m-0 self-center">{tr.distribuitorsLabel}</h3>
              </div>
              <p className="text-black text-base font-normal font-['Inter'] leading-6 pl-0 lg:pl-8">
                {tr.distribuitorsDesc}{' '}
                <span className="font-semibold group-hover:underline">{tr.intraInCont}</span>
              </p>
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
