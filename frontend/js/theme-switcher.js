/**
 * Theme Manager - Handles dark/light theme switching
 */
class ThemeManager {
  constructor() {
    this.currentTheme = this.getInitialTheme();
    this.init();
  }

  init() {
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('echo-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        this.setTheme(newTheme);
      }
    });
  }

  getInitialTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('echo-theme');
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to dark
    return 'dark';
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('echo-theme', theme);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme } 
    }));
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  resetToSystem() {
    localStorage.removeItem('echo-theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.setTheme(systemTheme);
  }
}

// Initialize theme manager
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
