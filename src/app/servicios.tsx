import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type Lugar = {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  tipo: "clinica" | "farmacia";
};

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "";

async function buscarLugaresCercanos(lat: number, lon: number): Promise<Lugar[]> {
  const url = "https://places.googleapis.com/v1/places:searchNearby"; //Places lo uso porque es la api para encontrar lugares
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": GOOGLE_API_KEY,
    "X-Goog-FieldMask": "places.id,places.displayName,places.location",
  };

  const bodyClinicas = {
    includedTypes: ["hospital", "medical_clinic", "medical_center"],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lon },
        radius: 5000.0, //Con esto mandamos a la api que nos devuelva 20 resultados de clinicas u hospitales en un rango de 5km
      },
    },
  };

  const bodyFarmacias = {
    includedTypes: ["pharmacy", "drugstore"],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lon },
        radius: 5000.0, //Idem arriba pero con farmacias
      },
    },
  };

  const [resClinicas, resFarmacias] = await Promise.all([
    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyClinicas),
    }),
    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyFarmacias),
    }),
  ]);

  const dataClinicas = await resClinicas.json();
  const dataFarmacias = await resFarmacias.json();

  if (!resClinicas.ok || !resFarmacias.ok) {
    const errorMsg =
      dataClinicas.error?.message ||
      dataFarmacias.error?.message ||
      "Error al consultar Places API (New)";
    throw new Error(`Google Places: ${errorMsg}`);
  }

  const clinicas = (dataClinicas.places || []).map((place: any) => ({
    id: place.id,
    nombre: place.displayName?.text || "Centro Médico",
    latitud: place.location?.latitude,
    longitud: place.location?.longitude,
    tipo: "clinica" as const,
  })).filter((c: Lugar) => c.latitud !== undefined && c.longitud !== undefined);

  const farmacias = (dataFarmacias.places || []).map((place: any) => ({
    id: place.id,
    nombre: place.displayName?.text || "Farmacia",
    latitud: place.location?.latitude,
    longitud: place.location?.longitude,
    tipo: "farmacia" as const,
  })).filter((f: Lugar) => f.latitud !== undefined && f.longitud !== undefined);

  return [...clinicas, ...farmacias];
}

type ServicioEmergencia = {
  id: string;
  nombre: string;
  numero: string;
  descripcion: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  bgLight: string;
};

const SERVICIOS_EMERGENCIA: ServicioEmergencia[] = [
  {
    id: "medicas",
    nombre: "Ambulancia (SAME)",
    numero: "107",
    descripcion: "Urgencias médicas",
    iconName: "medical",
    color: "#27AE60",
    bgLight: "#122E1F",
  },
  {
    id: "bomberos",
    nombre: "Bomberos",
    numero: "100",
    descripcion: "Incendios y rescate",
    iconName: "flame",
    color: "#EB5757",
    bgLight: "#3B1818",
  },
  {
    id: "policia",
    nombre: "Policía",
    numero: "911",
    descripcion: "Emergencias policiales",
    iconName: "shield-half",
    color: "#2F80ED",
    bgLight: "#102A4D",
  },
  {
    id: "defensa",
    nombre: "Defensa Civil",
    numero: "103",
    descripcion: "Siniestros y prevención",
    iconName: "alert-circle",
    color: "#F2994A",
    bgLight: "#3B2716",
  },
];

const llamarServicio = (numero: string) => {
  Linking.openURL(`tel:${numero}`).catch((err) =>
    console.warn("No se pudo iniciar la llamada telefónica:", err)
  );
};

