import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { familiares, guardarFamiliaresEnAlmacenamiento } from "@/data/familiares";

let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (e) {
  // Ignoramos el error si no está compilado en la app nativa de desarrollo
}

export function useImagePicker(familiarId: string, initialImageUri?: any) {
  const [imageError, setImageError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagen, setImagen] = useState(initialImageUri);

  useEffect(() => {
    setImageError(false);
    setImagen(initialImageUri);
  }, [familiarId, initialImageUri]);

  const updateFamiliarImage = (newUri: string) => {
    const f = familiares.find((item) => item.id === familiarId);
    if (f) {
      f.imagenUrl = { uri: newUri };
      setImagen({ uri: newUri });
      guardarFamiliaresEnAlmacenamiento();
    }
  };

  const handleCamera = async () => {
    setModalVisible(false);
    if (!ImagePicker || !ImagePicker.requestCameraPermissionsAsync) {
      Alert.alert(
        "Cámara no disponible",
        "El módulo nativo de cámara no está disponible. Reconstruye el binario ejecutando 'npm run android' o 'npm run ios' para activarlo."
      );
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
      Alert.alert(
        "Galería no disponible",
        "El módulo nativo de galería no está disponible. Reconstruye el binario ejecutando 'npm run android' o 'npm run ios' para activarlo."
      );
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

  return {
    imagen,
    imageError,
    setImageError,
    modalVisible,
    setModalVisible,
    handleCamera,
    handleGallery,
  };
}
