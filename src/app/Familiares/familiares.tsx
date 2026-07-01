import { Familiar, familiares, guardarFamiliaresEnAlmacenamiento, notificarCambioFamiliares, suscribirFamiliares } from "@/data/familiares";
import { crearFamiliarRoute, fichaShowRoute } from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function getFamiliaresSinYo(): Familiar[] {
  return familiares.filter((f) => f.id !== "yo");
}

export default function FamiliaresScreen() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [todosLosFamiliares, setTodosLosFamiliares] = useState<Familiar[]>(getFamiliaresSinYo);

  useEffect(() => {
    const desuscribir = suscribirFamiliares(() => {
      setTodosLosFamiliares(getFamiliaresSinYo());
    });
    return desuscribir;
  }, []);

  const filtro = texto.trim().toLowerCase();
  const familiaresFiltrados = filtro
    ? todosLosFamiliares.filter((f) =>
        `${f.nombre} ${f.apellido}`.toLowerCase().includes(filtro)
      )
    : todosLosFamiliares;

  return (
    <View style={styles.screen}>
      <FlatList
        data={familiaresFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Pressable
              onPress={() => router.push(crearFamiliarRoute())}
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
            onToggleFavorito={() => {
              const actualmenteFav = item.esFavorito === true || item.esFavorito === "true";
              item.esFavorito = !actualmenteFav;
              notificarCambioFamiliares();
              guardarFamiliaresEnAlmacenamiento();
            }}
            onEliminar={() => {
              const idx = familiares.findIndex((f) => f.id === item.id);
              if (idx !== -1) familiares.splice(idx, 1);
              notificarCambioFamiliares();
              guardarFamiliaresEnAlmacenamiento();
            }}
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

export function FamiliarCard({
  item,
  onPress,
  onToggleFavorito,
  onEliminar,
}: {
  item: Familiar;
  onPress: () => void;
  onToggleFavorito?: () => void;
  onEliminar?: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item.imagenUrl]);

  const shouldShowFallback = !item.imagenUrl || imageError;

  return (
    <>
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

        <View style={styles.cardActions}>
          {onToggleFavorito && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorito();
              }}
              style={styles.actionButton}
            >
              <Ionicons
                name={(item.esFavorito === true || item.esFavorito === "true") ? "heart" : "heart-outline"}
                size={24}
                color={(item.esFavorito === true || item.esFavorito === "true") ? "#EB5757" : "#8AA9C9"}
              />
            </Pressable>
          )}
          {onEliminar && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                setConfirmVisible(true);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={22} color="#C0392B" />
            </Pressable>
          )}
        </View>
      </Pressable>

      {/* Modal de confirmación de borrado */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable style={styles.confirmOverlay} onPress={() => setConfirmVisible(false)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="trash" size={30} color="#E74C3C" />
            </View>
            <Text style={styles.confirmTitle}>¿Eliminar familiar?</Text>
            <Text style={styles.confirmMessage}>
              Se eliminará a{" "}
              <Text style={{ fontWeight: "800", color: "#F0F8FF" }}>
                {item.nombre} {item.apellido}
              </Text>
              {" "}de tu lista. Esta acción no se puede deshacer.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                style={({ pressed }) => [styles.confirmCancel, pressed && styles.confirmPressed]}
              >
                <Text style={styles.confirmCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setConfirmVisible(false);
                  onEliminar?.();
                }}
                style={({ pressed }) => [styles.confirmDelete, pressed && styles.confirmPressed]}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.confirmDeleteText}>Eliminar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  // Confirmation modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(4, 13, 26, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#112240",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A4E7C",
    padding: 28,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  confirmIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(231, 76, 60, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F0F8FF",
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 15,
    color: "#A8C8E8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 6,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  confirmCancel: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmCancelText: {
    color: "#EAF4FF",
    fontWeight: "700",
    fontSize: 15,
  },
  confirmDelete: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#7A1F1A",
    borderWidth: 1,
    borderColor: "#B84040",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  confirmPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