export default function ServiciosScreen() {
  const [ubicacion, setUbicacion] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permiso de ubicación denegado.");
        setCargando(false);
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({});
        setUbicacion(loc);

        const lat = loc.coords.latitude;
        const lon = loc.coords.longitude;

        try {
          // Intentamos buscar lugares reales con Google Places API
          const lugaresReales = await buscarLugaresCercanos(lat, lon);
          setLugares(lugaresReales);
        } catch (apiError: any) {
          // Si falla (por ejemplo, por CORS en la web, falta de facturación o clave restringida),
          // mostramos un aviso y usamos datos simulados para no interrumpir la experiencia.
          console.warn("Fallo al consultar Google Places API:", apiError.message);
          setInfoMsg(
            "Nota: Mostrando datos simulados debido a restricciones de Google Places API (ej. facturación no activa o CORS en entorno web)."
          );

          const lugaresCercanos: Lugar[] = [
            {
              id: "1",
              nombre: "Clínica Privada del Sol (Simulado)",
              latitud: lat + 0.003,
              longitud: lon + 0.002,
              tipo: "clinica",
            },
            {
              id: "2",
              nombre: "Hospital de la Comunidad (Simulado)",
              latitud: lat - 0.004,
              longitud: lon + 0.005,
              tipo: "clinica",
            },
            {
              id: "3",
              nombre: "Farmacia San Martín (Simulado)",
              latitud: lat + 0.001,
              longitud: lon - 0.003,
              tipo: "farmacia",
            },
            {
              id: "4",
              nombre: "Farmacia Nueva Era (Simulado)",
              latitud: lat - 0.002,
              longitud: lon - 0.002,
              tipo: "farmacia",
            },
          ];
          setLugares(lugaresCercanos);
        }
      } catch (error) {
        setErrorMsg("No se pudo obtener la ubicación actual.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Servicios",
          headerShown: true,
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sección de Emergencias */}
        <View style={styles.emergenciasHeader}>
          <Text style={styles.title}>Emergencias</Text>
          <Text style={styles.subtitle}>
            Presiona cualquier servicio para llamar de forma rápida y directa.
          </Text>
        </View>

        <View style={styles.grid}>
          {SERVICIOS_EMERGENCIA.map((serv) => (
            <TouchableOpacity
              key={serv.id}
              style={[
                styles.card,
                { borderColor: serv.color, backgroundColor: serv.bgLight },
              ]}
              onPress={() => llamarServicio(serv.numero)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Ionicons name={serv.iconName} size={22} color={serv.color} />
                <Text style={[styles.cardTitle, { color: serv.color }]}>
                  {serv.nombre}
                </Text>
              </View>
              <Text style={styles.cardDesc} numberOfLines={1}>
                {serv.descripcion}
              </Text>
              <View style={styles.phoneContainer}>
                <Ionicons name="call" size={14} color="#EAF4FF" />
                <Text style={styles.phoneNumber}>{serv.numero}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección de Clínicas y Farmacias */}
        <View style={styles.header}>
          <Text style={styles.title}>Clínicas y Farmacias</Text>
          <Text style={styles.subtitle}>
            Encuentra centros médicos y farmacias cercanas a tu posición.
          </Text>
          {infoMsg && (
            <Text style={styles.infoText}>
              {infoMsg}
            </Text>
          )}
        </View>

        {/* Leyenda del Mapa */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <Ionicons name="location-sharp" size={18} color="#FF3B30" />
            <Text style={styles.legendText}>Clínicas y Hospitales</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="location-sharp" size={18} color="#8cec0df1" />
            <Text style={styles.legendText}>Farmacias</Text>
          </View>
        </View>

        <View style={styles.mapContainer}>
          {cargando ? (
            <ActivityIndicator size="large" color="#EAF4FF" />
          ) : errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : ubicacion ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: ubicacion.coords.latitude,
                longitude: ubicacion.coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              showsUserLocation={true}
            >
              {lugares.map((lugar) => (
                <Marker
                  key={lugar.id}
                  coordinate={{
                    latitude: lugar.latitud,
                    longitude: lugar.longitud,
                  }}
                  title={lugar.nombre}
                  description={
                    lugar.tipo === "clinica" ? "Clínica / Hospital" : "Farmacia"
                  }
                  pinColor={lugar.tipo === "clinica" ? "red" : "green"}
                />
              ))}
            </MapView>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
  },
  scrollContent: {
    paddingBottom: 90,
  },
  header: {
    padding: 20,
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#EAF4FF",
  },
  subtitle: {
    fontSize: 15,
    color: "#C7DAF0",
  },
  infoText: {
    marginTop: 10,
    fontSize: 13,
    color: "#FFB020",
    backgroundColor: "#2B1E00",
    borderColor: "#A36B00",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    lineHeight: 18,
  },
  mapContainer: {
    height: 400,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emergenciasHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 10,
  },
  card: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    justifyContent: "space-between",
    minHeight: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    flexShrink: 1,
  },
  cardDesc: {
    fontSize: 11,
    color: "#A2C3EC",
    marginVertical: 4,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  phoneNumber: {
    color: "#EAF4FF",
    fontSize: 14,
    fontWeight: "bold",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    backgroundColor: "rgba(23, 56, 103, 0.4)",
    borderColor: "#4B79B6",
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    color: "#C7DAF0",
    fontSize: 13,
    fontWeight: "600",
  },
});
