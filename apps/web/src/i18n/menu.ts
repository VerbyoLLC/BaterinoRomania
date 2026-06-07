export type LangCode = 'ro' | 'en'

export const LANGUAGES: { code: LangCode; label: string; menuLabel: string }[] = [
  { code: 'ro', label: 'Română', menuLabel: 'Română' },
  { code: 'en', label: 'English', menuLabel: 'English' },
]

const translations: Record<LangCode, Record<string, string>> = {
  ro: {
    home: 'Acasă', produse: 'Produse', reduceri: 'Reduceri', siguranta: 'Siguranță', studiiDeCaz: 'Studii de caz', divizii: 'Divizii',
    rezidential: 'Rezidențial', industrial: 'Industrial', medical: 'Medical', maritim: 'Maritim',
    lithtech: 'Parteneriat LithTech', instalatori: 'Instalatori', companie: 'Companie',
    viziune: 'Viziune', misiune: 'Misiune', implementare: 'Implementare', echipa: 'Echipa',
    promisiune: 'Promisiune', contact: 'Contact', login: 'Login',
    accountMenuLabel: 'Contul meu',
    prodRezSubtype: 'Low Voltage & High Voltage', prodHighVoltage: 'High Voltage',
    back: 'Înapoi',
    divRezSubtitle: 'Rezidențial și Micro-Grids', divIndSubtitle: 'Industrial și Comercial',
    compViziuneSubtitle: 'Despre noi', compLithtechSubtitle: 'Partenerul tehnologic', compContactSubtitle: 'Suport clienți și parteneri',
    loginCreateAccount: 'Creează cont', loginSignIn: 'Intră în cont', loginSubtitle: 'Clienți și Parteneri',
    mainProduse: 'Baterii LiFePO4', mainProduseSubtitle: 'Alege o baterie',
    mainReduceriSubtitle: 'Programe reduceri baterii', mainSigurantaSubtitle: 'De ce cumperi de la noi',
    mainStudiiDeCazSubtitle: 'Proiecte reale de stocare energie',
    mainDiviziiSubtitle: 'Diviziile noastre tehnice', mainInstalatori: 'Instalatori & Distribuitori',
    mainInstalatoriSubtitle: 'Devino partenerul nostru', mainCompanieSubtitle: 'Viziune, Parteneriat și Contact',
    mainLangSubtitle: 'Alege limba sitului', mainLogin: 'Logare', mainLoginSubtitle: 'Clienți și Parteneri',
    verificareGarantie: 'Verificare garanție',
    mainVerificareGarantieSubtitle: 'Verifică numărul de serie al bateriei',
  },
  en: {
    home: 'Home', produse: 'Products', reduceri: 'Discounts', siguranta: 'Safety', studiiDeCaz: 'Case studies', divizii: 'Divisions',
    rezidential: 'Residential', industrial: 'Industrial', medical: 'Medical', maritim: 'Maritime',
    lithtech: 'LithTech Partnership', instalatori: 'Installers', companie: 'Company',
    viziune: 'Vision', misiune: 'Mission', implementare: 'Implementation', echipa: 'Team',
    promisiune: 'Promise', contact: 'Contact', login: 'Login',
    accountMenuLabel: 'My account',
    prodRezSubtype: 'Low Voltage & High Voltage', prodHighVoltage: 'High Voltage',
    back: 'Back',
    divRezSubtitle: 'Residential & Micro-Grids', divIndSubtitle: 'Industrial & Commercial',
    compViziuneSubtitle: 'About us', compLithtechSubtitle: 'The technological partner', compContactSubtitle: 'Customer and partner support',
    loginCreateAccount: 'Create account', loginSignIn: 'Log in', loginSubtitle: 'Clients and Partners',
    mainProduse: 'LiFePO4 Batteries', mainProduseSubtitle: 'Choose a battery',
    mainReduceriSubtitle: 'Battery discount programs', mainSigurantaSubtitle: 'Why buy from us',
    mainStudiiDeCazSubtitle: 'Real-world energy storage projects',
    mainDiviziiSubtitle: 'Our technical divisions', mainInstalatori: 'Installers & Distributors',
    mainInstalatoriSubtitle: 'Become our partner', mainCompanieSubtitle: 'Vision, Partnership and Contact',
    mainLangSubtitle: 'Choose site language', mainLogin: 'Log in', mainLoginSubtitle: 'Clients and Partners',
    verificareGarantie: 'Warranty check',
    mainVerificareGarantieSubtitle: 'Verify your battery serial number',
  },
}

export function getMenuTranslations(lang: LangCode): Record<string, string> {
  return translations[lang] ?? translations.ro
}
