import { ImageSourcePropType } from "react-native";

export type ContactoEmergencia = {
  id: string;
  nombreApellido: string;
  relacion: string;
  numeroTel: string;
  direccion: string;
}; //Esto es un tipo para representar al contacto de emergencia, luego hacemos un arreglo de estos en familiar

export type ItemClinico = {
  id: string;
  nombre: string;
};

export type Familiar = {
  id: string;
  nombre: string;
  apellido: string;
  relacion: string;
  imagenUrl?: ImageSourcePropType;
  identidad?: {
    dni?: string;
    fechaNacimiento?: string;
    contactosEmergencia?: ContactoEmergencia[];
  };
  datosClinicos?: {
    grupoSanguineo?: string;
    alergias?: ItemClinico[];
    enfermedades?: ItemClinico[];
    medicamentos?: ItemClinico[];
    coberturaMedica?: string;
    numeroAfiliado?: string;
  };
  adicionales?: {
    peso?: string;
    altura?: string;
    dispositivosMedicos?: ItemClinico[];
    esDonante?: boolean;
    notas?: string;
  };
};
export const familiares: Familiar[] = [
  {
    id: "yo",
    nombre: "Lucas",
    apellido: "Vela",
    relacion: "Yo",
    imagenUrl: { uri: "https://picsum.photos/seed/yo/200/200" },
    identidad: {
      dni: "12345678",
      fechaNacimiento: "10/10/1995",
      contactosEmergencia: [
        {
          id: "ce-yo-001",
          nombreApellido: "Martin Gomez",
          relacion: "Contacto de Emergencia",
          numeroTel: "+54 11 5555-9999",
          direccion: "Av. Siempre Viva 123",
        },
      ],
    },
    datosClinicos: {
      grupoSanguineo: "O+",
      alergias: [{ id: "al-yo-001", nombre: "Polen" }],
      enfermedades: [],
      medicamentos: [],
      coberturaMedica: "Osde 310",
      numeroAfiliado: "12345678",
    },
    adicionales: {
      peso: "75 kg",
      altura: "1.80 m",
      dispositivosMedicos: [],
      esDonante: true,
      notas: "Usuario principal de la aplicación.",
    },
  },
  {
    id: "fam-001",
    nombre: "Lucia",
    apellido: "Gomez",
    relacion: "Madre",
    imagenUrl: require("../assets/images/LuciaImagen.png"),
    identidad: {
      dni: "23123456",
      fechaNacimiento: "15/07/1974",
      contactosEmergencia: [
        {
          id: "ce-001",
          nombreApellido: "Martin Gomez",
          relacion: "Esposo",
          numeroTel: "+54 11 5555-1200",
          direccion: "Av. Siempre Viva 123",
        },
      ],
    },
    datosClinicos: {
      grupoSanguineo: "A+",
      alergias: [{ id: "al-001", nombre: "Penicilina" }],
      enfermedades: [{ id: "en-001", nombre: "Hipertension" }],
      medicamentos: [{ id: "me-001", nombre: "Losartan 50 mg" }],
      coberturaMedica: "OSDE",
      numeroAfiliado: "123456789",
    },
    adicionales: {
      peso: "68 kg",
      altura: "1.64 m",
      dispositivosMedicos: [{ id: "dm-001", nombre: "Audifono" }],
      esDonante: true,
      notas: "Prefiere consultas por la manana.",
    },
  },
  {
    id: "fam-002",
    nombre: "Martin",
    apellido: "Gomez",
    relacion: "Padre",
    imagenUrl: { uri: "https://picsum.photos/seed/martin/200/200" },
    identidad: {
      dni: "20111222",
      fechaNacimiento: "03/12/1970",
      contactosEmergencia: [],
    },
    datosClinicos: {
      grupoSanguineo: "O+",
      alergias: [],
      enfermedades: [],
      medicamentos: [],
      coberturaMedica: "Swiss Medical",
      numeroAfiliado: "987654321",
    },
    adicionales: {
      peso: "80 kg",
      altura: "1.78 m",
      dispositivosMedicos: [],
      esDonante: false,
      notas: "Sin observaciones por el momento.",
    },
  },
  {
    id: "fam-003",
    nombre: "Carla",
    apellido: "Gomez",
    relacion: "Hermana",
    imagenUrl: { uri: "https://picsum.photos/seed/carla/200/200" },
    identidad: {
      dni: "40123456",
      fechaNacimiento: "21/03/2001",
      contactosEmergencia: [
        {
          id: "ce-003",
          nombreApellido: "Lucia Gomez",
          relacion: "Madre",
          numeroTel: "+54 11 5555-1300",
          direccion: "Av. Siempre Viva 123",
        },
      ],
    },
    datosClinicos: {
      grupoSanguineo: "B+",
      alergias: [{ id: "al-003", nombre: "Polen" }],
      enfermedades: [],
      medicamentos: [{ id: "me-003", nombre: "Loratadina" }],
      coberturaMedica: "Galeno",
      numeroAfiliado: "33445566",
    },
    adicionales: {
      peso: "57 kg",
      altura: "1.63 m",
      dispositivosMedicos: [],
      esDonante: true,
      notas: "Vegetariana. Prefiere turnos por la tarde.",
    },
  },
  {
    id: "fam-004",
    nombre: "Roberto",
    apellido: "Perez",
    relacion: "Abuelo",
    imagenUrl: { uri: "https://picsum.photos/seed/roberto/200/200" },
    identidad: {
      dni: "11222333",
      fechaNacimiento: "09/11/1945",
      contactosEmergencia: [
        {
          id: "ce-004",
          nombreApellido: "Elena Diaz",
          relacion: "Hermana",
          numeroTel: "+54 11 5555-1400",
          direccion: "Calle Mitre 456",
        },
      ],
    },
    datosClinicos: {
      grupoSanguineo: "AB-",
      alergias: [{ id: "al-004", nombre: "Yodo" }],
      enfermedades: [{ id: "en-004", nombre: "Diabetes tipo 2" }],
      medicamentos: [{ id: "me-004", nombre: "Metformina 850 mg" }],
      coberturaMedica: "PAMI",
      numeroAfiliado: "77889900",
    },
    adicionales: {
      peso: "74 kg",
      altura: "1.70 m",
      dispositivosMedicos: [{ id: "dm-004", nombre: "Baston" }],
      esDonante: false,
      notas: "Control cardiologico trimestral.",
    },
  },
  {
    id: "fam-005",
    nombre: "Elena",
    apellido: "Diaz",
    relacion: "Tia",
    imagenUrl: { uri: "https://picsum.photos/seed/elena/200/200" },
    identidad: {
      dni: "27111999",
      fechaNacimiento: "28/08/1980",
      contactosEmergencia: [
        {
          id: "ce-005",
          nombreApellido: "Roberto Perez",
          relacion: "Hermano",
          numeroTel: "+54 11 5555-1500",
          direccion: "Calle Mitre 456",
        },
      ],
    },
    datosClinicos: {
      grupoSanguineo: "O-",
      alergias: [],
      enfermedades: [{ id: "en-005", nombre: "Hipotiroidismo" }],
      medicamentos: [{ id: "me-005", nombre: "Levotiroxina 75 mcg" }],
      coberturaMedica: "Medife",
      numeroAfiliado: "55667788",
    },
    adicionales: {
      peso: "62 kg",
      altura: "1.66 m",
      dispositivosMedicos: [],
      esDonante: true,
      notas: "Antecedente de migranas ocasionales.",
    },
  },
];
