import { familiares } from "@/app/data/familiares";
import {
  adicionalesRoute,
  datosClinicosRoute,
  identidadRoute,
} from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function FamiliarDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [imageError, setImageError] = useState(false);

  const familiar = familiares.find((item) => item.id === id);

  useEffect(() => {
    setImageError(false);
  }, [familiar?.imagenUrl]);

  if (!familiar) {
    return (
      <View style={styles.screen}>
        <Text style={styles.notFoundText}>Familiar no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => {
            // Lo dejo sin hacer nada para cuando se explique en clase como manejar la camara y almacenamiento interno
          }}
          style={({ pressed }) => [
            styles.avatarPressable,
            pressed && styles.avatarPressed,
          ]}
        >
          {!familiar.imagenUrl || imageError ? (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={30} color="#EAF4FF" />
            </View>
          ) : (
            <Image
              source={familiar.imagenUrl}
              style={styles.avatarImage}
              onError={() => setImageError(true)}
            />
          )}
        </Pressable>

        <Text style={styles.title}>
          {familiar.nombre} {familiar.apellido}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        <Pressable
          onPress={() => router.push(identidadRoute(familiar.id))}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <Text style={styles.menuText}>Identidad y contacto</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(datosClinicosRoute(familiar.id))}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <Text style={styles.menuText}>Datos clinicos importantes</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(adicionalesRoute(familiar.id))}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <Text style={styles.menuText}>Adicionales</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.alertButton,
          pressed && styles.alertButtonPressed,
        ]}
      >
        <Text style={styles.alertText}>Alerta familiar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
    padding: 16,
    paddingTop: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarPressable: {
    borderRadius: 34,
  },
  avatarPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
  title: {
    flexShrink: 1,
    fontSize: 30,
    fontWeight: "800",
    color: "#F4FAFF",
  },
  menuContainer: {
    marginTop: 24,
    gap: 80,
  },
  menuButton: {
    minHeight: 112,
    borderRadius: 14,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  menuButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  menuText: {
    color: "#F4FAFF",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  alertButton: {
    marginTop: 62,
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: "#B42318",
    justifyContent: "center",
    alignItems: "center",
  },
  alertButtonPressed: {
    opacity: 0.92,
  },
  alertText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7A8795",
    textAlign: "center",
    marginTop: 40,
  },
});
