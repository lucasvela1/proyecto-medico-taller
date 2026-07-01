import {
  Familiar,
  familiares,
  guardarFamiliaresEnAlmacenamiento,
  notificarCambioFamiliares,
  suscribirFamiliares,
} from "@/data/familiares";
import { fichaShowRoute } from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { FamiliarCard } from "../Familiares/familiares";

function getFavoritos(): Familiar[] {
  return familiares.filter(
    (f) => f.id !== "yo" && (f.esFavorito === true || f.esFavorito === "true")
  );
}

export default function FavoritosScreen() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<Familiar[]>(getFavoritos);

  useEffect(() => {
    const desuscribir = suscribirFamiliares(() => {
      setFavoritos(getFavoritos());
    });
    return desuscribir;
  }, []);

  return (
    <View style={styles.screen}>
      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.title}>Favoritos</Text>}
        renderItem={({ item }) => (
          <FamiliarCard
            item={item}
            onPress={() => router.push(fichaShowRoute(item.id))}
            onToggleFavorito={() => {
              const actualmenteFav = item.esFavorito === true || item.esFavorito === "true";
              item.esFavorito = !actualmenteFav;
              notificarCambioFamiliares(); // UI actualiza al instante
              guardarFamiliaresEnAlmacenamiento(); // Persiste en background
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.heartCircle}>
              <Ionicons name="heart-outline" size={48} color="#EB5757" />
            </View>
            <Text style={styles.emptyTitle}>Sin favoritos</Text>
            <Text style={styles.emptySubtitle}>
              Los familiares que marques con un corazón aparecerán listados aquí para un acceso rápido.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
  },
  listContent: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F4FAFF",
    marginBottom: 20,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 64,
  },
  heartCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#173867",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4B79B6",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F4FAFF",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#8AA9C9",
    textAlign: "center",
    lineHeight: 22,
  },
});
