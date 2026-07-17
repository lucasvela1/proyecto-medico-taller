import { useAuth } from "@/contexts/auth-context";
import { useFamiliares } from "@/hooks/use-familiares";
import { ROUTES } from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function CuentaScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { familiares } = useFamiliares();

  const [imageError, setImageError] = useState(false);

  //Buscamos el perfil del usuario principal ("Yo")
  const familiarYo = familiares.find((f) => f.id === "yo");
  const imagenYo = familiarYo?.imagenUrl;

  if (!user) {
    return (
      <View style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            {!imagenYo || imageError ? (
              <Ionicons name="person-circle-outline" size={80} color="#5BA3E0" />
            ) : (
              <Image
                source={imagenYo}
                style={styles.avatarImage}
                onError={() => setImageError(true)}
              />
            )}
          </View>
          <Text style={styles.title}>Mi Cuenta</Text>
          <Text style={styles.subtitle}>
            Iniciá sesión para poder guardar tus favoritos y sincronizar tus datos médicos en tiempo real entre múltiples dispositivos.
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
              ¿No tenés cuenta? <Text style={styles.registerLinkBold}>Registrate</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.iconCircleSuccess}>
          {!imagenYo || imageError ? (
            <Ionicons name="person-circle" size={80} color="#4ADE80" />
          ) : (
            <Image
              source={imagenYo}
              style={styles.avatarImage}
              onError={() => setImageError(true)}
            />
          )}
        </View>
        <Text style={styles.title}>Mi Cuenta</Text>

        <View style={styles.accountCard}>
          <Text style={styles.cardLabel}>Sesión iniciada como</Text>
          <Text style={styles.cardValue} numberOfLines={1}>{user.email}</Text>

        </View>

        <Pressable
          onPress={async () => {
            try {
              await signOut();
            } catch (e) {
              console.error("Error al cerrar sesión:", e);
            }
          }}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircleSuccess: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#112240",
    borderWidth: 1,
    borderColor: "#2A4E7C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F4FAFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#8AA9C9",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
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
  registerLink: {
    marginTop: 8,
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
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  // Estilos de cuenta logueada
  accountCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 14,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    padding: 20,
    gap: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    color: "#8AA9C9",
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 18,
    color: "#F4FAFF",
    fontWeight: "800",
    textAlign: "center",
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    width: "100%",
    maxWidth: 280,
    borderRadius: 12,
    backgroundColor: "#B42318",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
});
