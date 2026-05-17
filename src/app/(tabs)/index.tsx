import { buildRoute, ROUTES } from "@/navigation/routes";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

type HomeCard = {
  id: string;
  label: string;
  route: (typeof ROUTES)[keyof typeof ROUTES];
};

const HOME_CARDS: HomeCard[] = [
  { id: "yo", label: "Yo", route: ROUTES.YO },
  { id: "familiares", label: "Familiares", route: ROUTES.FAMILIARES },
  { id: "servicios", label: "Servicios", route: ROUTES.SERVICIOS },
];

export default function IndexScreen() {
  const router = useRouter();

  const goTo = (route: (typeof ROUTES)[keyof typeof ROUTES]) => {
    router.push(buildRoute(route));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Inicio</Text>

        <View style={styles.cardsContainer}>
          {HOME_CARDS.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => goTo(card.route)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <Text style={styles.cardLabel}>{card.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 20,
    gap: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#EAF4FF",
  },
  subtitle: {
    fontSize: 16,
    color: "#C7DAF0",
  },
  cardsContainer: {
    marginTop: 100,
    gap: 100,
  },
  card: {
    backgroundColor: "#173867",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#4B79B6",
    minHeight: 120,
    justifyContent: "center",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardLabel: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F4FAFF",
    textAlign: "center",
  },
});
