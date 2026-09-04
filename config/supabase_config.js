/**
 * =========================================================================
 * SUPABASE CLIENT & CLOUD SYNC CONFIGURATION
 * สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น (COMED KKU 69)
 * =========================================================================
 */

// Supabase Credentials (Loaded securely for Client Application)
window.SUPABASE_CONFIG = {
  url: "https://drqrliajxigxyrfaypfg.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycXJsaWFqeGlneHlyZmF5cGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTQ1ODYsImV4cCI6MjEwNDA5MDU4Nn0.9IEsTHlUiVZEzNsqIaKeH5g1SzXw91SRALGeKFct0Nw"
};

// Initialize Supabase Client if library loaded
window.getSupabaseClient = function() {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    if (!window._supabaseClientInstance) {
      window._supabaseClientInstance = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
      );
    }
    return window._supabaseClientInstance;
  }
  return null;
};
