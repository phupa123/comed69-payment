/**
 * =========================================================================
 * SITE MAINTENANCE & ACCESS GUARD - assets/js/maintenance-guard.js
 * COMED KKU 69 CENTRAL PROTECTION LAYER
 * =========================================================================
 */

const MAINT_CONFIG_KEY = 'COMED_MAINTENANCE_CONFIG_V1';

(function() {
  try {
    // 1. Never block admin management pages
    const currentPath = window.location.pathname.toLowerCase();
    if (
      currentPath.includes('admin.html') ||
      currentPath.includes('payment-admin.html') ||
      currentPath.includes('index-admin.html') ||
      currentPath.includes('maintenance.html') ||
      currentPath.includes('404.html')
    ) {
      return;
    }

    // 2. Identify target page name
    let pageKey = 'index';
    if (currentPath.includes('payment.html')) {
      pageKey = 'payment';
    }

    // 3. Read Maintenance Settings
    const stored = localStorage.getItem(MAINT_CONFIG_KEY);
    if (!stored) return;

    const config = JSON.parse(stored);
    
    // Check Global Site Lock or Page-specific Lock
    const globalLock = config['all'] && config['all'].active;
    const pageLock = config[pageKey] && config[pageKey].active;

    if (globalLock || pageLock) {
      const activeLock = globalLock ? config['all'] : config[pageKey];

      // Check Countdown Expiration
      if (activeLock.endTime) {
        const endTimestamp = new Date(activeLock.endTime).getTime();
        const now = Date.now();
        if (now >= endTimestamp) {
          // Maintenance time has passed, auto unlock
          activeLock.active = false;
          localStorage.setItem(MAINT_CONFIG_KEY, JSON.stringify(config));
          return;
        }
      }

      // Redirect to Maintenance Screen
      window.location.href = `maintenance.html?page=${globalLock ? 'all' : pageKey}`;
    }
  } catch(e) {
    console.warn("Maintenance Guard Check", e);
  }
})();
