import type { LangCode } from '../menu'

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
}

const ro: PartnerPublicProfileTranslations = {
  pageTitle: 'Profil Public',
  pageSubtitle: 'Informațiile afișate clienților care caută instalatori pe Baterino.ro',
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
  websitePlaceholder: 'https://www.exemplu.ro',
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
  websiteInvalid: 'Introdu un website valid (ex: https://www.exemplu.ro sau exemplu.ro).',
  saveSlugFirst: 'Salvează mai întâi handle-ul paginii publice sau revino la adresa salvată.',
  saveErrorFallback: 'Eroare la salvare.',
}

const en: PartnerPublicProfileTranslations = {
  ...ro,
  pageTitle: 'Public profile',
  pageSubtitle: 'Information shown to customers looking for installers on Baterino.ro',
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
  websitePlaceholder: 'https://www.example.com',
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
  websiteInvalid: 'Enter a valid website (e.g. https://www.example.com or example.com).',
  saveSlugFirst: 'Save the public page handle first or revert to the saved URL.',
  saveErrorFallback: 'Save failed.',
}

const zh: PartnerPublicProfileTranslations = {
  ...ro,
  pageTitle: '公开主页',
  pageSubtitle: '展示给在 Baterino.ro 寻找安装商的客户的信息',
  profilePublic: '公开主页',
  profilePrivate: '非公开',
  completeToPublishTitle: '将资料完善至 100% 后可公开发布',
  publicToggleNotice: '要公开发布主页，请先完成所有必填项。请查看下方「资料完成度」。',
  publicToggleNoticeCannotPublishTitle: '主页尚无法公开发布',
  completeProfileToPublishTooltip: '将资料完善至 100% 后可公开发布',
  completionHeading: '资料完成度',
  completionAddressPrefix: '地址 /',
  completionPhoto: 'Logo 照片',
  completionName: '公开名称',
  completionLocation: '位置',
  completionDescription: '简介',
  completionServices: '服务（至少 2 项）',
  completionPhone: '电话',
  completionWebsite: '网站',
  completionSocial: '社交网络',
  completionGallery: '作品图库',
  sectionPublicHandle: '您的公开页面（句柄）',
  handleLabel: '句柄（@公司名）',
  handlePlaceholder: '公司名称拼音',
  saveHandle: '保存句柄',
  savingHandle: '正在保存…',
  handleHint: '小写字母、数字和连字符 — 注册时根据公司名称自动填充。',
  handleTaken: '该地址已被其他安装商使用。',
  handleInvalid: '地址须为 2–72 个字符（小写、数字、连字符），且不能使用保留词。',
  handleAvailableAria: '句柄可用',
  handleSaved: '句柄已保存！',
  publicPageLink: '公开页面链接',
  openPublicPageTitle: '在新标签页打开公开页面',
  copyLinkAria: '复制公开页面链接',
  copyLinkTitle: '复制链接',
  copiedLinkTitle: '已复制！',
  completeCompanyForSlug: '请完善公司信息以生成公开页面地址。',
  sectionLogo: '公司照片 / Logo',
  logoAlt: 'Logo',
  changeImage: '更换图片',
  uploadLogo: '上传 Logo',
  delete: '删除',
  logoFormatHint: 'JPG / PNG · 最大 2 MB',
  sectionIdentity: '公司信息',
  publicNameLabel: '对外显示名称',
  publicNamePlaceholder: '例如：Solar Pro SRL',
  sectionLocation: '位置',
  streetLabel: '街道与门牌号',
  streetPlaceholder: '例如：示例街 10 号',
  countyLabel: '县/区',
  cityLabel: '城市',
  selectPlaceholder: '请选择',
  postalLabel: '邮政编码',
  postalPlaceholder: '010001',
  descriptionTitle: '简介',
  descriptionPlaceholder: '介绍您的公司：经验、团队、服务区域、价值观…',
  sectionServices: '提供的服务 *',
  servicesHint: '请至少选择 {min} 项服务。',
  sectionContact: '联系方式',
  phoneLabel: '电话',
  phonePlaceholder: '+40 7XX XXX XXX',
  whatsappLabel: 'WhatsApp',
  websiteLabel: '网站',
  websitePlaceholder: 'https://www.example.com',
  sectionSocial: '社交网络 *',
  socialHint: '请至少填写一项（Facebook、LinkedIn、Instagram 或 TikTok）。',
  facebookLabel: 'Facebook',
  facebookPlaceholder: 'https://facebook.com/...',
  instagramLabel: 'Instagram',
  instagramPlaceholder: 'https://instagram.com/...',
  linkedinLabel: 'LinkedIn',
  linkedinPlaceholder: 'https://linkedin.com/company/...',
  tiktokLabel: 'TikTok',
  tiktokPlaceholder: 'https://tiktok.com/@...',
  galleryTitle: '作品图库',
  galleryCountHint: '{count}/8 张 · 每张最大 5 MB',
  addPhoto: '添加',
  uploadWorkPhotos: '上传作品照片',
  uploadWorkPhotosHint: 'JPG / PNG · 最多 8 张 · 每张最大 5 MB',
  deletePhotoAria: '删除照片',
  workPhotoAlt: '作品 {n}',
  saveProfile: '保存资料',
  savingProfile: '正在保存…',
  saved: '已保存！',
  previewHeading: '预览 — 客户看到的效果',
  previewHint: '填写表单时预览会实时更新。',
  retry: '重试',
  loadErrorFallback: '加载资料失败。',
  slugCheckErrorFallback: '验证地址失败。',
  slugSaveErrorFallback: '保存地址失败。',
  copyLinkError: '无法复制链接，请重试。',
  imageMax2Mb: '图片不得超过 2 MB。',
  uploadErrorFallback: '上传失败。',
  deleteErrorFallback: '删除失败。',
  imageMax5Mb: '每张图片不得超过 5 MB。',
  photoUploadErrorFallback: '上传照片失败。',
  updateErrorFallback: '更新失败。',
  postalInvalid: '邮政编码须为 6 位数字（或留空）。',
  missingFieldsPrefix: '请填写必填项：',
  fieldPublicName: '公开名称',
  fieldStreet: '街道',
  fieldCounty: '县/区',
  fieldCity: '城市',
  fieldDescription: '简介',
  fieldPhone: '电话',
  fieldWebsite: '网站',
  fieldSocial: '社交网络（至少一项）',
  websiteInvalid: '请输入有效网站（例如 https://www.example.com 或 example.com）。',
  saveSlugFirst: '请先保存公开页面句柄，或恢复已保存的地址。',
  saveErrorFallback: '保存失败。',
}

const translations: Record<LangCode, PartnerPublicProfileTranslations> = { ro, en, zh }

export function getPartnerPublicProfileTranslations(lang: LangCode): PartnerPublicProfileTranslations {
  return translations[lang] ?? translations.ro
}
