import { useInitializeFamiliares } from "@/hooks/use-initialize-familiares";
import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
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
    </Stack>
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
