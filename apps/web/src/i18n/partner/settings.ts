import type { LangCode } from '../menu'

export type PartnerSettingsSectionKey =
  | 'personal'
  | 'company'
  | 'delivery'
  | 'documents'
  | 'password'
  | 'email'
  | 'notifications'
  | 'twoFactor'
  | 'delete'

export type PartnerSettingsTranslations = {
  pageTitle: string
  pageSubtitle: string
  pendingBanner: string
  navSectionsAria: string
  navPersonal: string
  navCompany: string
  navDelivery: string
  navDocuments: string
  navPassword: string
  navEmail: string
  navNotifications: string
  navTwoFactor: string
  navDelete: string
  personalTitle: string
  personalLoadingAria: string
  currentEmail: string
  emailReadonlyHint: string
  lastName: string
  lastNamePlaceholder: string
  firstName: string
  firstNamePlaceholder: string
  phone: string
  phonePlaceholder: string
  phoneHint: string
  personalErrorName: string
  personalErrorPhone: string
  personalSaved: string
  saveChanges: string
  saving: string
  companyTitle: string
  companyIntro: string
  companyFieldsLoading: string
  companyLoadingAria: string
  companyName: string
  companyNamePlaceholder: string
  cui: string
  cuiPlaceholder: string
  registeredOffice: string
  street: string
  streetPlaceholder: string
  county: string
  city: string
  selectCounty: string
  selectCity: string
  postalCode: string
  postalPlaceholder: string
  tradeRegister: string
  tradeRegisterPlaceholder: string
  companyProfile: string
  companyProfileHint: string
  channelInstaller: string
  channelDistributor: string
  channelHybrid: string
  companyErrorRequired: string
  companyErrorPostal: string
  companySaved: string
  deliveryTitle: string
  deliveryIntro: string
  deliveryLoadingAria: string
  copyFromRegisteredOffice: string
  deliveryStreetPlaceholder: string
  deliveryErrorRequired: string
  deliveryErrorPostal: string
  deliverySaved: string
  saveDeliveryAddress: string
  documentsTitle: string
  documentsIntro: string
  partnerContractTitle: string
  partnerContractDescription: string
  partnerContractSignedOn: string
  partnerContractPending: string
  partnerContractDownload: string
  partnerContractDownloading: string
  partnerContractDownloadError: string
  passwordTitle: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  passwordPlaceholder: string
  updatePassword: string
  passwordComingSoon: string
  emailTitle: string
  emailBody: string
  currentEmailLabel: string
  notificationsTitle: string
  notificationsIntro: string
  notificationsMarketingLabel: string
  notificationsMarketingDesc: string
  notificationsLoadingAria: string
  notificationsSaved: string
  notificationsLoadError: string
  notificationsSaveError: string
  twoFactorTitle: string
  twoFactorBody: string
  deleteTitle: string
  deleteIntro: string
  deleteAccount: string
  cancel: string
  confirmDeletion: string
  deleteModalTitle: string
  deleteModalBody: string
  deleteModalBullet1: string
  deleteModalBullet2: string
  deleteModalBullet3: string
  deleteModalBullet4: string
  deleteConfirmLabel: string
  deleting: string
  profileLoadError: string
  saveErrorFallback: string
  deleteErrorFallback: string
}

