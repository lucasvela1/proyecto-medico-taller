import { Familiar, familiares } from "@/data/familiares";
import { fichaShowRoute } from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function FamiliaresScreen() {
  const router = useRouter();
  const [texto, setTexto] = useState("");

  const filtro = texto.trim().toLowerCase();
  const familiaresFiltrados = familiares.filter((familiar) => {
    const nombreCompleto =
      `${familiar.nombre} ${familiar.apellido}`.toLowerCase();
    return nombreCompleto.includes(filtro);
  });

  return (
    <View style={styles.screen}>
      <FlatList
        data={familiaresFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Pressable
              onPress={() => {
                // Placeholder for future navigation to create familiar screen.
              }}
              style={({ pressed }) => [
                styles.addCard,
                pressed && styles.addCardPressed,
              ]}
            >
              <Text style={styles.addSign}>+</Text>
              <Text style={styles.addText}>Agregar familiar</Text>
            </Pressable>

            <Text style={styles.title}>Familiares</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre y apellido"
              placeholderTextColor="#5A6A7C"
              value={texto}
              onChangeText={setTexto}
              returnKeyType="search"
            />
          </>
        }
        renderItem={({ item }) => (
          <FamiliarCard
            item={item}
            onPress={() => router.push(fichaShowRoute(item.id))}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron familiares</Text>
        }
      />
    </View>
  );
}

function FamiliarCard({
  item,
  onPress,
}: {
  item: Familiar;
  onPress: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item.imagenUrl]);

  const shouldShowFallback = !item.imagenUrl || imageError;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {shouldShowFallback ? (
        <View style={styles.avatarFallback}>
          <Ionicons name="person" size={26} color="#EAF4FF" />
        </View>
      ) : (
        <Image
          source={item.imagenUrl}
          style={styles.avatarImage}
          onError={() => setImageError(true)}
        />
      )}

      <View style={styles.cardTextBlock}>
        <Text style={styles.nameText}>
          {item.nombre} {item.apellido}
        </Text>
        <Text style={styles.relationText}>{item.relacion}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  addCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    marginBottom: 18,
  },
  addCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  addSign: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F4FAFF",
    marginTop: -2,
  },
  addText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F4FAFF",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F4FAFF",
    marginBottom: 14,
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#F4FAFF",
    marginBottom: 16,
  },
  separator: {
    height: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
  cardTextBlock: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F4FAFF",
  },
  relationText: {
    marginTop: 4,
    fontSize: 15,
    color: "#F4FAFF",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
    color: "#52606D",
  },
});
