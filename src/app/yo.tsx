import { AppModalAlert } from "@/components/AppModalAlert";
import { familiares } from "@/data/familiares";
import { useFamiliaresReactive } from "@/hooks/use-familiares-reactive";
import { useImagePicker } from "@/hooks/use-image-picker";
import {
  adicionalesRoute,
  datosClinicosRoute,
  identidadRoute,
} from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Linking, Modal, Pressable, Share, StyleSheet, Text, View } from "react-native";

export default function YoScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const id = "yo";
  useFamiliaresReactive();
  const familiar = familiares.find((item) => item.id === id);

  const {
    imagen,
    imageError,
    setImageError,
    modalVisible,
    setModalVisible,
    handleCamera,
    handleGallery,
  } = useImagePicker(id, familiar?.imagenUrl);

  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; titulo: string; mensaje: string }>({
    visible: false,
    titulo: "",
    mensaje: "",
  });

  if (!familiar) {
    return (
      <View style={styles.screen}>
        <Text style={styles.notFoundText}>Usuario no encontrado</Text>
      </View>
    );
  }

  // Empty state: primera vez que se abre la app sin datos cargados
  const sinDatos = !familiar.nombre.trim() && !familiar.apellido.trim();
  if (sinDatos) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="person-outline" size={52} color="#6E9DD7" />
          </View>
          <Text style={styles.emptyTitle}>Aún no hay datos cargados</Text>
          <Text style={styles.emptySubtitle}>
            Completá tu perfil personal para que tus datos estén disponibles en
            caso de emergencia.
          </Text>
          <Pressable
            onPress={() => router.push(identidadRoute(familiar.id))}
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.emptyButtonPressed,
            ]}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>Cargar mis datos</Text>
          </Pressable>
        </View>
      </View>
    );
  }

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
        onPress={() => {
          const contactos = familiar.identidad?.contactosEmergencia ?? [];
          if (contactos.length === 0) {
            setErrorModal({
              visible: true,
              titulo: "Sin contactos",
              mensaje: "No tenés contactos de emergencia registrados. Cargalos en 'Identidad y contacto' para poder enviarles una alerta.",
            });
          } else {
            setIsAlertModalVisible(true);
          }
        }}
        style={({ pressed }) => [
          styles.alertButton,
          pressed && styles.alertButtonPressed,
        ]}
      >
        <Text style={styles.alertText}>Alerta personal</Text>
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

      {/* Modal de selección de contacto para enviar Alerta */}
      <Modal
        visible={isAlertModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAlertModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsAlertModalVisible(false)}>
          <Pressable style={styles.alertModalContainer} onPress={() => {}}>
            <View style={styles.alertIconCircle}>
              <Ionicons name="warning" size={32} color="#FF8A80" />
            </View>
            <Text style={styles.alertModalTitle}>Enviar alerta de emergencia</Text>
            <Text style={styles.alertModalSubtitle}>
              Compartí tu información médica con tus contactos de emergencia:
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.shareAllButton,
                pressed && styles.shareAllButtonPressed,
              ]}
              onPress={() => {
                setIsAlertModalVisible(false);
                const cNombre = familiar.nombre ? `${familiar.nombre} ${familiar.apellido}`.trim() : "Usuario";
                let msg = `🚨 *MENSAJE DE EMERGENCIA* 🚨\n\nHola, necesito ayuda urgente.\n\n*Datos médicos de ${cNombre}:*\n`;
                if (familiar.identidad?.dni) msg += `• *DNI:* ${familiar.identidad.dni}\n`;
                if (familiar.identidad?.fechaNacimiento) msg += `• *Fecha de nacimiento:* ${familiar.identidad.fechaNacimiento}\n`;
                if (familiar.datosClinicos?.grupoSanguineo) msg += `• *Grupo sanguíneo:* ${familiar.datosClinicos.grupoSanguineo}\n`;
                if (familiar.datosClinicos?.coberturaMedica) msg += `• *Cobertura médica:* ${familiar.datosClinicos.coberturaMedica} (Nro: ${familiar.datosClinicos.numeroAfiliado || "No especificado"})\n`;
                
                const alergias = familiar.datosClinicos?.alergias ?? [];
                if (alergias.length > 0) msg += `• *Alergias:* ${alergias.map(a => a.nombre).join(", ")}\n`;
                
                const enf = familiar.datosClinicos?.enfermedades ?? [];
                if (enf.length > 0) msg += `• *Enfermedades:* ${enf.map(e => e.nombre).join(", ")}\n`;
                
                const med = familiar.datosClinicos?.medicamentos ?? [];
                if (med.length > 0) msg += `• *Medicamentos:* ${med.map(m => m.nombre).join(", ")}\n`;

                const peso = familiar.adicionales?.peso;
                if (peso) msg += `• *Peso:* ${peso}\n`;

                const altura = familiar.adicionales?.altura;
                if (altura) msg += `• *Altura:* ${altura}\n`;

                const donante = familiar.adicionales?.esDonante;
                if (donante !== undefined) msg += `• *Donante:* ${donante ? "Sí" : "No"}\n`;

                const notas = familiar.adicionales?.notas;
                if (notas) msg += `• *Notas adicionales:* ${notas}\n`;

                Share.share({
                  message: msg,
                }).catch(() => {});
              }}
            >
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              <Text style={styles.shareAllText}>Enviar a todos (Compartir)</Text>
            </Pressable>

            <Text style={styles.dividerText}>o enviar directamente por WhatsApp:</Text>

            <View style={styles.contactsList}>
              {(familiar.identidad?.contactosEmergencia ?? []).map((c) => (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => [
                    styles.contactAlertItem,
                    pressed && styles.contactAlertItemPressed,
                  ]}
                  onPress={() => {
                    setIsAlertModalVisible(false);
                    // Formatear mensaje
                    const cNombre = familiar.nombre ? `${familiar.nombre} ${familiar.apellido}`.trim() : "Usuario";
                    let msg = `🚨 *MENSAJE DE EMERGENCIA* 🚨\n\nHola, necesito ayuda urgente.\n\n*Datos médicos de ${cNombre}:*\n`;
                    if (familiar.identidad?.dni) msg += `• *DNI:* ${familiar.identidad.dni}\n`;
                    if (familiar.identidad?.fechaNacimiento) msg += `• *Fecha de nacimiento:* ${familiar.identidad.fechaNacimiento}\n`;
                    if (familiar.datosClinicos?.grupoSanguineo) msg += `• *Grupo sanguíneo:* ${familiar.datosClinicos.grupoSanguineo}\n`;
                    if (familiar.datosClinicos?.coberturaMedica) msg += `• *Cobertura médica:* ${familiar.datosClinicos.coberturaMedica} (Nro: ${familiar.datosClinicos.numeroAfiliado || "No especificado"})\n`;
                    
                    const alergias = familiar.datosClinicos?.alergias ?? [];
                    if (alergias.length > 0) msg += `• *Alergias:* ${alergias.map(a => a.nombre).join(", ")}\n`;
                    
                    const enf = familiar.datosClinicos?.enfermedades ?? [];
                    if (enf.length > 0) msg += `• *Enfermedades:* ${enf.map(e => e.nombre).join(", ")}\n`;
                    
                    const med = familiar.datosClinicos?.medicamentos ?? [];
                    if (med.length > 0) msg += `• *Medicamentos:* ${med.map(m => m.nombre).join(", ")}\n`;

                    const peso = familiar.adicionales?.peso;
                    if (peso) msg += `• *Peso:* ${peso}\n`;

                    const altura = familiar.adicionales?.altura;
                    if (altura) msg += `• *Altura:* ${altura}\n`;

                    const donante = familiar.adicionales?.esDonante;
                    if (donante !== undefined) msg += `• *Donante:* ${donante ? "Sí" : "No"}\n`;

                    const notas = familiar.adicionales?.notas;
                    if (notas) msg += `• *Notas adicionales:* ${notas}\n`;

                    // Limpiar número de caracteres no numéricos
                    const cleanPhone = c.numeroTel.replace(/[^\d+]/g, "");
                    const url = `whatsapp://send?text=${encodeURIComponent(msg)}&phone=${cleanPhone}`;
                    Linking.openURL(url).catch(() => {
                      // Fallback a web wa.me
                      Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`);
                    });
                  }}
                >
                  <View style={styles.contactItemLeft}>
                    <Text style={styles.contactItemName}>{c.nombreApellido}</Text>
                    <Text style={styles.contactItemRel}>{c.relacion} • {c.numeroTel}</Text>
                  </View>
                  <Ionicons name="logo-whatsapp" size={26} color="#25D366" />
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setIsAlertModalVisible(false)}
              style={({ pressed }) => [
                styles.alertModalCloseButton,
                pressed && styles.modalButtonPressed,
              ]}
            >
              <Text style={styles.alertModalCloseText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <AppModalAlert
        visible={errorModal.visible}
        tipo="error"
        titulo={errorModal.titulo}
        mensaje={errorModal.mensaje}
        onClose={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
      />
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#112240",
    borderWidth: 1,
    borderColor: "#2A4E7C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F0F8FF",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#8AA9C9",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#1A5A8A",
    borderWidth: 1,
    borderColor: "#4A8FC4",
  },
  emptyButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
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
  alertModalContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#112240",
    borderWidth: 1,
    borderColor: "#2A4E7C",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  alertIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 138, 128, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 138, 128, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  alertModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F0F8FF",
    textAlign: "center",
  },
  alertModalSubtitle: {
    fontSize: 14,
    color: "#A8C8E8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  shareAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#1E6B40",
    borderWidth: 1,
    borderColor: "#2D9C5E",
    marginBottom: 8,
  },
  shareAllButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  shareAllText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8AA9C9",
    marginVertical: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactsList: {
    width: "100%",
    gap: 10,
    marginBottom: 8,
  },
  contactAlertItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
  },
  contactAlertItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  contactItemLeft: {
    flex: 1,
    gap: 2,
  },
  contactItemName: {
    color: "#F4FAFF",
    fontSize: 16,
    fontWeight: "700",
  },
  contactItemRel: {
    color: "#8AA9C9",
    fontSize: 13,
  },
  alertModalCloseButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  alertModalCloseText: {
    color: "#EAF4FF",
    fontSize: 16,
    fontWeight: "700",
  },
});
