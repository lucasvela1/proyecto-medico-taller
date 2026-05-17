import { familiares } from "@/app/data/familiares";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function AdicionalesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const familiar = familiares.find((item) => item.id === id);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Adicionales</Text>
      <Text style={styles.name}>
        {familiar ? `${familiar.nombre} ${familiar.apellido}` : "Familiar no encontrado"}
      </Text>
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
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F4FAFF",
  },
  name: {
    fontSize: 18,
    color: "#F4FAFF",
  },
});
