const FONT_LINK_ID = 'quickbox-arabic-font';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&display=swap';

/**
 * Injects Google Font preconnect and stylesheet link elements ONLY when Arabic is required.
 */
export function injectArabicFont() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;

  // Preconnect to Google Fonts domain if not already established
  if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);
  }

  if (!document.querySelector('link[href="https://fonts.gstatic.com"]')) {
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
  }

  // Inject Cairo + Tajawal stylesheet
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = FONT_HREF;
  document.head.appendChild(link);
}

export function loadArabicFont() {
  injectArabicFont();
}

export function unloadArabicFont() {
  if (typeof document === 'undefined') return;
  const link = document.getElementById(FONT_LINK_ID);
  if (link) {
    link.remove();
  }
}

/**
 * Synchronizes HTML dir, lang attributes and triggers conditional font loading.
 * @param {'en' | 'ar'} language 
 */
export function syncLanguageDirectionAndFont(language) {
  if (typeof document === 'undefined') return;

  const isRtl = language === 'ar';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = language;

  if (isRtl) {
    injectArabicFont();
  }
}
