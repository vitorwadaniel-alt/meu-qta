// src/qta/services/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// CONFIGURAÇÃO FIREBASE – usa variáveis de ambiente ou valores padrão
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyD6g5EP72i5KmisxnxeYqDV7YD-4uiTPX8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "meu-qta.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "meu-qta",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "meu-qta.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "164986613204",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:164986613204:web:bd5c0b500c2b8f529eba41",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-JTKDJLQBDZ",
};

// Evita erro de "Firebase App named '[DEFAULT]' already exists" no hot-reload do Vite
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Verificar se deve usar emuladores ANTES de criar auth e db
const useEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true';

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Conectar aos emuladores apenas se explicitamente habilitado
// IMPORTANTE: Deve ser chamado ANTES de qualquer operação com auth ou db
if (useEmulators) {
  try {
    // Conectar Auth Emulator (ignora erro se já conectado)
    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    } catch (authError) {
      // Ignorar se já estiver conectado
      if (!authError.message?.includes('already')) {
        throw authError;
      }
    }
    
    // Conectar Firestore Emulator (ignora erro se já conectado)
    try {
      connectFirestoreEmulator(db, "localhost", 8080);
    } catch (firestoreError) {
      if (!firestoreError.message?.includes('already')) {
        throw firestoreError;
      }
    }

    // Conectar Functions Emulator (para denyUser em dev; região igual à da callable)
    try {
      const functions = getFunctions(firebaseApp, "southamerica-east1");
      connectFunctionsEmulator(functions, "localhost", 5001);
    } catch (fnError) {
      if (!fnError.message?.includes('already')) {
        throw fnError;
      }
    }
    
    console.log("✅ Conectado aos emuladores do Firebase (Auth: 9099, Firestore: 8080, Functions: 5001)");
  } catch (error) {
    console.warn("⚠️ Não foi possível conectar aos emuladores:", error.message);
    console.warn("   Certifique-se de que 'firebase emulators:start' está rodando.");
  }
}

// ID fixo do "contexto" do app (você já usa isso no código)
export const appId = "sistema-qta-web";

// Provedor Google para login social (configurar no Firebase Console > Authentication > Sign-in method)
export const googleAuthProvider = new GoogleAuthProvider();
