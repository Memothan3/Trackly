// Configuration Template for Trackly
// Copy this file to config.js and update with your actual values

window.TRACKLY_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: "https://your-project-id.supabase.co",
  SUPABASE_ANON_KEY: "your_supabase_publishable_key",
  
  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: "your-firebase-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.region.firebasedatabase.app",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
  },
  
  // AI Configuration (Optional)
  GEMINI_API_KEY: "your-gemini-api-key", // For AI features
  
  // App Configuration
  APP_NAME: "Trackly",
  DEFAULT_CURRENCY: "USD",
  DEFAULT_THEME: "dark"
};