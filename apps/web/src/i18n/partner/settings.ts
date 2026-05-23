import type { LangCode } from '../menu'

export type PartnerSettingsActivityId = 'instalator' | 'distribuitor' | 'integrator' | 'altul'

export type PartnerSettingsSectionKey =
  | 'personal'
  | 'company'
  | 'delivery'
  | 'password'
  | 'email'
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
  navPassword: string
  navEmail: string
  navTwoFactor: string
  navDelete: string
  activityInstalator: string
  activityDistribuitor: string
  activityIntegrator: string
  activityAltul: string
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
  activityType: string
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
    'Contul tău este în curs de verificare. Poți folosi Suport din meniu și poți șterge contul mai jos dacă renunți. Celelalte secțiuni vor fi disponibile după aprobare.',
  navSectionsAria: 'Secțiuni setări',
  navPersonal: 'Date personale',
  navCompany: 'Date companie',
  navDelivery: 'Adresa de livrare',
  navPassword: 'Schimbă parola',
  navEmail: 'Schimbă email',
  navTwoFactor: 'Autentificare în doi pași',
  navDelete: 'Șterge contul',
  activityInstalator: 'Instalator',
  activityDistribuitor: 'Distribuitor',
  activityIntegrator: 'Integrator sisteme',
  activityAltul: 'Altul',
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
  activityType: 'Tip activitate',
  companyErrorRequired: 'Completează denumirea, CUI și cel puțin un tip de activitate.',
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
  twoFactorTitle: 'Autentificare în doi pași',
  twoFactorBody:
    'Funcționalitatea de autentificare în doi pași (2FA) pentru conturile partener va fi disponibilă în curând.',
  deleteTitle: 'Șterge contul',
  deleteIntro: 'Odată ce ștergi contul, nu există cale de întoarcere. Toate datele vor fi eliminate permanent.',
  deleteAccount: 'Șterge contul',
  cancel: 'Anulează',
  confirmDeletion: 'Confirmă ștergerea',
  deleteModalTitle: 'Ștergere cont',
  deleteModalBody: 'Ești pe cale să ștergi contul. Această acțiune este permanentă și nu poate fi anulată.',
  deleteModalBullet1: 'Toate datele personale vor fi șterse permanent',
  deleteModalBullet2: 'Nu vei mai primi niciun fel de corespondență din partea noastră',
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
    'Your account is under review. You can use Support from the menu and delete your account below if you withdraw. Other sections will be available after approval.',
  navSectionsAria: 'Settings sections',
  navPersonal: 'Personal details',
  navCompany: 'Company details',
  navDelivery: 'Delivery address',
  navPassword: 'Change password',
  navEmail: 'Change email',
  navTwoFactor: 'Two-factor authentication',
  navDelete: 'Delete account',
  activityInstalator: 'Installer',
  activityDistribuitor: 'Distributor',
  activityIntegrator: 'Systems integrator',
  activityAltul: 'Other',
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
  activityType: 'Activity type',
  companyErrorRequired: 'Enter company name, tax ID and at least one activity type.',
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
  twoFactorTitle: 'Two-factor authentication',
  twoFactorBody: 'Two-factor authentication (2FA) for partner accounts will be available soon.',
  deleteTitle: 'Delete account',
  deleteIntro: 'Once you delete your account, there is no going back. All data will be permanently removed.',
  deleteAccount: 'Delete account',
  cancel: 'Cancel',
  confirmDeletion: 'Confirm deletion',
  deleteModalTitle: 'Delete account',
  deleteModalBody: 'You are about to delete your account. This action is permanent and cannot be undone.',
  deleteModalBullet1: 'All personal data will be permanently deleted',
  deleteModalBullet2: 'You will no longer receive any correspondence from us',
  deleteConfirmLabel: 'Type DELETE to confirm',
  deleting: 'Deleting...',
  profileLoadError: 'Could not load profile.',
  saveErrorFallback: 'Save failed.',
  deleteErrorFallback: 'Failed to delete account.',
}

