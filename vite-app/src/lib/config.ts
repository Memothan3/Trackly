const firebase = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBx4p7qeMrVMkcTGCCleWszuc7T6Vd1_1Q",
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "rubys-3ca51.firebaseapp.com",
	databaseURL:
		import.meta.env.VITE_FIREBASE_DATABASE_URL ??
		"https://rubys-3ca51-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "rubys-3ca51",
	storageBucket:
		import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "rubys-3ca51.firebasestorage.app",
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "185377540674",
	appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:185377540674:web:ff7fa3c28018519615bbdb",
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-8ETP2RL6V2",
} as const

export const tracklyConfig = {
	appName: import.meta.env.VITE_APP_NAME ?? "Trackly",
	defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY ?? "USD",
	legacyAppUrl: import.meta.env.VITE_LEGACY_APP_URL ?? "same",
	supabaseUrl:
		import.meta.env.VITE_SUPABASE_URL ?? "https://kkokfrkfffxlousawivj.supabase.co",
	supabaseAnonKey:
		import.meta.env.VITE_SUPABASE_ANON_KEY ??
		"sb_publishable_ci4FPaMp4BhuoTMftaTgBQ_H00cny3I",
	firebase,
} as const
