import { Stack } from "expo-router";
import { useInitializeFamiliares } from "@/hooks/use-initialize-familiares";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const cargando = useInitializeFamiliares();

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EAF4FF" />
      </View>
    );
  }

  return (
    <Stack screenOptions = {{headerBackButtonDisplayMode: "minimal"}} >
      <Stack.Screen name ="(tabs)" options= {{headerShown: false}} />
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
