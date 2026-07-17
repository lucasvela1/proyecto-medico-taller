import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

import { auth, isConfigured } from "@/services/firebase";

//Tipo del contexto de autenticación
type AuthContextType = {
  user: User | null; //Usuario actual de Firebase (o null si no está logueado)
  loading: boolean; //true mientras se carga el estado inicial de auth
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => { },
  signIn: async () => { },
  signOut: async () => { },
});

//Hook para acceder al contexto de autenticación desde cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}

//Provider que envuelve toda la app y provee el estado de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  //Registrar un usuario nuevo con email y contraseña
  const signUp = async (email: string, password: string) => {
    if (!isConfigured || !auth) throw new Error("Firebase no está configurado");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  //Iniciar sesión con email y contraseña
  const signIn = async (email: string, password: string) => {
    if (!isConfigured || !auth) throw new Error("Firebase no está configurado");
    await signInWithEmailAndPassword(auth, email, password);
  };

  //Cerrar sesión
  const signOut = async () => {
    if (!isConfigured || !auth) throw new Error("Firebase no está configurado");
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
