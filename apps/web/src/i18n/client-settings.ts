import type { LangCode } from './menu'

export type ClientSettingsExportLang = LangCode | 'es' | 'id'

export type ClientSettingsExportTranslations = {
  exportDataTitle: string
  exportData: string
  exportDataDesc: string
  exportDataLoading: string
  exportDataError: string
}

const ro: ClientSettingsExportTranslations = {
  exportDataTitle: 'Export date personale',
  exportData: 'Descarcă datele mele',
  exportDataDesc:
    'Descarcă un fișier JSON cu toate datele personale pe care le deținem despre tine, conform Art. 20 GDPR.',
  exportDataLoading: 'Se pregătește fișierul...',
  exportDataError: 'A apărut o eroare. Încearcă din nou.',
}

const en: ClientSettingsExportTranslations = {
  exportDataTitle: 'Personal data export',
  exportData: 'Download my data',
  exportDataDesc:
    'Download a JSON file with all personal data we hold about you, in accordance with GDPR Art. 20.',
  exportDataLoading: 'Preparing file...',
  exportDataError: 'An error occurred. Please try again.',
}


const es: ClientSettingsExportTranslations = {
  exportDataTitle: 'Exportación de datos personales',
  exportData: 'Descargar mis datos',
  exportDataDesc:
    'Descarga un archivo JSON con todos los datos personales que tenemos sobre ti, de acuerdo con el Art. 20 del RGPD.',
  exportDataLoading: 'Preparando archivo...',
  exportDataError: 'Ocurrió un error. Por favor, inténtalo de nuevo.',
}

const id: ClientSettingsExportTranslations = {
  exportDataTitle: 'Ekspor data pribadi',
  exportData: 'Unduh data saya',
  exportDataDesc:
    'Unduh file JSON berisi semua data pribadi yang kami simpan tentang Anda, sesuai Pasal 20 GDPR.',
  exportDataLoading: 'Mempersiapkan file...',
  exportDataError: 'Terjadi kesalahan. Silakan coba lagi.',
}

const translations: Record<ClientSettingsExportLang, ClientSettingsExportTranslations> = {
  ro,
  en,
  es,
  id,
}

export function getClientSettingsExportTranslations(
  lang: string,
): ClientSettingsExportTranslations {
  if (lang in translations) {
    return translations[lang as ClientSettingsExportLang]
  }
  return translations.en
}