const ro: PartnerSettingsTranslations = {
  pageTitle: 'Setări',
  pageSubtitle: 'Gestionează datele contului, adresa de livrare și securitatea autentificării.',
  pendingBanner:
    'Contul tău nu este încă aprobat. Poți accesa Produse pentru alocarea prețului, Suport din meniu și poți șterge contul mai jos dacă renunți. Celelalte secțiuni vor fi disponibile după aprobarea finală.',
  navSectionsAria: 'Secțiuni setări',
  navPersonal: 'Date personale',
  navCompany: 'Date companie',
  navDelivery: 'Adresa de livrare',
  navDocuments: 'Documente',
  navPassword: 'Schimbă parola',
  navEmail: 'Schimbă email',
  navNotifications: 'Notificări',
  navTwoFactor: 'Autentificare în doi pași',
  navDelete: 'Șterge contul',
  personalTitle: 'Date personale',
  personalLoadingAria: 'Se încarcă',
  currentEmail: 'Email curent',
  emailReadonlyHint:
    'Emailul nu poate fi editat aici. Pentru schimbare folosește secțiunea „Schimbă email”.',
  lastName: 'Nume',
  lastNamePlaceholder: 'Popescu',
  firstName: 'Prenume',
  firstNamePlaceholder: 'Ion',
  phone: 'Telefon',
  phonePlaceholder: '7xx xxx xxx',
  phoneHint: 'Prefix +40 (fix); introdu exact 9 cifre.',
  personalErrorName: 'Completează numele și prenumele.',
  personalErrorPhone: 'Introdu exact 9 cifre pentru telefon (fără prefix +40 în câmp).',
  personalSaved: 'Modificările au fost salvate.',
  saveChanges: 'Salvează modificările',
  saving: 'Se salvează...',
  companyTitle: 'Date companie',
  companyIntro: 'Date legale și sediu social (vizibile pentru Echipa Baterino).',
  companyFieldsLoading: 'Se încarcă câmpurile…',
  companyLoadingAria: 'Se încarcă datele firmei',
  companyName: 'Denumire firmă',
  companyNamePlaceholder: 'S.C. Firma SRL',
  cui: 'CUI / CIF',
  cuiPlaceholder: 'RO12345678',
  registeredOffice: 'Adresă sediu social',
  street: 'Stradă și număr',
  streetPlaceholder: 'ex: Str. Exemplu nr 10',
  county: 'Județ',
  city: 'Oraș',
  selectCounty: 'Selectează',
  selectCity: 'Selectează orașul',
  postalCode: 'Cod poștal',
  postalPlaceholder: '010001',
  tradeRegister: 'Nr. Registrul Comerțului',
  tradeRegisterPlaceholder: 'J00/000/2020',
  companyProfile: 'Profil Companie',
  companyProfileHint:
    'Canalul comercial (Instalator sau Distribuitor) este setat la înregistrare. Pentru modificări, contactează echipa Baterino.',
  channelInstaller: 'Instalator',
  channelDistributor: 'Distribuitor',
  channelHybrid: 'Instalator + Distribuitor',
  companyErrorRequired: 'Completează denumirea și CUI.',
  companyErrorPostal: 'Codul poștal (sediu) trebuie să aibă exact 6 cifre.',
  companySaved: 'Datele firmei au fost salvate.',
  deliveryTitle: 'Adresa de livrare',
  deliveryIntro:
    'Magazin, depozit sau punct unde primiți livrările; este folosită la precompletarea checkout-ului. Golește toate câmpurile și salvează pentru a elimina adresa din sistem.',
  deliveryLoadingAria: 'Se încarcă adresa de livrare',
  copyFromRegisteredOffice: 'Copiază din sediu social',
  deliveryStreetPlaceholder: 'ex: Str. Depozit nr 5',
  deliveryErrorRequired:
    'Completează toate câmpurile pentru adresă livrare sau golește-le pentru a elimina adresa salvată.',
  deliveryErrorPostal: 'Codul poștal trebuie să aibă exact 6 cifre.',
  deliverySaved: 'Adresa de livrare a fost salvată.',
  saveDeliveryAddress: 'Salvează adresa de livrare',
  documentsTitle: 'Documente',
  documentsIntro: 'Contractele semnate digital cu Baterino sunt disponibile aici pentru descărcare.',
  partnerContractTitle: 'Contract partener Baterino',
  partnerContractDescription:
    'PDF generat automat când semnezi digital contractul de parteneriat din panoul partener.',
  partnerContractSignedOn: 'Semnat digital la {date}',
  partnerContractPending:
    'Disponibil după semnarea digitală a contractului de partener (pasul „Semnare contract” din dashboard).',
  partnerContractDownload: 'Descarcă PDF',
  partnerContractDownloading: 'Se descarcă…',
  partnerContractDownloadError: 'Nu am putut descărca contractul. Încearcă din nou.',
  passwordTitle: 'Schimbă parola',
  currentPassword: 'Parola actuală',
  newPassword: 'Parola nouă',
  confirmPassword: 'Confirmă parola nouă',
  passwordPlaceholder: '••••••••',
  updatePassword: 'Actualizează parola',
  passwordComingSoon:
    'Funcția va fi disponibilă după conectarea la sistemul de conturi. Până atunci folosește recuperarea parolei de pe pagina de autentificare dacă e nevoie.',
  emailTitle: 'Schimbă email',
  emailBody:
    'Pentru schimbarea adresei de email folosite la autentificare, te rugăm să contactezi echipa Baterino prin secțiunea Suport din meniul principal. Vom valida identitatea și îți vom actualiza contul în siguranță.',
  currentEmailLabel: 'Email curent:',
  notificationsTitle: 'Notificări',
  notificationsIntro: 'Alege ce tipuri de emailuri dorești să primești de la Baterino.',
  notificationsMarketingLabel: 'Comunicări comerciale',
  notificationsMarketingDesc: 'Oferte, noutăți și promoții trimise pe adresa de email a contului.',
  notificationsLoadingAria: 'Se încarcă preferințele…',
  notificationsSaved: 'Preferințele au fost salvate.',
  notificationsLoadError: 'Nu am putut încărca preferințele de notificare.',
  notificationsSaveError: 'Nu am putut salva preferințele. Încearcă din nou.',
  twoFactorTitle: 'Autentificare în doi pași',
  twoFactorBody:
    'Funcționalitatea de autentificare în doi pași (2FA) pentru conturile partener va fi disponibilă în curând.',
  deleteTitle: 'Șterge contul',
  deleteIntro:
    'Contul se dezactivează imediat. Datele personale sunt șterse definitiv după 30 de zile (comenzile rămân anonimizate).',
  deleteAccount: 'Șterge contul',
  cancel: 'Anulează',
  confirmDeletion: 'Confirmă ștergerea',
  deleteModalTitle: 'Ștergere cont',
  deleteModalBody:
    'Contul se dezactivează imediat. După 30 de zile, datele personale sunt șterse definitiv.',
  deleteModalBullet1: 'Imediat: nu te mai poți autentifica; profilul public dispare',
  deleteModalBullet2: 'După 30 zile: date personale, logo/galerie și certificate de garanție generate sunt eliminate',
  deleteModalBullet3: 'Cererile de service și datele personale din retururi asociate contului sunt anonimizate',
  deleteModalBullet4: 'Comenzile rămân pentru obligații fiscale; numele și emailul devin [deleted user]',
  deleteConfirmLabel: 'Introdu DELETE pentru a confirma',
  deleting: 'Se șterge...',
  profileLoadError: 'Nu am putut încărca profilul.',
  saveErrorFallback: 'Eroare la salvare.',
  deleteErrorFallback: 'Eroare la ștergerea contului.',
}

