import { AuthProvider } from "@/contexts/auth-context";
import { useInitializeFamiliares } from "@/hooks/use-initialize-familiares";
import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function AppContent() {
  const cargando = useInitializeFamiliares(); //Le decimos a la app que espere a que se carguen los datos antes de mostrar el menu

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EAF4FF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }} >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="yo"
        options={{
          headerShown: true,
          headerTitle: "Mi Perfil",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
        }}
      />
      <Stack.Screen
        name="Familiares/familiares"
        options={{
          headerShown: true,
          headerTitle: "Familiares",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
        }}
      />
      <Stack.Screen
        name="Familiares/crear"
        options={{
          headerShown: true,
          headerTitle: "Agregar Familiar",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
        }}
      />
      <Stack.Screen
        name="Familiares/familiar/[id]"
        options={{
          headerShown: true,
          headerTitle: "Detalle de Familiar",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
        }}
      />
      <Stack.Screen
        name="Familiares/familiar/identidad/[id]"
        options={{
          headerShown: true,
          headerTitle: "Identidad y Contacto",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
        }}
      />
      <Stack.Screen
        name="Familiares/familiar/datos-clinicos/[id]"
        options={{
          headerShown: true,
          headerTitle: "Datos Clínicos",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
        }}
      />
      <Stack.Screen
        name="Familiares/familiar/adicionales/[id]"
        options={{
          headerShown: true,
          headerTitle: "Datos Adicionales",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
        }}
      />
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "#0B1F3A" },
          headerTintColor: "#EAF4FF",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B1F3A",
    justifyContent: "center",
    alignItems: "center",
  },
});
