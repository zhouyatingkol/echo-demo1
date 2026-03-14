/**
 * Mobile Navigation Handler
 * 移动端导航处理
 */

(function() {
  'use strict';

  // Mobile navigation configuration
  const MOBILE_NAV_CONFIG = {
    items: [
      { id: 'discover', icon: '🎯', label: '发现', href: 'discover.html' },
      { id: 'market', icon: '🛒', label: '市场', href: 'music-market.html' },
      { id: 'mint', icon: '🎵', label: '铸造', href: 'mint-music.html' },
      { id: 'favorites', icon: '❤️', label: '我的', href: 'my-favorites.html' }
    ],
    breakpoint: 768
  };

  /**
   * Check if current device is mobile
   */
  function isMobile() {
    return window.innerWidth <= MOBILE_NAV_CONFIG.breakpoint;
  }

  /**
   * Get current page identifier
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    if (page.includes('discover')) return 'discover';
    if (page.includes('market')) return 'market';
    if (page.includes('mint')) return 'mint';
    if (page.includes('favorite') || page.includes('my')) return 'favorites';
    
    return 'discover';
  }

  /**
   * Create mobile navigation HTML
   */
  function createMobileNav() {
    const nav = document.createElement('nav');
    nav.className = 'mobile-nav';
    nav.id = 'mobile-nav';
    
    const currentPage = getCurrentPage();
    
    MOBILE_NAV_CONFIG.items.forEach(item => {
      const link = document.createElement('a');
      link.href = item.href;
      link.className = 'mobile-nav-item';
      link.dataset.page = item.id;
      
      if (item.id === currentPage) {
        link.classList.add('active');
      }
      
      link.innerHTML = `
        <span class="icon">${item.icon}</span>
        <span class="label">${item.label}</span>
      `;
      
      // Add touch feedback
      link.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
      });
      
      link.addEventListener('touchend', function() {
        this.style.transform = '';
      });
      
      nav.appendChild(link);
    });
    
    return nav;
  }

  /**
   * Inject mobile navigation into the page
   */
  function injectMobileNav() {
    // Check if already exists
    if (document.getElementById('mobile-nav')) {
      return;
    }
    
    const nav = createMobileNav();
    document.body.appendChild(nav);
    
    // Add mobile-active class to body
    document.body.classList.add('mobile-active');
  }

  /**
   * Remove mobile navigation
   */
  function removeMobileNav() {
    const nav = document.getElementById('mobile-nav');
    if (nav) {
      nav.remove();
    }
    document.body.classList.remove('mobile-active');
  }

  /**
   * Update active state based on current page
   */
  function updateActiveState() {
    const currentPage = getCurrentPage();
    const items = document.querySelectorAll('.mobile-nav-item');
    
    items.forEach(item => {
      if (item.dataset.page === currentPage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    if (isMobile()) {
      injectMobileNav();
    } else {
      removeMobileNav();
    }
  }

  /**
   * Add haptic feedback if available
   */
  function hapticFeedback() {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  /**
   * Initialize mobile navigation
   */
  function init() {
    // Initial check
    handleResize();
    
    // Listen for resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    });
    
    // Add haptic feedback to nav items
    document.addEventListener('click', function(e) {
      if (e.target.closest('.mobile-nav-item')) {
        hapticFeedback();
      }
    });
    
    // Handle page visibility changes (for single-page apps)
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        updateActiveState();
      }
    });
    
    console.log('📱 Mobile navigation initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external use
  window.MobileNav = {
    refresh: updateActiveState,
    isMobile: isMobile,
    show: injectMobileNav,
    hide: removeMobileNav
  };

})();
