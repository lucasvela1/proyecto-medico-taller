import { useEffect, useState } from "react";
import { suscribirFamiliares } from "@/data/familiares";

export function useFamiliaresReactive() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const desuscribir = suscribirFamiliares(() => {
      setVersion((v) => v + 1);
    });
    return desuscribir;
  }, []);

  return version;
}
