import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Stack } from "expo-router";

type Lugar = {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  tipo: "clinica" | "farmacia";
};

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "";

async function buscarLugaresCercanos(lat: number, lon: number): Promise<Lugar[]> {
  const url = "https://places.googleapis.com/v1/places:searchNearby";
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
        radius: 5000.0,
      },
    },
  };

  const bodyFarmacias = {
    includedTypes: ["pharmacy", "drugstore"],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lon },
        radius: 5000.0,
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
    paddingBottom: 24,
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
});
