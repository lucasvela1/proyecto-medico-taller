//Estructura: users/{uid}/familiares/{familiarId}
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";

import { Familiar } from "@/data/familiares";
import { db } from "@/services/firebase";

//Devuelve un familiar sin el campo imagenUrl (no se sincroniza a Firestore por temas de espacio y planes, etc)
function familiarParaFirestore(familiar: Familiar): Record<string, any> {
  const { imagenUrl, ...sinImagen } = familiar;
  return sinImagen;
}

//Subcolección de familiares de un usuario
function familiaresCollection(uid: string) {
  return collection(db, "users", uid, "familiares");
}

//Documento específico de familiar
function familiarDoc(uid: string, familiarId: string) {
  return doc(db, "users", uid, "familiares", familiarId);
}

//Suscripción en tiempo real a los familiares de un usuario.
//Cada vez que se agrega, modifica o elimina un familiar en Firestore,
//se llama al callback con la lista completa actualizada.
//Esto permite el tiempo real, si otro dispositivo hace un cambio,
//este listener se dispara automáticamente.
export function suscribirFamiliaresFirestore(
  uid: string,
  callback: (familiares: Familiar[]) => void
): Unsubscribe {
  const colRef = familiaresCollection(uid);

  return onSnapshot(colRef, (snapshot) => {
    const familiares: Familiar[] = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Familiar[];
    callback(familiares);
  });
}

//Guarda o actualiza un familiar en Firestore.
export async function guardarFamiliarFirestore(
  uid: string,
  familiar: Familiar
): Promise<void> {
  const docRef = familiarDoc(uid, familiar.id);
  await setDoc(docRef, familiarParaFirestore(familiar), { merge: true });
}


export async function eliminarFamiliarFirestore(
  uid: string,
  familiarId: string
): Promise<void> {
  const docRef = familiarDoc(uid, familiarId);
  await deleteDoc(docRef);
}

//Sincronización inicial: sube los familiares locales a Firestore. Es cuando se logea por primera vez
export async function sincronizarDatosIniciales(
  uid: string,
  familiaresLocales: Familiar[]
): Promise<void> {
  const promesas = familiaresLocales.map((familiar) => {
    const docRef = familiarDoc(uid, familiar.id);
    return setDoc(docRef, familiarParaFirestore(familiar), { merge: true });
  });
  await Promise.all(promesas);
}