const zh: PartnerSettingsTranslations = {
  ...ro,
  pageTitle: '设置',
  pageSubtitle: '管理账户信息、收货地址与登录安全。',
  pendingBanner:
    '您的账户正在审核中。可使用菜单中的「支持」，也可在下方删除账户。其他板块将在审批通过后开放。',
  navSectionsAria: '设置板块',
  navPersonal: '个人信息',
  navCompany: '公司信息',
  navDelivery: '收货地址',
  navPassword: '修改密码',
  navEmail: '修改邮箱',
  navTwoFactor: '两步验证',
  navDelete: '删除账户',
  activityInstalator: '安装商',
  activityDistribuitor: '经销商',
  activityIntegrator: '系统集成商',
  activityAltul: '其他',
  personalTitle: '个人信息',
  personalLoadingAria: '正在加载',
  currentEmail: '当前邮箱',
  emailReadonlyHint: '无法在此修改邮箱，请使用「修改邮箱」板块。',
  lastName: '姓',
  lastNamePlaceholder: '张',
  firstName: '名',
  firstNamePlaceholder: '三',
  phone: '电话',
  phonePlaceholder: '7xx xxx xxx',
  phoneHint: '固定前缀 +40；请输入 9 位数字。',
  personalErrorName: '请填写姓和名。',
  personalErrorPhone: '电话须为 9 位数字（字段内勿含 +40）。',
  personalSaved: '修改已保存。',
  saveChanges: '保存修改',
  saving: '正在保存...',
  companyTitle: '公司信息',
  companyIntro: '法律信息及注册地址（对 Baterino 团队可见）。',
  companyFieldsLoading: '正在加载字段…',
  companyLoadingAria: '正在加载公司数据',
  companyName: '公司名称',
  companyNamePlaceholder: '示例有限公司',
  cui: '税号 (CUI/CIF)',
  cuiPlaceholder: 'RO12345678',
  registeredOffice: '注册地址',
  street: '街道与门牌号',
  streetPlaceholder: '例如：示例街 10 号',
  county: '县/区',
  city: '城市',
  selectCounty: '请选择',
  selectCity: '请选择城市',
  postalCode: '邮政编码',
  postalPlaceholder: '010001',
  tradeRegister: '商业登记号',
  tradeRegisterPlaceholder: 'J00/000/2020',
  activityType: '业务类型',
  companyErrorRequired: '请填写公司名称、税号并至少选择一种业务类型。',
  companyErrorPostal: '注册地址邮政编码须为 6 位数字。',
  companySaved: '公司信息已保存。',
  deliveryTitle: '收货地址',
  deliveryIntro: '门店、仓库或收货点；用于预填结账。清空所有字段并保存可删除已存地址。',
  deliveryLoadingAria: '正在加载收货地址',
  copyFromRegisteredOffice: '从注册地址复制',
  deliveryStreetPlaceholder: '例如：仓库街 5 号',
  deliveryErrorRequired: '请填写全部收货字段，或清空以删除已存地址。',
  deliveryErrorPostal: '邮政编码须为 6 位数字。',
  deliverySaved: '收货地址已保存。',
  saveDeliveryAddress: '保存收货地址',
  passwordTitle: '修改密码',
  currentPassword: '当前密码',
  newPassword: '新密码',
  confirmPassword: '确认新密码',
  passwordPlaceholder: '••••••••',
  updatePassword: '更新密码',
  passwordComingSoon: '账户系统对接后将开放此功能。如需重置密码，请使用登录页的找回密码。',
  emailTitle: '修改邮箱',
  emailBody: '要更改登录邮箱，请通过主菜单中的「支持」联系 Baterino 团队。我们将验证身份后安全更新账户。',
  currentEmailLabel: '当前邮箱：',
  twoFactorTitle: '两步验证',
  twoFactorBody: '合作伙伴账户的两步验证 (2FA) 即将上线。',
  deleteTitle: '删除账户',
  deleteIntro: '删除账户后无法恢复，所有数据将永久清除。',
  deleteAccount: '删除账户',
  cancel: '取消',
  confirmDeletion: '确认删除',
  deleteModalTitle: '删除账户',
  deleteModalBody: '您即将删除账户。此操作不可撤销。',
  deleteModalBullet1: '所有个人数据将被永久删除',
  deleteModalBullet2: '您将不再收到我们的任何通信',
  deleteConfirmLabel: '输入 DELETE 以确认',
  deleting: '正在删除...',
  profileLoadError: '无法加载资料。',
  saveErrorFallback: '保存失败。',
  deleteErrorFallback: '删除账户失败。',
}

const translations: Record<LangCode, PartnerSettingsTranslations> = { ro, en, zh }

export function getPartnerSettingsTranslations(lang: LangCode): PartnerSettingsTranslations {
  return translations[lang] ?? translations.ro
}

export function getPartnerSettingsActivityLabel(
  lang: LangCode,
  id: PartnerSettingsActivityId,
): string {
  const tr = getPartnerSettingsTranslations(lang)
  const map: Record<PartnerSettingsActivityId, string> = {
    instalator: tr.activityInstalator,
    distribuitor: tr.activityDistribuitor,
    integrator: tr.activityIntegrator,
    altul: tr.activityAltul,
  }
  return map[id]
}
