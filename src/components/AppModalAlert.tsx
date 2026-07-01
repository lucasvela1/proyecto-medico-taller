import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type AppModalAlertProps = {
  visible: boolean;
  tipo: "exito" | "error";
  titulo: string;
  mensaje: string;
  onClose: () => void;
};

export function AppModalAlert({
  visible,
  tipo,
  titulo,
  mensaje,
  onClose,
}: AppModalAlertProps) {
  const isExito = tipo === "exito";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => { }}>
          <View
            style={[
              styles.iconCircle,
              isExito ? styles.iconCircleExito : styles.iconCircleError,
            ]}
          >
            <Ionicons
              name={isExito ? "checkmark" : "alert"}
              size={32}
              color={isExito ? "#4ADE80" : "#FF8A80"}
            />
          </View>

          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.message}>{mensaje}</Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              isExito ? styles.buttonExito : styles.buttonError,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Aceptar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(4, 13, 26, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconCircleExito: {
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  iconCircleError: {
    backgroundColor: "rgba(255, 138, 128, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 138, 128, 0.3)",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F0F8FF",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#A8C8E8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 6,
  },
  button: {
    marginTop: 8,
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonExito: {
    backgroundColor: "#1E6B40",
    borderWidth: 1,
    borderColor: "#2D9C5E",
  },
  buttonError: {
    backgroundColor: "#7A1F1A",
    borderWidth: 1,
    borderColor: "#B84040",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
