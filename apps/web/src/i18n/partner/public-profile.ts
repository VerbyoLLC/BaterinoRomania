import type { LangCode } from '../menu'

export type PartnerPublicProfileAdvantage = { title: string; subtitle: string }

export type PartnerPublicProfileTranslations = {
  pageTitle: string
  pageSubtitle: string
  profilePublic: string
  profilePrivate: string
  completeToPublishTitle: string
  publicToggleNotice: string
  publicToggleNoticeCannotPublishTitle: string
  completeProfileToPublishTooltip: string
  completionHeading: string
  /** Prefix before `PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT` (e.g. `Adresă /` + segment). */
  completionAddressPrefix: string
  completionPhoto: string
  completionName: string
  completionLocation: string
  completionDescription: string
  completionServices: string
  completionPhone: string
  completionWebsite: string
  completionSocial: string
  completionGallery: string
  sectionPublicHandle: string
  handleLabel: string
  handlePlaceholder: string
  saveHandle: string
  savingHandle: string
  handleHint: string
  handleTaken: string
  handleInvalid: string
  handleAvailableAria: string
  handleSaved: string
  publicPageLink: string
  openPublicPageTitle: string
  copyLinkAria: string
  copyLinkTitle: string
  copiedLinkTitle: string
  completeCompanyForSlug: string
  sectionLogo: string
  logoAlt: string
  changeImage: string
  uploadLogo: string
  delete: string
  logoFormatHint: string
  sectionIdentity: string
  publicNameLabel: string
  publicNamePlaceholder: string
  sectionLocation: string
  streetLabel: string
  streetPlaceholder: string
  countyLabel: string
  cityLabel: string
  selectPlaceholder: string
  postalLabel: string
  postalPlaceholder: string
  descriptionTitle: string
  descriptionPlaceholder: string
  sectionServices: string
  servicesHint: string
  sectionContact: string
  phoneLabel: string
  phonePlaceholder: string
  whatsappLabel: string
  websiteLabel: string
  websitePlaceholder: string
  sectionSocial: string
  socialHint: string
  facebookLabel: string
  facebookPlaceholder: string
  instagramLabel: string
  instagramPlaceholder: string
  linkedinLabel: string
  linkedinPlaceholder: string
  tiktokLabel: string
  tiktokPlaceholder: string
  galleryTitle: string
  galleryCountHint: string
  addPhoto: string
  uploadWorkPhotos: string
  uploadWorkPhotosHint: string
  deletePhotoAria: string
  workPhotoAlt: string
  saveProfile: string
  savingProfile: string
  saved: string
  previewHeading: string
  previewHint: string
  retry: string
  loadErrorFallback: string
  slugCheckErrorFallback: string
  slugSaveErrorFallback: string
  copyLinkError: string
  imageMax2Mb: string
  uploadErrorFallback: string
  deleteErrorFallback: string
  imageMax5Mb: string
  photoUploadErrorFallback: string
  updateErrorFallback: string
  postalInvalid: string
  missingFieldsPrefix: string
  fieldPublicName: string
  fieldStreet: string
  fieldCounty: string
  fieldCity: string
  fieldDescription: string
  fieldPhone: string
  fieldWebsite: string
  fieldSocial: string
  websiteInvalid: string
  saveSlugFirst: string
  saveErrorFallback: string
  preDiscountSectionTitle: string
  preDiscountSectionIntro: string
  preDiscountDedicatedPageTitle: string
  preDiscountHeroBodyPrefix: string
  preDiscountHeroBodyHighlight: string
  preDiscountHeroBodySuffix: string
  preDiscountUrlSlugExample: string
  preDiscountAdvantages: PartnerPublicProfileAdvantage[]
  preDiscountPreviewHint: string
  contractGateSubtitle: string
}

