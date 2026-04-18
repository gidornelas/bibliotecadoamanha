/**
 * Shared Configuration for Biblioteca do Amanhã
 * Centralized Firebase and Supabase configuration
 * Import this file before your app script
 */

// Firebase Configuration
export const firebaseConfig = {
    apiKey: "AIzaSyA6cx6vGuJHzohRyr-uda_gI7_MavD_OmU",
    authDomain: "biblioteca-do-amanha.firebaseapp.com",
    projectId: "biblioteca-do-amanha",
    storageBucket: "biblioteca-do-amanha.firebasestorage.app",
    messagingSenderId: "39485326387",
    appId: "1:39485326387:web:84c1e13522efa7cbb1cf46"
};

// Supabase Configuration
export const supabaseConfig = {
    url: 'https://sasnmejcbjvoupxqicff.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc25tZWpjYmp2b3VweHFpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDAzMTQsImV4cCI6MjA5MDk3NjMxNH0.GF3AgdBMegRdYKP5bUMO7WwjfEDPbOHMzDHrQHoszts',
    bucket: 'biblioteca-epubs'
};

// Cover proxy configuration
export const COVER_PROXY_BASE_URL = window.coverProxyBaseUrl || 'https://biblioteca-do-amanha.vercel.app/api/cover';

/**
 * Get available cover proxy base URLs
 * @returns {string[]} Array of proxy URLs to try
 */
export function getCoverProxyBases() {
    const fromConfig = String(window.coverProxyBaseUrl || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);

    const sameOriginBase = (window.location?.origin && /^https?:/i.test(window.location.origin))
        ? `${window.location.origin}/api/cover`
        : '';

    const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location?.hostname || '');
    const localDevBase = isLocalHost ? 'http://localhost:8787/cover' : '';

    return [...new Set([...fromConfig, sameOriginBase, localDevBase].filter(Boolean))];
}

/**
 * Check if Supabase config is ready
 * @returns {boolean}
 */
export function isSupabaseConfigReady() {
    return Boolean(
        supabaseConfig.url &&
        !supabaseConfig.url.includes('SEU-PROJETO') &&
        supabaseConfig.anonKey &&
        !supabaseConfig.anonKey.includes('SUA_ANON_KEY')
    );
}

/**
 * Ensure Supabase client is initialized
 * @returns {Promise<Object|null>}
 */
export async function ensureSupabaseClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (!isSupabaseConfigReady()) return null;

    for (let i = 0; i < 20; i += 1) {
        const supabaseLib = window.supabase || globalThis.supabase;
        if (supabaseLib?.createClient) {
            window.supabaseClient = supabaseLib.createClient(supabaseConfig.url, supabaseConfig.anonKey);
            return window.supabaseClient;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
}

/**
 * Initialize Firebase and expose to window
 * @param {Object} imports - Firebase imports
 * @returns {Object} Firebase app instance
 */
export async function initializeFirebase(imports) {
    const {
        initializeApp,
        getFirestore,
        doc,
        getDoc,
        setDoc,
        enableIndexedDbPersistence,
        onSnapshot,
        getAuth,
        signInWithEmailAndPassword,
        sendPasswordResetEmail,
        setPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
        signOut,
        onAuthStateChanged
    } = imports;

    try {
        // Initialize Firebase App
        const app = initializeApp(firebaseConfig);

        // Initialize Firestore
        const db = getFirestore(app);
        enableIndexedDbPersistence(db).catch((error) => {
            console.warn('Persistência offline não ativada:', error.code);
        });

        // Initialize Auth
        const auth = getAuth(app);

        // Expose to window for backward compatibility
        window.FirebaseApp = app;
        window.db = db;
        window.auth = auth;
        window.doc = doc;
        window.getDoc = getDoc;
        window.setDoc = setDoc;
        window.onSnapshot = onSnapshot;
        window.signInWithEmailAndPassword = signInWithEmailAndPassword;
        window.sendPasswordResetEmail = sendPasswordResetEmail;
        window.setPersistence = setPersistence;
        window.browserLocalPersistence = browserLocalPersistence;
        window.browserSessionPersistence = browserSessionPersistence;
        window.signOut = signOut;
        window.onAuthStateChanged = onAuthStateChanged;

        // Expose configs to window
        window.supabaseConfig = supabaseConfig;
        window.supabaseBucket = supabaseConfig.bucket;
        window.supabaseClient = null;
        window.supabaseConfigReady = isSupabaseConfigReady();
        window.ensureSupabaseClient = ensureSupabaseClient;
        window.getCoverProxyBases = getCoverProxyBases;
        window.coverProxyBaseUrl = window.coverProxyBaseUrl || COVER_PROXY_BASE_URL;

        // Helper: get auth headers
        window.getAuthHeaders = async function() {
            const token = await auth?.currentUser?.getIdToken?.();
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        };

        console.log('✅ Firebase conectado com sucesso!');
        return app;
    } catch (error) {
        console.warn('⚠️ Firebase não configurado. Usando apenas localStorage.', error);
        window.db = null;
        window.auth = null;
        return null;
    }
}

// Export configs as defaults
export default {
    firebaseConfig,
    supabaseConfig,
    COVER_PROXY_BASE_URL,
    getCoverProxyBases,
    isSupabaseConfigReady,
    ensureSupabaseClient,
    initializeFirebase
};
