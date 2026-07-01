import { useEffect, useState } from "react";
import { cargarFamiliaresDeAlmacenamiento } from "@/data/familiares";

export function useInitializeFamiliares() {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await cargarFamiliaresDeAlmacenamiento();
      } catch (e) {
        console.error("Fallo al inicializar la base de datos local:", e);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return cargando;
}
