import { familiares } from "@/data/familiares";
import {
  adicionalesRoute,
  datosClinicosRoute,
  identidadRoute,
} from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (e) {
}

export default function FamiliarDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const familiar = familiares.find((item) => item.id === id);

  const [imageError, setImageError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagen, setImagen] = useState(familiar?.imagenUrl);

  useEffect(() => {
    setImageError(false);
    setImagen(familiar?.imagenUrl);
  }, [familiar?.id, familiar?.imagenUrl]);

  if (!familiar) {
    return (
      <View style={styles.screen}>
        <Text style={styles.notFoundText}>Familiar no encontrado</Text>
      </View>
    );
  }

  const updateFamiliarImage = (newUri: string) => {
    const f = familiares.find((item) => item.id === id);
    if (f) {
      f.imagenUrl = { uri: newUri };
      setImagen({ uri: newUri });
    }
  };

  const handleCamera = async () => {
    setModalVisible(false);
    if (!ImagePicker || !ImagePicker.requestCameraPermissionsAsync) {
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso denegado",
        "Se necesitan permisos de cámara para tomar fotos."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        updateFamiliarImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo tomar la foto.");
    }
  };

  const handleGallery = async () => {
    setModalVisible(false);
    if (!ImagePicker || !ImagePicker.requestMediaLibraryPermissionsAsync) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso denegado",
        "Se necesitan permisos de galería para seleccionar imágenes."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        updateFamiliarImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar la imagen.");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [
            styles.avatarPressable,
            pressed && styles.avatarPressed,
          ]}
        >
          {!imagen || imageError ? (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={30} color="#EAF4FF" />
            </View>
          ) : (
            <Image
              source={imagen}
              style={styles.avatarImage}
              onError={() => setImageError(true)}
            />
          )}
        </Pressable>

        <Text style={styles.title}>
          {familiar.nombre} {familiar.apellido}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        <Pressable
          onPress={() => router.push(identidadRoute(familiar.id))}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <Text style={styles.menuText}>Identidad y contacto</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(datosClinicosRoute(familiar.id))}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <Text style={styles.menuText}>Datos clinicos importantes</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(adicionalesRoute(familiar.id))}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <Text style={styles.menuText}>Adicionales</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.alertButton,
          pressed && styles.alertButtonPressed,
        ]}
      >
        <Text style={styles.alertText}>Alerta familiar</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cambiar foto de perfil</Text>

            <Pressable
              onPress={handleCamera}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.modalButtonPressed,
              ]}
            >
              <Ionicons name="camera" size={20} color="#EAF4FF" />
              <Text style={styles.modalButtonText}>Tomar foto (Cámara)</Text>
            </Pressable>

            <Pressable
              onPress={handleGallery}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.modalButtonPressed,
              ]}
            >
              <Ionicons name="images" size={20} color="#EAF4FF" />
              <Text style={styles.modalButtonText}>Seleccionar de Galería</Text>
            </Pressable>

            <Pressable
              onPress={() => setModalVisible(false)}
              style={({ pressed }) => [
                styles.modalCancelButton,
                pressed && styles.modalButtonPressed,
              ]}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarPressable: {
    borderRadius: 34,
  },
  avatarPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
  title: {
    flexShrink: 1,
    fontSize: 30,
    fontWeight: "800",
    color: "#F4FAFF",
  },
  menuContainer: {
    marginTop: 24,
    gap: 80,
  },
  menuButton: {
    minHeight: 112,
    borderRadius: 14,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  menuButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  menuText: {
    color: "#F4FAFF",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  alertButton: {
    marginTop: 62,
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: "#B42318",
    justifyContent: "center",
    alignItems: "center",
  },
  alertButtonPressed: {
    opacity: 0.92,
  },
  alertText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7A8795",
    textAlign: "center",
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 31, 58, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#173867",
    borderColor: "#4B79B6",
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#EAF4FF",
    marginBottom: 8,
    textAlign: "center",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#24528A",
    borderWidth: 1,
    borderColor: "#6E9DD7",
  },
  modalButtonText: {
    color: "#EAF4FF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalCancelButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  modalCancelButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "700",
  },
  modalButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
