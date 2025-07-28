import { createI18n } from 'vue-i18n'
import en_US from './locales/en_US.json'
import fr_FR from './locales/fr_FR.json'

// Supported languages configuration - matching Zume training system codes
// Only languages with enabled: true will be displayed in the UI
export const SUPPORTED_LANGUAGES = [
  { code: 'en_US', name: 'English', nativeName: 'English', enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: false },
  { code: 'es_ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', enabled: false },
  { code: 'fr_FR', name: 'French', nativeName: 'Français', enabled: true },
  { code: 'de_DE', name: 'German', nativeName: 'Deutsch', enabled: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', enabled: false },
  { code: 'pt_PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', enabled: false },
  { code: 'it_IT', name: 'Italian', nativeName: 'Italiano', enabled: false },
  { code: 'ru_RU', name: 'Russian', nativeName: 'Русский', enabled: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', enabled: false },
  { code: 'ko_KR', name: 'Korean', nativeName: '한국어', enabled: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', enabled: false },
  { code: 'ar_JO', name: 'Arabic (Jordan)', nativeName: 'العربية (الأردن)', enabled: false },
  { code: 'ar_MA', name: 'Arabic (Morocco)', nativeName: 'العربية (المغرب)', enabled: false },
  { code: 'ar_TN', name: 'Arabic (Tunisia)', nativeName: 'العربية (تونس)', enabled: false },
  { code: 'hi_IN', name: 'Hindi', nativeName: 'हिन्दी', enabled: false },
  { code: 'bn_IN', name: 'Bengali', nativeName: 'বাংলা', enabled: false },
  { code: 'fa_IR', name: 'Persian', nativeName: 'فارسی', enabled: false },
  { code: 'id_ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', enabled: false },
  { code: 'swa', name: 'Swahili', nativeName: 'Kiswahili', enabled: false },
  { code: 'ha_NG', name: 'Hausa', nativeName: 'Hausa', enabled: false },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', enabled: false },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', enabled: false },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', enabled: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', enabled: false },
  { code: 'ml_IN', name: 'Malayalam', nativeName: 'മലയാളം', enabled: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', enabled: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', enabled: false },
  { code: 'pa_IN', name: 'Punjabi (India)', nativeName: 'ਪੰਜਾਬੀ', enabled: false },
  { code: 'pa_PK', name: 'Punjabi (Pakistan)', nativeName: 'پنجابی', enabled: false },
  { code: 'ne_NP', name: 'Nepali', nativeName: 'नेपाली', enabled: false },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', enabled: false },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ', enabled: false },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', enabled: false },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', enabled: false },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', enabled: false },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', enabled: false },
  { code: 'ckb', name: 'Central Kurdish', nativeName: 'کوردیی ناوەندی', enabled: false },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', enabled: false },
  { code: 'bg_BG', name: 'Bulgarian', nativeName: 'Български', enabled: false },
  { code: 'bs_BA', name: 'Bosnian', nativeName: 'Bosanski', enabled: false },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', enabled: false },
  { code: 'pl_PL', name: 'Polish', nativeName: 'Polski', enabled: false },
  { code: 'ro_RO', name: 'Romanian', nativeName: 'Română', enabled: false },
  { code: 'sl_SI', name: 'Slovenian', nativeName: 'Slovenščina', enabled: false },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', enabled: false },
  { code: 'fo', name: 'Faroese', nativeName: 'Føroyskt', enabled: false },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', enabled: false },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', enabled: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', enabled: false }
] as const

// Default language
const DEFAULT_LANGUAGE = 'en_US'

// Get browser language or fall back to default
function getBrowserLanguage(): string {
  const fullLang = navigator.language.replace('-', '_') // Convert en-US to en_US
  const shortLang = navigator.language.split('-')[0]
  
  // Try exact match first (e.g., en_US) - only enabled languages
  if (SUPPORTED_LANGUAGES.some(lang => lang.code === fullLang && lang.enabled)) {
    return fullLang
  }
  
  // Try short language code (e.g., en -> en_US) - only enabled languages
  const matchedLang = SUPPORTED_LANGUAGES.find(lang => lang.code.startsWith(shortLang) && lang.enabled)
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
    en_US: en_US,
    fr_FR: fr_FR
  } as any,
  globalInjection: true
})

// Function to change language dynamically
export async function setLanguage(language: string) {
  if (!SUPPORTED_LANGUAGES.some(lang => lang.code === language && lang.enabled)) {
    console.warn(`Language ${language} is not supported or not enabled`)
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