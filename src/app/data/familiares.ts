import type { ImageSourcePropType } from "react-native";

export type Familiar = {
  id: string;
  nombre: string;
  apellido: string;
  relacion: string;
  imagenUrl?: String;
};
export const familiares: Familiar[] = [
  {
    id: "fam-001",
    nombre: "Lucia",
    apellido: "Gomez",
    relacion: "Madre",
    imagenUrl: "@/assets/images/LuciaImagen.png",
  },
  {
    id: "fam-002",
    nombre: "Martin",
    apellido: "Gomez",
    relacion: "Padre",
    imagenUrl: { uri: "https://picsum.photos/seed/martin/200/200" },
  },
  {
    id: "fam-003",
    nombre: "Carla",
    apellido: "Gomez",
    relacion: "Hermana",
  },
  {
    id: "fam-004",
    nombre: "Roberto",
    apellido: "Perez",
    relacion: "Abuelo",
  },
  {
    id: "fam-005",
    nombre: "Elena",
    apellido: "Diaz",
    relacion: "Tia",
  },
];
