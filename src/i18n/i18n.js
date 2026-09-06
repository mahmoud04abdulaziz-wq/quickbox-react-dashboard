import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { syncLanguageDirectionAndFont } from './fontLoader';

export const STORAGE_KEY = 'quickbox_lang';
export const SUPPORTED_LANGUAGES = ['en', 'ar'];
export const DEFAULT_LANGUAGE = 'en';

// Synchronous language detection from localStorage
const savedLanguage = typeof window !== 'undefined' && window.localStorage
  ? localStorage.getItem(STORAGE_KEY)
  : null;
const initialLanguage = SUPPORTED_LANGUAGES.includes(savedLanguage)
  ? savedLanguage
  : DEFAULT_LANGUAGE;

// Initialize document direction and font loading immediately on bootstrap
syncLanguageDirectionAndFont(initialLanguage);

i18n
  .use(
    resourcesToBackend((language, namespace) => {
      return import(`./locales/${language}/${namespace}.json`);
    })
  )
  .use(initReactI18next)
  .init({
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: ['common'],
    defaultNS: 'common',
    fallbackNS: 'common',

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
    },

    returnNull: false,
    returnEmptyString: false,
  });

// Listen for language changes to update persistence, DOM dir/lang, and fonts
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, lng);
  }
  syncLanguageDirectionAndFont(lng);
});

// Enforce Western Arabic numerals (latn) across all formatters
if (i18n.services && i18n.services.formatter) {
  i18n.services.formatter.add('number', (value, lng, options) => {
    return new Intl.NumberFormat(lng, {
      numberingSystem: 'latn',
      ...options,
    }).format(value);
  });

  i18n.services.formatter.add('currency', (value, lng, options) => {
    return new Intl.NumberFormat(lng, {
      style: 'currency',
      currency: options?.currency || 'JOD',
      numberingSystem: 'latn',
      ...options,
    }).format(value);
  });
}

export default i18n;
