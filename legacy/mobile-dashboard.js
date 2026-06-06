/**
 * TRACKLY DASHBOARD - MOBILE FUNCTIONALITY
 * Add this script to your dashboard for full mobile support
 */

(function() {
  'use strict';
  
  // ══════════════════════════════════════════════════════════
  // MOBILE MENU TOGGLE
  // ══════════════════════════════════════════════════════════
  
  function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (!menuBtn || !sidebar) {
      console.warn('Mobile menu elements not found');
      return;
    }
    
    // Toggle sidebar
    menuBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      sidebarOverlay?.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      
      console.log('📱 Sidebar toggled:', isOpen ? 'open' : 'closed');
    });
    
    // Close on overlay click
    sidebarOverlay?.addEventListener('click', closeSidebar);
    
    // Close on nav item click (mobile only)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          closeSidebar();
        }
      });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });
    
    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  // ══════════════════════════════════════════════════════════
  // WINDOW RESIZE HANDLER
  // ══════════════════════════════════════════════════════════
  
  function initResizeHandler() {
    let resizeTimer;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        
        // Close sidebar on desktop
        if (window.innerWidth > 900) {
          sidebar?.classList.remove('open');
          sidebarOverlay?.classList.remove('active');
          document.body.style.overflow = '';
        }
      }, 250);
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // MOBILE BOTTOM NAVIGATION
  // ══════════════════════════════════════════════════════════
  
  function initMobileBottomNav() {
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    if (mobileNavItems.length === 0) return;
    
    mobileNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        mobileNavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Get page and switch
        const page = item.dataset.page;
        if (page && typeof switchPage === 'function') {
          switchPage(page);
        }
        
        console.log('📱 Mobile nav:', page);
      });
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // SWIPE GESTURES
  // ══════════════════════════════════════════════════════════
  
  function initSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      
      if (!sidebar || window.innerWidth > 900) return;
      
      const swipeThreshold = 50;
      const horizontalSwipe = Math.abs(touchEndX - touchStartX);
      const verticalSwipe = Math.abs(touchEndY - touchStartY);
      
      // Only handle horizontal swipes
      if (horizontalSwipe < swipeThreshold || verticalSwipe > horizontalSwipe) return;
      
      // Swipe right from left edge to open
      if (touchStartX < 50 && touchEndX - touchStartX > swipeThreshold) {
        sidebar.classList.add('open');
        sidebarOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('📱 Swipe: Sidebar opened');
      }
      
      // Swipe left to close
      if (sidebar.classList.contains('open') && touchStartX - touchEndX > swipeThreshold) {
        sidebar.classList.remove('open');
        sidebarOverlay?.classList.remove('active');
        document.body.style.overflow = '';
        console.log('📱 Swipe: Sidebar closed');
      }
    }
  }
  
  // ══════════════════════════════════════════════════════════
  // PREVENT DOUBLE-TAP ZOOM (iOS)
  // ══════════════════════════════════════════════════════════
  
  function preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }
  
  // ══════════════════════════════════════════════════════════
  // SMOOTH SCROLL
  // ══════════════════════════════════════════════════════════
  
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // VIEWPORT HEIGHT FIX (Mobile browsers)
  // ══════════════════════════════════════════════════════════
  
  function fixViewportHeight() {
    // Fix for mobile browsers where 100vh includes address bar
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
  }
  
  // ══════════════════════════════════════════════════════════
  // HAPTIC FEEDBACK (Optional)
  // ══════════════════════════════════════════════════════════
  
  function vibrate(duration = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }
  
  function initHapticFeedback() {
    // Add haptic feedback to buttons
    const buttons = document.querySelectorAll('button, .btn-add, .btn-primary, .btn-secondary');
    
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        vibrate(10);
      });
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // PULL TO REFRESH (Optional)
  // ══════════════════════════════════════════════════════════
  
  function initPullToRefresh() {
    let pStart = { x: 0, y: 0 };
    let pCurrent = { x: 0, y: 0 };
    let pulling = false;
    
    const main = document.querySelector('.main');
    if (!main) return;
    
    main.addEventListener('touchstart', (e) => {
      if (main.scrollTop === 0) {
        pStart.x = e.touches[0].screenX;
        pStart.y = e.touches[0].screenY;
        pulling = true;
      }
    }, { passive: true });
    
    main.addEventListener('touchmove', (e) => {
      if (!pulling) return;
      
      pCurrent.x = e.touches[0].screenX;
      pCurrent.y = e.touches[0].screenY;
    }, { passive: true });
    
    main.addEventListener('touchend', () => {
      if (!pulling) return;
      
      const changeY = pStart.y - pCurrent.y;
      
      // Pull down more than 100px to refresh
      if (changeY < -100 && main.scrollTop === 0) {
        console.log('📱 Pull to refresh triggered');
        vibrate(20);
        
        // Show loading indicator (you can customize this)
        const loadingMsg = document.createElement('div');
        loadingMsg.textContent = 'Refreshing...';
        loadingMsg.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          z-index: 9999;
          font-weight: 600;
        `;
        document.body.appendChild(loadingMsg);
        
        // Reload after short delay
        setTimeout(() => {
          location.reload();
        }, 500);
      }
      
      pulling = false;
    }, { passive: true });
  }
  
  // ══════════════════════════════════════════════════════════
  // ORIENTATION CHANGE HANDLER
  // ══════════════════════════════════════════════════════════
  
  function initOrientationHandler() {
    window.addEventListener('orientationchange', () => {
      console.log('📱 Orientation changed');
      
      // Close sidebar on orientation change
      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      
      sidebar?.classList.remove('open');
      sidebarOverlay?.classList.remove('active');
      document.body.style.overflow = '';
      
      // Recalculate viewport height
      setTimeout(() => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }, 100);
    });
  }
  
  // ══════════════════════════════════════════════════════════
  // INITIALIZE ALL
  // ══════════════════════════════════════════════════════════
  
  function init() {
    console.log('📱 Initializing mobile functionality...');
    
    // Core functionality
    initMobileMenu();
    initResizeHandler();
    initSwipeGestures();
    fixViewportHeight();
    initSmoothScroll();
    initOrientationHandler();
    
    // Optional functionality
    initMobileBottomNav();
    preventDoubleTapZoom();
    
    // Uncomment if you want these features:
    // initHapticFeedback();
    // initPullToRefresh();
    
    console.log('✅ Mobile functionality initialized');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Export functions for external use
  window.TracklyMobile = {
    vibrate,
    closeSidebar: () => {
      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      sidebar?.classList.remove('open');
      sidebarOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
  
})();