/**
 * Internationalization (i18n) Manager
 * Supports Chinese and English with auto-detection
 */
class I18n {
  constructor() {
    this.currentLocale = this.getInitialLocale();
    this.translations = {};
    this.fallbackLocale = 'en';
    this.listeners = [];
  }

  async init() {
    await this.loadTranslations(this.currentLocale);
    this.applyTranslations();
    this.setDocumentLang();
  }

  getInitialLocale() {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && this.isSupportedLocale(langParam)) {
      localStorage.setItem('echo-locale', langParam);
      return langParam;
    }

    // Check localStorage
    const savedLocale = localStorage.getItem('echo-locale');
    if (savedLocale && this.isSupportedLocale(savedLocale)) {
      return savedLocale;
    }

    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const primaryLang = browserLang.split('-')[0].toLowerCase();
    
    if (this.isSupportedLocale(primaryLang)) {
      return primaryLang;
    }

    // Default to English
    return 'en';
  }

  isSupportedLocale(locale) {
    return ['zh', 'en'].includes(locale.toLowerCase());
  }

  async loadTranslations(locale) {
    try {
      const response = await fetch(`locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }
      this.translations = await response.json();
      this.currentLocale = locale;
    } catch (error) {
      console.error('Error loading translations:', error);
      // Try fallback locale
      if (locale !== this.fallbackLocale) {
        await this.loadTranslations(this.fallbackLocale);
      }
    }
  }

  t(key, params = {}) {
    const value = this.getNestedValue(this.translations, key);
    
    if (!value) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // Replace parameters
    return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  async setLocale(locale) {
    if (!this.isSupportedLocale(locale) || locale === this.currentLocale) {
      return;
    }

    await this.loadTranslations(locale);
    localStorage.setItem('echo-locale', locale);
    this.setDocumentLang();
    this.applyTranslations();
    
    // Notify listeners
    this.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(this.currentLocale);
      }
    });

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('localechange', {
      detail: { locale: this.currentLocale }
    }));
  }

  getLocale() {
    return this.currentLocale;
  }

  setDocumentLang() {
    document.documentElement.setAttribute('lang', this.currentLocale === 'zh' ? 'zh-CN' : 'en');
  }

  applyTranslations() {
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Check if element has HTML content
      if (element.hasAttribute('data-i18n-html')) {
        element.innerHTML = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.setAttribute('placeholder', this.t(key));
    });

    // Translate titles
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.setAttribute('title', this.t(key));
    });
  }

  onChange(listener) {
    this.listeners.push(listener);
  }

  offChange(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Format date according to current locale
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat(
      this.currentLocale === 'zh' ? 'zh-CN' : 'en-US',
      { ...defaultOptions, ...options }
    ).format(date);
  }

  // Format number according to current locale
  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(
      this.currentLocale === 'zh' ? 'zh-CN' : 'en-US',
      options
    ).format(number);
  }

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(
      this.currentLocale === 'zh' ? 'zh-CN' : 'en-US',
      { numeric: 'auto' }
    );

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    }
    if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    }
    if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    }
    if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    }
    return this.formatDate(date);
  }
}

// Initialize i18n
document.addEventListener('DOMContentLoaded', () => {
  window.i18n = new I18n();
  window.i18n.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
