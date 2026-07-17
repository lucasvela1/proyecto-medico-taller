import { useAuth } from "@/contexts/auth-context";
import { Familiar } from "@/data/familiares";
import { useFamiliares } from "@/hooks/use-familiares";
import { fichaShowRoute, ROUTES } from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { FamiliarCard } from "../Familiares/familiares";

export default function FavoritosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getFavoritos, toggleFavorito } = useFamiliares();

  // Si el usuario no está logueado, mostramos pantalla de login
  if (!user) {
    return (
      <View style={styles.screen}>
        <View style={styles.loginGateContainer}>
          <View style={styles.lockCircle}>
            <Ionicons name="lock-closed-outline" size={48} color="#5BA3E0" />
          </View>
          <Text style={styles.loginGateTitle}>Iniciá sesión</Text>
          <Text style={styles.loginGateSubtitle}>
            Necesitás iniciar sesión para ver y guardar tus favoritos.{"\n"}
            Los favoritos se sincronizan en tiempo real entre dispositivos.
          </Text>
          <Pressable
            onPress={() => router.push(ROUTES.AUTH_LOGIN as any)}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(ROUTES.AUTH_REGISTER as any)}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>
              ¿No tenés cuenta?{" "}
              <Text style={styles.registerLinkBold}>Registrate</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Usuario logueado: mostramos los favoritos (sincronizados en tiempo real)
  const favoritos: Familiar[] = getFavoritos();

  return (
    <View style={styles.screen}>
      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Favoritos</Text>
            <View style={styles.userBadge}>
              <Ionicons name="person-circle" size={16} color="#5BA3E0" />
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.syncBadge}>
                <Ionicons name="sync" size={12} color="#4ADE80" />
                <Text style={styles.syncText}>Tiempo real</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <FamiliarCard
            item={item}
            onPress={() => router.push(fichaShowRoute(item.id))}
            onToggleFavorito={() => toggleFavorito(item.id)}
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
              Los familiares que marques con un corazón aparecerán listados aquí
              para un acceso rápido.
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
    marginBottom: 8,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 13,
    color: "#8AA9C9",
    flex: 1,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  syncText: {
    fontSize: 11,
    color: "#4ADE80",
    fontWeight: "700",
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
  // Login gate
  loginGateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  lockCircle: {
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
  loginGateTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F4FAFF",
    marginBottom: 8,
  },
  loginGateSubtitle: {
    fontSize: 15,
    color: "#8AA9C9",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    width: "100%",
    maxWidth: 280,
    borderRadius: 12,
    backgroundColor: "#1D6FE0",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  registerLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  registerLinkText: {
    color: "#8AA9C9",
    fontSize: 15,
  },
  registerLinkBold: {
    color: "#5BA3E0",
    fontWeight: "800",
  },
});