const ro: PartnerPublicProfileTranslations = {
  pageTitle: 'Profil Public',
  pageSubtitle: 'Îți promovăm afacerea clienților noștri.',
  profilePublic: 'Profil public',
  profilePrivate: 'Profil privat',
  completeToPublishTitle: 'Completează profilul la 100% pentru a-l face public',
  publicToggleNotice:
    'Pentru a face profilul public, completează mai întâi toate detaliile cerute. Verifică secțiunea „Completare profil” de mai jos.',
  publicToggleNoticeCannotPublishTitle: 'Profilul nu poate fi făcut public încă',
  completeProfileToPublishTooltip: 'Completează profilul la 100% pentru a-l face public',
  completionHeading: 'Completare profil',
  completionAddressPrefix: 'Adresă /',
  completionPhoto: 'Fotografie logo',
  completionName: 'Nume public',
  completionLocation: 'Locație',
  completionDescription: 'Descriere',
  completionServices: 'Servicii (min. 2)',
  completionPhone: 'Telefon',
  completionWebsite: 'Website',
  completionSocial: 'Rețele sociale',
  completionGallery: 'Galerie foto lucrări',
  sectionPublicHandle: 'Pagina ta publică (handle)',
  handleLabel: 'Handle (@numecompanii)',
  handlePlaceholder: 'din-denumirea-companiei',
  saveHandle: 'Salvează handle',
  savingHandle: 'Se salvează…',
  handleHint: 'Litere mici, cifre și cratimă — completat automat din denumirea companiei la înregistrare.',
  handleTaken: 'Această adresă este deja folosită de un alt instalator.',
  handleInvalid:
    'Adresa trebuie să aibă 2–72 caractere (litere mici, cifre, cratimă) și nu poate folosi cuvinte rezervate.',
  handleAvailableAria: 'Handle disponibil',
  handleSaved: 'Handle salvat!',
  publicPageLink: 'Link pagină publică',
  openPublicPageTitle: 'Deschide pagina publică într-o filă nouă',
  copyLinkAria: 'Copiază linkul paginii publice',
  copyLinkTitle: 'Copiază link',
  copiedLinkTitle: 'Copiat!',
  completeCompanyForSlug: 'Completează datele companiei pentru a genera adresa paginii tale publice.',
  sectionLogo: 'Fotografie / logo companie',
  logoAlt: 'Logo',
  changeImage: 'Schimbă imaginea',
  uploadLogo: 'Încarcă logo',
  delete: 'Șterge',
  logoFormatHint: 'JPG / PNG · max 2 MB',
  sectionIdentity: 'Identitate companie',
  publicNameLabel: 'Nume public afișat',
  publicNamePlaceholder: 'ex: Solar Pro SRL',
  sectionLocation: 'Locație',
  streetLabel: 'Stradă și număr',
  streetPlaceholder: 'ex: Str. Exemplu nr. 10',
  countyLabel: 'Județ',
  cityLabel: 'Oraș',
  selectPlaceholder: 'Selectează',
  postalLabel: 'Cod poștal',
  postalPlaceholder: '010001',
  descriptionTitle: 'Descriere',
  descriptionPlaceholder: 'Prezintă compania ta: experiență, echipă, zone de acoperire, valori…',
  sectionServices: 'Servicii oferite *',
  servicesHint: 'Selectează cel puțin {min} servicii.',
  sectionContact: 'Contact',
  phoneLabel: 'Telefon',
  phonePlaceholder: '+40 7XX XXX XXX',
  whatsappLabel: 'WhatsApp',
  websiteLabel: 'Website',
  websitePlaceholder: 'exemplu.ro',
  sectionSocial: 'Rețele sociale *',
  socialHint: 'Completează cel puțin o rețea socială (Facebook, LinkedIn, Instagram sau TikTok).',
  facebookLabel: 'Facebook',
  facebookPlaceholder: 'https://facebook.com/...',
  instagramLabel: 'Instagram',
  instagramPlaceholder: 'https://instagram.com/...',
  linkedinLabel: 'LinkedIn',
  linkedinPlaceholder: 'https://linkedin.com/company/...',
  tiktokLabel: 'TikTok',
  tiktokPlaceholder: 'https://tiktok.com/@...',
  galleryTitle: 'Galerie foto lucrări',
  galleryCountHint: '{count}/8 fotografii · max 5 MB/foto',
  addPhoto: 'Adaugă',
  uploadWorkPhotos: 'Încarcă fotografii cu lucrările tale',
  uploadWorkPhotosHint: 'JPG / PNG · până la 8 fotografii · max 5 MB/foto',
  deletePhotoAria: 'Șterge fotografie',
  workPhotoAlt: 'Lucrare {n}',
  saveProfile: 'Salvează profilul',
  savingProfile: 'Se salvează…',
  saved: 'Salvat!',
  previewHeading: 'Previzualizare — cum te văd clienții',
  previewHint: 'Previzualizarea se actualizează în timp real pe măsură ce completezi formularul.',
  retry: 'Reîncearcă',
  loadErrorFallback: 'Eroare la încărcarea profilului.',
  slugCheckErrorFallback: 'Eroare la verificarea adresei.',
  slugSaveErrorFallback: 'Eroare la salvarea adresei.',
  copyLinkError: 'Nu am putut copia linkul. Încearcă din nou.',
  imageMax2Mb: 'Imaginea trebuie să fie maxim 2 MB.',
  uploadErrorFallback: 'Eroare la încărcare.',
  deleteErrorFallback: 'Eroare la ștergere.',
  imageMax5Mb: 'Fiecare imagine trebuie să fie maxim 5 MB.',
  photoUploadErrorFallback: 'Eroare la încărcarea fotografiei.',
  updateErrorFallback: 'Eroare la actualizare.',
  postalInvalid: 'Codul poștal trebuie să aibă exact 6 cifre (sau lasă gol).',
  missingFieldsPrefix: 'Completează câmpurile obligatorii:',
  fieldPublicName: 'Nume public',
  fieldStreet: 'Stradă',
  fieldCounty: 'Județ',
  fieldCity: 'Oraș',
  fieldDescription: 'Descriere',
  fieldPhone: 'Telefon',
  fieldWebsite: 'Website',
  fieldSocial: 'Rețele sociale (cel puțin una)',
  websiteInvalid: 'Introdu un domeniu valid (ex: exemplu.ro).',
  saveSlugFirst: 'Salvează mai întâi handle-ul paginii publice sau revino la adresa salvată.',
  saveErrorFallback: 'Eroare la salvare.',
  preDiscountSectionTitle: 'Avantajele profilului tău public',
  preDiscountSectionIntro:
    'Ca partener Baterino, îți promovăm afacerea către clienții care caută instalatori fotovoltaici. După alocarea prețului de partener, vei putea completa și publica pagina dedicată companiei tale.',
  preDiscountDedicatedPageTitle: 'Pagină dedicată pe Baterino.ro',
  preDiscountHeroBodyPrefix: 'Îți creăm o pagină publică personalizată unde clienții văd ',
  preDiscountHeroBodyHighlight: 'serviciile, locația, galeria de lucrări și datele de contact',
  preDiscountHeroBodySuffix: ' — și te pot contacta direct.',
  preDiscountUrlSlugExample: 'nume-companie',
  preDiscountAdvantages: [
    {
      title: 'Vizibilitate în fața clienților',
      subtitle:
        'Apari în catalogul de instalatori Baterino și te conectăm cu proprietari din zona ta care caută parteneri verificați.',
    },
    {
      title: 'Promovare locală',
      subtitle:
        'Profilul evidențiază județul și orașul tău, astfel clienții din apropiere te găsesc mai ușor.',
    },
    {
      title: 'Insignă Partener Baterino',
      subtitle: 'Badge de încredere care confirmă parteneriatul tău oficial cu platforma.',
    },
    {
      title: 'Contact direct',
      subtitle: 'Telefon, WhatsApp și website afișate clar — clienții te contactează fără intermediari.',
    },
    {
      title: 'Galerie foto lucrări',
      subtitle: 'Prezinți proiectele realizate și construiești încredere înainte de primul apel.',
    },
    {
      title: 'Suport Baterino',
      subtitle:
        'Echipa noastră te sprijină cu produse, logistică și after-sales, ca tu să te concentrezi pe clienți.',
    },
  ],
  preDiscountPreviewHint: 'Previzualizare — așa va arăta pagina ta publică după ce completezi profilul.',
  contractGateSubtitle:
    'Semnează contractul de parteneriat pentru a-ți configura, salva și publica profilul tehnic al companiei.',
}

