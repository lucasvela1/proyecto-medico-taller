import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import {
  Familiar,
  familiares as familiaresLocales,
  guardarFamiliaresEnAlmacenamiento,
  imagenesCache,
  notificarCambioFamiliares,
  suscribirFamiliares,
} from "@/data/familiares";
import { isConfigured } from "@/services/firebase";
import {
  eliminarFamiliarFirestore,
  guardarFamiliarFirestore,
  sincronizarDatosIniciales,
  suscribirFamiliaresFirestore,
} from "@/services/firestore-familiares";

export function useFamiliares() {
  const { user } = useAuth();
  const [familiaresState, setFamiliaresState] = useState<Familiar[]>([
    ...familiaresLocales,
  ]);
  const [cargando, setCargando] = useState(false);
  const [sincronizado, setSincronizado] = useState(false);

  useEffect(() => {
    // Función auxiliar para combinar datos de familiares con sus imágenes de la caché
    const combinarConImagenes = (remotos: Familiar[]) => {
      return remotos.map((remoto) => {
        const cachedImage = imagenesCache.get(remoto.id);
        return cachedImage
          ? { ...remoto, imagenUrl: cachedImage }
          : remoto;
      });
    };

    if (user && isConfigured) {
      //si esta loggeado
      setCargando(true);
      let primeraCarga = true;
      let latestRemoto: Familiar[] = [];

      //Se pone a escuchar cambios locales
      const unsubscribeLocal = suscribirFamiliares(() => {
        const combinado = combinarConImagenes(latestRemoto);
        setFamiliaresState(combinado);
      });

      //Escucha los cambios de la base de datos remota
      const unsubscribeFirestore = suscribirFamiliaresFirestore(
        user.uid,
        (familiaresRemoto) => {
          latestRemoto = familiaresRemoto;
          if (primeraCarga && familiaresRemoto.length === 0 && !sincronizado) {
            //Primera vez que se loguea y no tiene datos en Firestore:
            //subimos los datos locales
            sincronizarDatosIniciales(user.uid, familiaresLocales)
              .then(() => {
                setSincronizado(true);
              })
              .catch(console.error);
          } else {
            const combinado = combinarConImagenes(familiaresRemoto);
            setFamiliaresState(combinado);
            familiaresLocales.length = 0;
            familiaresLocales.push(...combinado);
            notificarCambioFamiliares();
          }
          primeraCarga = false;
          setCargando(false);
        }
      );

      return () => {
        unsubscribeLocal();
        unsubscribeFirestore();
      };
    } else {
      //Sin loggear
      setFamiliaresState([...familiaresLocales]);

      const unsubscribe = suscribirFamiliares(() => {
        setFamiliaresState([...familiaresLocales]);
      });

      return unsubscribe;
    }
  }, [user]);

  //Obtener familiares sin "yo"
  const getFamiliaresSinYo = () => {
    return familiaresState.filter((f) => f.id !== "yo");
  };

  //Obtener solo favoritos (sin "yo")
  const getFavoritos = () => {
    return familiaresState.filter(
      (f) =>
        f.id !== "yo" &&
        (f.esFavorito === true || (f.esFavorito as any) === "true")
    );
  };

  //marcar o desmarcar favorito
  const toggleFavorito = async (id: string) => {
    const familiar = familiaresLocales.find((f) => f.id === id);
    if (!familiar) return;

    const actualmenteFav =
      familiar.esFavorito === true || (familiar.esFavorito as any) === "true";
    familiar.esFavorito = !actualmenteFav;

    //Actualizar UI inmediatamente
    notificarCambioFamiliares();

    if (user && isConfigured) {
      //Se guarda en Firestore si estamos logeados
      await guardarFamiliarFirestore(user.uid, familiar);
    } else {
      //Se guarda solo en AsyncStorage si no
      guardarFamiliaresEnAlmacenamiento();
    }
  };

  //Agregar un nuevo familiar
  const agregarFamiliar = async (familiar: Familiar) => {
    familiaresLocales.push(familiar);
    notificarCambioFamiliares();

    if (user && isConfigured) {
      await guardarFamiliarFirestore(user.uid, familiar); //idem arriba, si se esta logeado se guarda remoto
    } else {
      guardarFamiliaresEnAlmacenamiento();
    }
  };

  //Eliminar un familiar
  const eliminarFamiliar = async (id: string) => {
    const idx = familiaresLocales.findIndex((f) => f.id === id);
    if (idx !== -1) familiaresLocales.splice(idx, 1);
    notificarCambioFamiliares();

    if (user && isConfigured) {
      await eliminarFamiliarFirestore(user.uid, id);
    } else {
      guardarFamiliaresEnAlmacenamiento();
    }
  };

  //Actualizar un familiar existente
  const actualizarFamiliar = async (familiar: Familiar) => {
    const idx = familiaresLocales.findIndex((f) => f.id === familiar.id);
    if (idx !== -1) {
      familiaresLocales[idx] = familiar;
    }
    notificarCambioFamiliares();

    if (user && isConfigured) {
      await guardarFamiliarFirestore(user.uid, familiar);
    } else {
      guardarFamiliaresEnAlmacenamiento();
    }
  };

  return {
    familiares: familiaresState,
    cargando,
    getFamiliaresSinYo,
    getFavoritos,
    toggleFavorito,
    agregarFamiliar,
    eliminarFamiliar,
    actualizarFamiliar,
    estaLogueado: !!user,
  };
}
