/**
 * Touch Gestures Handler
 * 触摸手势处理
 * 
 * Features:
 * - 左右滑动切换页面 (Swipe left/right to switch pages)
 * - 上滑打开播放器 (Swipe up to open player)
 * - 下拉刷新 (Pull down to refresh)
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    swipeThreshold: 80,        // Minimum distance for swipe
    swipeVelocity: 0.5,        // Minimum velocity for swipe
    pullThreshold: 100,        // Distance to trigger refresh
    edgeThreshold: 50,         // Edge detection for page switch
    longPressDuration: 500,    // Long press duration in ms
    doubleTapDelay: 300        // Double tap delay in ms
  };

  // Page navigation order for swipe switching
  const PAGE_ORDER = [
    'discover.html',
    'music-market.html', 
    'mint-music.html',
    'my-favorites.html'
  ];

  // Touch state
  let touchState = {
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isPulling: false,
    isSwiping: false,
    isPlayerOpen: false
  };

  // Double tap detection
  let lastTapTime = 0;
  let lastTapTarget = null;

  /**
   * Get current page index in navigation order
   */
  function getCurrentPageIndex() {
    const currentPage = window.location.pathname.split('/').pop() || 'discover.html';
    return PAGE_ORDER.findIndex(page => currentPage.includes(page.replace('.html', '')));
  }

  /**
   * Navigate to previous page
   */
  function navigateToPrev() {
    const currentIndex = getCurrentPageIndex();
    if (currentIndex > 0) {
      showSwipeIndicator('right');
      setTimeout(() => {
        window.location.href = PAGE_ORDER[currentIndex - 1];
      }, 200);
    }
  }

  /**
   * Navigate to next page
   */
  function navigateToNext() {
    const currentIndex = getCurrentPageIndex();
    if (currentIndex < PAGE_ORDER.length - 1) {
      showSwipeIndicator('left');
      setTimeout(() => {
        window.location.href = PAGE_ORDER[currentIndex + 1];
      }, 200);
    }
  }

  /**
   * Show swipe indicator
   */
  function showSwipeIndicator(direction) {
    let indicator = document.querySelector(`.swipe-indicator.${direction}`);
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = `swipe-indicator ${direction}`;
      indicator.innerHTML = direction === 'left' ? '‹' : '›';
      document.body.appendChild(indicator);
    }
    indicator.classList.add('visible');
    setTimeout(() => indicator.classList.remove('visible'), 500);
  }

  /**
   * Open player (swipe up gesture)
   */
  function openPlayer() {
    if (touchState.isPlayerOpen) return;
    
    touchState.isPlayerOpen = true;
    
    // Trigger player open event
    const event = new CustomEvent('player:open', {
      detail: { gesture: 'swipe-up' }
    });
    document.dispatchEvent(event);
    
    // Try to find and click player trigger
    const playerTrigger = document.querySelector('.player-mini, .now-playing-bar, [data-action="open-player"]');
    if (playerTrigger) {
      playerTrigger.click();
    }
    
    console.log('🎵 Player opened via swipe up');
  }

  /**
   * Pull to refresh
   */
  function pullToRefresh() {
    if (touchState.isPulling) return;
    
    touchState.isPulling = true;
    
    // Show refresh indicator
    showRefreshIndicator();
    
    // Trigger refresh
    const event = new CustomEvent('page:refresh', {
      detail: { gesture: 'pull-down' }
    });
    document.dispatchEvent(event);
    
    // Perform refresh
    setTimeout(() => {
      window.location.reload();
    }, 800);
    
    console.log('🔄 Page refreshing...');
  }

  /**
   * Show refresh indicator
   */
  function showRefreshIndicator() {
    let indicator = document.querySelector('.pull-refresh');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'pull-refresh';
      indicator.innerHTML = '<div class="pull-refresh-spinner"></div><span>正在刷新...</span>';
      document.body.insertBefore(indicator, document.body.firstChild);
    }
    indicator.classList.add('visible');
  }

  /**
   * Handle touch start
   */
  function handleTouchStart(e) {
    const touch = e.touches[0];
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
    touchState.startTime = Date.now();
    touchState.currentX = touch.clientX;
    touchState.currentY = touch.clientY;
    touchState.isSwiping = false;
    
    // Check if at top of page for pull-to-refresh
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    touchState.canPullRefresh = scrollTop <= 0;
  }

  /**
   * Handle touch move
   */
  function handleTouchMove(e) {
    const touch = e.touches[0];
    touchState.currentX = touch.clientX;
    touchState.currentY = touch.clientY;
    
    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = touchState.currentY - touchState.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Determine swipe direction
    if (!touchState.isSwiping && (absX > 10 || absY > 10)) {
      touchState.isSwiping = true;
      touchState.swipeDirection = absX > absY ? 'horizontal' : 'vertical';
    }
    
    // Handle horizontal swipes
    if (touchState.swipeDirection === 'horizontal') {
      // Check if at screen edge for page navigation
      const screenWidth = window.innerWidth;
      const atLeftEdge = touchState.startX < CONFIG.edgeThreshold;
      const atRightEdge = touchState.startX > screenWidth - CONFIG.edgeThreshold;
      
      // Show swipe indicator
      if (deltaX > 30 && atLeftEdge) {
        showSwipeIndicator('right');
      } else if (deltaX < -30 && atRightEdge) {
        showSwipeIndicator('left');
      }
    }
    
    // Handle pull-to-refresh visual
    if (touchState.canPullRefresh && deltaY > 0 && touchState.swipeDirection === 'vertical') {
      const pullDistance = Math.min(deltaY * 0.5, 80);
      document.body.style.transform = `translateY(${pullDistance}px)`;
      document.body.style.transition = 'none';
    }
  }

  /**
   * Handle touch end
   */
  function handleTouchEnd(e) {
    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = touchState.currentY - touchState.startY;
    const deltaTime = Date.now() - touchState.startTime;
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;
    
    // Reset pull-to-refresh transform
    document.body.style.transform = '';
    document.body.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
    
    // Horizontal swipe - page navigation
    if (touchState.swipeDirection === 'horizontal') {
      const screenWidth = window.innerWidth;
      const atLeftEdge = touchState.startX < CONFIG.edgeThreshold;
      const atRightEdge = touchState.startX > screenWidth - CONFIG.edgeThreshold;
      
      if ((Math.abs(deltaX) > CONFIG.swipeThreshold || velocityX > CONFIG.swipeVelocity)) {
        if (deltaX > 0 && atLeftEdge) {
          navigateToPrev(); // Swipe right, go to prev page
        } else if (deltaX < 0 && atRightEdge) {
          navigateToNext(); // Swipe left, go to next page
        }
      }
    }
    
    // Vertical swipe - player or refresh
    if (touchState.swipeDirection === 'vertical') {
      // Swipe up to open player (from bottom of screen)
      if (deltaY < -CONFIG.swipeThreshold && touchState.startY > window.innerHeight - 100) {
        openPlayer();
      }
      
      // Pull down to refresh
      if (touchState.canPullRefresh && deltaY > CONFIG.pullThreshold) {
        pullToRefresh();
      }
    }
    
    // Reset state
    touchState.isSwiping = false;
    touchState.swipeDirection = null;
  }

  /**
   * Handle double tap
   */
  function handleDoubleTap(e) {
    const currentTime = Date.now();
    const target = e.target;
    
    if (currentTime - lastTapTime < CONFIG.doubleTapDelay && target === lastTapTarget) {
      // Double tap detected
      const event = new CustomEvent('gesture:doubletap', {
        detail: { target: target, x: e.clientX, y: e.clientY }
      });
      document.dispatchEvent(event);
      
      // Like/unlike functionality for music cards
      const card = target.closest('.music-card, .nft-card');
      if (card) {
        const likeBtn = card.querySelector('.like-btn, .favorite-btn');
        if (likeBtn) {
          likeBtn.click();
          // Haptic feedback
          if (navigator.vibrate) navigator.vibrate(20);
        }
      }
    }
    
    lastTapTime = currentTime;
    lastTapTarget = target;
  }

  /**
   * Handle long press
   */
  function handleLongPress(e) {
    let pressTimer;
    const target = e.target;
    
    const startPress = () => {
      pressTimer = setTimeout(() => {
        const event = new CustomEvent('gesture:longpress', {
          detail: { target: target }
        });
        document.dispatchEvent(event);
        
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        
        // Show context menu for cards
        const card = target.closest('.music-card, .nft-card');
        if (card) {
          card.classList.add('long-pressed');
          setTimeout(() => card.classList.remove('long-pressed'), 1000);
        }
      }, CONFIG.longPressDuration);
    };
    
    const cancelPress = () => {
      clearTimeout(pressTimer);
    };
    
    target.addEventListener('touchend', cancelPress, { once: true });
    target.addEventListener('touchmove', cancelPress, { once: true });
    startPress();
  }

  /**
   * Initialize touch gestures
   */
  function init() {
    // Only enable on touch devices
    if (!('ontouchstart' in window)) {
      console.log('📱 Touch gestures disabled (non-touch device)');
      return;
    }
    
    // Touch events
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Double tap detection (for non-touch devices or hybrid)
    document.addEventListener('click', handleDoubleTap);
    
    // Long press detection
    document.addEventListener('touchstart', handleLongPress, { passive: true });
    
    // Prevent default pull-to-refresh on mobile browsers
    document.body.style.overscrollBehaviorY = 'none';
    
    console.log('👆 Touch gestures initialized');
    console.log('   - Swipe left/right at screen edges to switch pages');
    console.log('   - Swipe up from bottom to open player');
    console.log('   - Pull down from top to refresh');
    console.log('   - Double tap cards to like');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.TouchGestures = {
    config: CONFIG,
    state: touchState,
    refresh: pullToRefresh,
    openPlayer: openPlayer
  };

})();