const en: PartnerPublicProfileTranslations = {
  ...ro,
  pageTitle: 'Public profile',
  pageSubtitle: 'We promote your business to our customers.',
  profilePublic: 'Public profile',
  profilePrivate: 'Private profile',
  completeToPublishTitle: 'Complete your profile to 100% to make it public',
  publicToggleNotice:
    'To make your profile public, complete all required details first. Check the “Profile completion” section below.',
  publicToggleNoticeCannotPublishTitle: 'Profile cannot be made public yet',
  completeProfileToPublishTooltip: 'Complete your profile to 100% to make it public',
  completionHeading: 'Profile completion',
  completionAddressPrefix: 'URL /',
  completionPhoto: 'Logo photo',
  completionName: 'Public name',
  completionLocation: 'Location',
  completionDescription: 'Description',
  completionServices: 'Services (min. 2)',
  completionPhone: 'Phone',
  completionWebsite: 'Website',
  completionSocial: 'Social networks',
  completionGallery: 'Work photo gallery',
  sectionPublicHandle: 'Your public page (handle)',
  handleLabel: 'Handle (@companyname)',
  handlePlaceholder: 'from-company-name',
  saveHandle: 'Save handle',
  savingHandle: 'Saving…',
  handleHint: 'Lowercase letters, numbers and hyphens — auto-filled from company name at registration.',
  handleTaken: 'This URL is already used by another installer.',
  handleInvalid:
    'URL must be 2–72 characters (lowercase, numbers, hyphen) and cannot use reserved words.',
  handleAvailableAria: 'Handle available',
  handleSaved: 'Handle saved!',
  publicPageLink: 'Public page link',
  openPublicPageTitle: 'Open public page in a new tab',
  copyLinkAria: 'Copy public page link',
  copyLinkTitle: 'Copy link',
  copiedLinkTitle: 'Copied!',
  completeCompanyForSlug: 'Complete company details to generate your public page URL.',
  sectionLogo: 'Company photo / logo',
  logoAlt: 'Logo',
  changeImage: 'Change image',
  uploadLogo: 'Upload logo',
  delete: 'Delete',
  logoFormatHint: 'JPG / PNG · max 2 MB',
  sectionIdentity: 'Company identity',
  publicNameLabel: 'Displayed public name',
  publicNamePlaceholder: 'e.g. Solar Pro SRL',
  sectionLocation: 'Location',
  streetLabel: 'Street and number',
  streetPlaceholder: 'e.g. 10 Example St',
  countyLabel: 'County',
  cityLabel: 'City',
  selectPlaceholder: 'Select',
  postalLabel: 'Postal code',
  postalPlaceholder: '010001',
  descriptionTitle: 'Description',
  descriptionPlaceholder: 'Introduce your company: experience, team, coverage areas, values…',
  sectionServices: 'Services offered *',
  servicesHint: 'Select at least {min} services.',
  sectionContact: 'Contact',
  phoneLabel: 'Phone',
  phonePlaceholder: '+40 7XX XXX XXX',
  whatsappLabel: 'WhatsApp',
  websiteLabel: 'Website',
  websitePlaceholder: 'example.com',
  sectionSocial: 'Social networks *',
  socialHint: 'Add at least one social network (Facebook, LinkedIn, Instagram or TikTok).',
  facebookLabel: 'Facebook',
  facebookPlaceholder: 'https://facebook.com/...',
  instagramLabel: 'Instagram',
  instagramPlaceholder: 'https://instagram.com/...',
  linkedinLabel: 'LinkedIn',
  linkedinPlaceholder: 'https://linkedin.com/company/...',
  tiktokLabel: 'TikTok',
  tiktokPlaceholder: 'https://tiktok.com/@...',
  galleryTitle: 'Work photo gallery',
  galleryCountHint: '{count}/8 photos · max 5 MB each',
  addPhoto: 'Add',
  uploadWorkPhotos: 'Upload photos of your work',
  uploadWorkPhotosHint: 'JPG / PNG · up to 8 photos · max 5 MB each',
  deletePhotoAria: 'Delete photo',
  workPhotoAlt: 'Work {n}',
  saveProfile: 'Save profile',
  savingProfile: 'Saving…',
  saved: 'Saved!',
  previewHeading: 'Preview — how customers see you',
  previewHint: 'Preview updates in real time as you fill in the form.',
  retry: 'Try again',
  loadErrorFallback: 'Failed to load profile.',
  slugCheckErrorFallback: 'Failed to verify URL.',
  slugSaveErrorFallback: 'Failed to save URL.',
  copyLinkError: 'Could not copy link. Try again.',
  imageMax2Mb: 'Image must be at most 2 MB.',
  uploadErrorFallback: 'Upload failed.',
  deleteErrorFallback: 'Delete failed.',
  imageMax5Mb: 'Each image must be at most 5 MB.',
  photoUploadErrorFallback: 'Failed to upload photo.',
  updateErrorFallback: 'Update failed.',
  postalInvalid: 'Postal code must be exactly 6 digits (or leave empty).',
  missingFieldsPrefix: 'Complete required fields:',
  fieldPublicName: 'Public name',
  fieldStreet: 'Street',
  fieldCounty: 'County',
  fieldCity: 'City',
  fieldDescription: 'Description',
  fieldPhone: 'Phone',
  fieldWebsite: 'Website',
  fieldSocial: 'Social networks (at least one)',
  websiteInvalid: 'Enter a valid domain (e.g. example.com).',
  saveSlugFirst: 'Save the public page handle first or revert to the saved URL.',
  saveErrorFallback: 'Save failed.',
  preDiscountSectionTitle: 'Your public profile benefits',
  preDiscountSectionIntro:
    'As a Baterino partner, we promote your business to customers looking for solar installers. After your partner price is allocated, you can complete and publish your dedicated company page.',
  preDiscountDedicatedPageTitle: 'Dedicated page on Baterino.ro',
  preDiscountHeroBodyPrefix: 'We create a personalized public page where customers see ',
  preDiscountHeroBodyHighlight: 'your services, location, work gallery and contact details',
  preDiscountHeroBodySuffix: ' — and reach you directly.',
  preDiscountUrlSlugExample: 'company-name',
  preDiscountAdvantages: [
    {
      title: 'Visibility to customers',
      subtitle:
        'Appear in the Baterino installer directory and connect with homeowners in your area looking for verified partners.',
    },
    {
      title: 'Local promotion',
      subtitle: 'Your county and city are highlighted so nearby customers find you more easily.',
    },
    {
      title: 'Baterino Partner badge',
      subtitle: 'A trust badge confirming your official partnership with the platform.',
    },
    {
      title: 'Direct contact',
      subtitle: 'Phone, WhatsApp and website displayed clearly — customers contact you without middlemen.',
    },
    {
      title: 'Work photo gallery',
      subtitle: 'Showcase completed projects and build trust before the first call.',
    },
    {
      title: 'Baterino support',
      subtitle: 'Our team helps with products, logistics and after-sales so you can focus on clients.',
    },
  ],
  preDiscountPreviewHint: 'Preview — this is how your public page will look once you complete the profile.',
  contractGateSubtitle:
    'Sign the partnership contract to configure, save and publish your company technical profile.',
}


const translations: Record<LangCode, PartnerPublicProfileTranslations> = { ro, en }

export function getPartnerPublicProfileTranslations(lang: LangCode): PartnerPublicProfileTranslations {
  return translations[lang] ?? translations.ro
}