const en: PartnerSettingsTranslations = {
  ...ro,
  pageTitle: 'Settings',
  pageSubtitle: 'Manage account details, delivery address and sign-in security.',
  pendingBanner:
    'Your account is not approved yet. You can open Products for price allocation, use Support from the menu, and delete your account below if you withdraw. Other sections will be available after final approval.',
  navSectionsAria: 'Settings sections',
  navPersonal: 'Personal details',
  navCompany: 'Company details',
  navDelivery: 'Delivery address',
  navDocuments: 'Documents',
  navPassword: 'Change password',
  navEmail: 'Change email',
  navNotifications: 'Notifications',
  navTwoFactor: 'Two-factor authentication',
  navDelete: 'Delete account',
  personalTitle: 'Personal details',
  personalLoadingAria: 'Loading',
  currentEmail: 'Current email',
  emailReadonlyHint: 'Email cannot be edited here. Use the “Change email” section to update it.',
  lastName: 'Last name',
  lastNamePlaceholder: 'Smith',
  firstName: 'First name',
  firstNamePlaceholder: 'John',
  phone: 'Phone',
  phonePlaceholder: '7xx xxx xxx',
  phoneHint: 'Prefix +40 is fixed; enter exactly 9 digits.',
  personalErrorName: 'Enter first and last name.',
  personalErrorPhone: 'Enter exactly 9 digits for phone (without +40 in the field).',
  personalSaved: 'Changes saved.',
  saveChanges: 'Save changes',
  saving: 'Saving...',
  companyTitle: 'Company details',
  companyIntro: 'Legal data and registered office (visible to the Baterino team).',
  companyFieldsLoading: 'Loading fields…',
  companyLoadingAria: 'Loading company data',
  companyName: 'Company name',
  companyNamePlaceholder: 'Example SRL',
  cui: 'Tax ID (CUI/CIF)',
  cuiPlaceholder: 'RO12345678',
  registeredOffice: 'Registered office address',
  street: 'Street and number',
  streetPlaceholder: 'e.g. 10 Example St',
  county: 'County',
  city: 'City',
  selectCounty: 'Select',
  selectCity: 'Select city',
  postalCode: 'Postal code',
  postalPlaceholder: '010001',
  tradeRegister: 'Trade register no.',
  tradeRegisterPlaceholder: 'J00/000/2020',
  companyProfile: 'Company profile',
  companyProfileHint:
    'Your commercial channel (Installer or Distributor) was set at registration. Contact the Baterino team to change it.',
  channelInstaller: 'Installer',
  channelDistributor: 'Distributor',
  channelHybrid: 'Installer + Distributor',
  companyErrorRequired: 'Enter company name and tax ID.',
  companyErrorPostal: 'Registered office postal code must be exactly 6 digits.',
  companySaved: 'Company details saved.',
  deliveryTitle: 'Delivery address',
  deliveryIntro:
    'Shop, warehouse or delivery point; used to pre-fill checkout. Clear all fields and save to remove the saved address.',
  deliveryLoadingAria: 'Loading delivery address',
  copyFromRegisteredOffice: 'Copy from registered office',
  deliveryStreetPlaceholder: 'e.g. 5 Warehouse St',
  deliveryErrorRequired: 'Complete all delivery fields or clear them to remove the saved address.',
  deliveryErrorPostal: 'Postal code must be exactly 6 digits.',
  deliverySaved: 'Delivery address saved.',
  saveDeliveryAddress: 'Save delivery address',
  documentsTitle: 'Documents',
  documentsIntro: 'Contracts digitally signed with Baterino are available here for download.',
  partnerContractTitle: 'Baterino partner contract',
  partnerContractDescription:
    'PDF automatically generated when you digitally sign the partnership contract from the partner dashboard.',
  partnerContractSignedOn: 'Digitally signed on {date}',
  partnerContractPending:
    'Available after you digitally sign the partner contract (the “Contract signing” step on the dashboard).',
  partnerContractDownload: 'Download PDF',
  partnerContractDownloading: 'Downloading…',
  partnerContractDownloadError: 'Could not download the contract. Please try again.',
  passwordTitle: 'Change password',
  currentPassword: 'Current password',
  newPassword: 'New password',
  confirmPassword: 'Confirm new password',
  passwordPlaceholder: '••••••••',
  updatePassword: 'Update password',
  passwordComingSoon:
    'This feature will be available after account system integration. Use password recovery on the login page if needed.',
  emailTitle: 'Change email',
  emailBody:
    'To change your sign-in email, contact the Baterino team via Support in the main menu. We will verify your identity and update your account securely.',
  currentEmailLabel: 'Current email:',
  notificationsTitle: 'Notifications',
  notificationsIntro: 'Choose which types of emails you want to receive from Baterino.',
  notificationsMarketingLabel: 'Marketing emails',
  notificationsMarketingDesc: 'Offers, news and promotions sent to your account email address.',
  notificationsLoadingAria: 'Loading preferences…',
  notificationsSaved: 'Preferences saved.',
  notificationsLoadError: 'Could not load notification preferences.',
  notificationsSaveError: 'Could not save preferences. Please try again.',
  twoFactorTitle: 'Two-factor authentication',
  twoFactorBody: 'Two-factor authentication (2FA) for partner accounts will be available soon.',
  deleteTitle: 'Delete account',
  deleteIntro:
    'Your account is deactivated immediately. Personal data is permanently erased after 30 days (orders are anonymized).',
  deleteAccount: 'Delete account',
  cancel: 'Cancel',
  confirmDeletion: 'Confirm deletion',
  deleteModalTitle: 'Delete account',
  deleteModalBody:
    'Your account is deactivated immediately. Personal data is permanently erased after 30 days.',
  deleteModalBullet1: 'Immediately: you cannot sign in; your public profile is hidden',
  deleteModalBullet2: 'After 30 days: personal data, logo/gallery, and generated warranty certificates are removed',
  deleteModalBullet3: 'Service requests and personal data on linked return requests are anonymized',
  deleteModalBullet4: 'Orders remain for tax law; name and email become [deleted user]',
  deleteConfirmLabel: 'Type DELETE to confirm',
  deleting: 'Deleting...',
  profileLoadError: 'Could not load profile.',
  saveErrorFallback: 'Save failed.',
  deleteErrorFallback: 'Failed to delete account.',
}


const translations: Record<LangCode, PartnerSettingsTranslations> = { ro, en }

export function getPartnerSettingsTranslations(lang: LangCode): PartnerSettingsTranslations {
  return translations[lang] ?? translations.ro
}

export function getPartnerChannelProfileLabel(
  lang: LangCode,
  profile: { partnerChannelType?: string | null; activityTypes?: string | string[] | null },
): string {
  const tr = getPartnerSettingsTranslations(lang)
  const ch = String(profile.partnerChannelType ?? '').trim().toLowerCase()
  if (ch === 'distributor') return tr.channelDistributor
  if (ch === 'hybrid') return tr.channelHybrid
  if (ch === 'installer') return tr.channelInstaller
  const parts = (Array.isArray(profile.activityTypes)
    ? profile.activityTypes
    : String(profile.activityTypes ?? '').split(',')
  )
    .map((s) => String(s).trim().toLowerCase())
    .filter(Boolean)
  if (parts.includes('distribuitor') && parts.includes('instalator')) return tr.channelHybrid
  if (parts.includes('distribuitor')) return tr.channelDistributor
  if (parts.includes('instalator')) return tr.channelInstaller
  return '—'
}
