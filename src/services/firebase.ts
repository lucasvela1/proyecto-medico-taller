import { initializeApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence existe en el bundle pero los tipos de TS no lo exportan (bug conocido del SDK)
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

//Validamos que este bien configurado antes que nada (apis keys y eso)
const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "";

let app: any;
let auth: any;
let db: any;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    db = getFirestore(app);
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
  }
} else {
  console.warn(
    "Las credenciales de Firebase no están configuradas en el archivo .env.\n" +
    "La app continuará en modo local sin conexión remota (tiempo real y login desactivados)."
  );
}

export { app, auth, db, isConfigured };
