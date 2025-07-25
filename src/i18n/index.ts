import { createI18n } from 'vue-i18n'
import en_US from './locales/en_US.json'

// Supported languages configuration - matching Zume training system codes
export const SUPPORTED_LANGUAGES = [
  { code: 'en_US', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'es_ES', name: 'Spanish (Spain)', nativeName: 'Español (España)' },
  { code: 'fr_FR', name: 'French', nativeName: 'Français' },
  { code: 'de_DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pt_PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
  { code: 'it_IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru_RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko_KR', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ar_JO', name: 'Arabic (Jordan)', nativeName: 'العربية (الأردن)' },
  { code: 'ar_MA', name: 'Arabic (Morocco)', nativeName: 'العربية (المغرب)' },
  { code: 'ar_TN', name: 'Arabic (Tunisia)', nativeName: 'العربية (تونس)' },
  { code: 'hi_IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn_IN', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'fa_IR', name: 'Persian', nativeName: 'فارسی' },
  { code: 'id_ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'swa', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ha_NG', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ml_IN', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa_IN', name: 'Punjabi (India)', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'pa_PK', name: 'Punjabi (Pakistan)', nativeName: 'پنجابی' },
  { code: 'ne_NP', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'ckb', name: 'Central Kurdish', nativeName: 'کوردیی ناوەندی' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
  { code: 'bg_BG', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'bs_BA', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'pl_PL', name: 'Polish', nativeName: 'Polski' },
  { code: 'ro_RO', name: 'Romanian', nativeName: 'Română' },
  { code: 'sl_SI', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'fo', name: 'Faroese', nativeName: 'Føroyskt' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
] as const

// Default language
const DEFAULT_LANGUAGE = 'en_US'

// Get browser language or fall back to default
function getBrowserLanguage(): string {
  const fullLang = navigator.language.replace('-', '_') // Convert en-US to en_US
  const shortLang = navigator.language.split('-')[0]
  
  // Try exact match first (e.g., en_US)
  if (SUPPORTED_LANGUAGES.some(lang => lang.code === fullLang)) {
    return fullLang
  }
  
  // Try short language code (e.g., en -> en_US)
  const matchedLang = SUPPORTED_LANGUAGES.find(lang => lang.code.startsWith(shortLang))
  return matchedLang ? matchedLang.code : DEFAULT_LANGUAGE
}

// Get saved language from localStorage or browser default
function getSavedLanguage(): string {
  return localStorage.getItem('prayer-cycle-language') || getBrowserLanguage()
}

// Save language to localStorage
export function saveLanguage(language: string): void {
  localStorage.setItem('prayer-cycle-language', language)
}

// Lazy load translation files
async function loadTranslation(language: string) {
  try {
    const translations = await import(`./locales/${language}.json`)
    return translations.default
  } catch (error) {
    console.warn(`Failed to load translation for ${language}, falling back to English`)
    return en_US
  }
}

// Create i18n instance
export const i18n = createI18n({
  legacy: false,
  locale: getSavedLanguage(),
  fallbackLocale: DEFAULT_LANGUAGE,
  messages: {
    [DEFAULT_LANGUAGE]: en_US
  } as any,
  globalInjection: true
})

// Function to change language dynamically
export async function setLanguage(language: string) {
  if (!SUPPORTED_LANGUAGES.some(lang => lang.code === language)) {
    console.warn(`Language ${language} is not supported`)
    return
  }

  // Load translation if not already loaded
  if (!i18n.global.availableLocales.includes(language)) {
    const messages = await loadTranslation(language)
    i18n.global.setLocaleMessage(language as any, messages)
  }

  i18n.global.locale.value = language as any
  saveLanguage(language)
  
  // Update document language attribute
  document.documentElement.lang = language
}

// Initialize with saved language
const savedLanguage = getSavedLanguage()
if (savedLanguage !== DEFAULT_LANGUAGE) {
  setLanguage(savedLanguage)
}