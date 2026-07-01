import { AppModalAlert } from "@/components/AppModalAlert";
import { Familiar, familiares, guardarFamiliaresEnAlmacenamiento, notificarCambioFamiliares, suscribirFamiliares } from "@/data/familiares";
import { crearFamiliarRoute, fichaShowRoute } from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const VINCULOS = [
  "Madre",
  "Padre",
  "Hermano/a",
  "Primo/a",
  "Tío/a",
  "Abuelo/a",
  "Otro",
] as const;

type Vinculo = (typeof VINCULOS)[number];

function getFamiliaresSinYo(): Familiar[] {
  return familiares.filter((f) => f.id !== "yo");
}

export default function FamiliaresScreen() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [todosLosFamiliares, setTodosLosFamiliares] = useState<Familiar[]>(getFamiliaresSinYo);

  // Estados para Importación QR
  const [permission, requestPermission] = useCameraPermissions();
  const [isVinculoModalVisible, setIsVinculoModalVisible] = useState(false);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [vincSelect, setVincSelect] = useState<Vinculo | null>(null);
  const [vincOtro, setVincOtro] = useState("");
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    tipo: "exito" | "error";
    titulo: string;
    mensaje: string;
  }>({ visible: false, tipo: "exito", titulo: "", mensaje: "" });

  useEffect(() => {
    const desuscribir = suscribirFamiliares(() => {
      setTodosLosFamiliares(getFamiliaresSinYo());
    });
    return desuscribir;
  }, []);

  const filtro = texto.trim().toLowerCase();
  const familiaresFiltrados = filtro
    ? todosLosFamiliares.filter((f) =>
        `${f.nombre} ${f.apellido}`.toLowerCase().includes(filtro)
      )
    : todosLosFamiliares;

  // Handler para iniciar importación
  const iniciarImportacion = async () => {
    // Primero solicitamos o comprobamos permisos de cámara
    if (!permission) {
      // Cargando permisos
      return;
    }
    if (!permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setAlertModal({
          visible: true,
          tipo: "error",
          titulo: "Permiso denegado",
          mensaje: "Se requiere acceso a la cámara para poder escanear el código QR.",
        });
        return;
      }
    }
    // Una vez que tenemos permisos, abrimos primero el modal del vínculo
    setVincSelect(null);
    setVincOtro("");
    setIsVinculoModalVisible(true);
  };

  const confirmarVinculo = () => {
    if (!vincSelect) {
      setAlertModal({
        visible: true,
        tipo: "error",
        titulo: "Vínculo requerido",
        mensaje: "Por favor elegí el vínculo del familiar antes de escanear.",
      });
      return;
    }
    if (vincSelect === "Otro" && !vincOtro.trim()) {
      setAlertModal({
        visible: true,
        tipo: "error",
        titulo: "Especificá el vínculo",
        mensaje: "Escribí el vínculo en el campo de texto correspondiente.",
      });
      return;
    }
    // Si es correcto, pasamos a abrir la cámara
    setIsVinculoModalVisible(false);
    setIsCameraModalVisible(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    // Cerramos cámara inmediatamente
    setIsCameraModalVisible(false);
    try {
      const datosImportados = JSON.parse(data);
      if (!datosImportados.nombre || !datosImportados.apellido) {
        throw new Error("Formato inválido");
      }

      const relacion = vincSelect === "Otro" ? vincOtro.trim() : vincSelect;
      const nuevoId = `fam-import-${Date.now()}`;

      const nuevoFamiliar: Familiar = {
        id: nuevoId,
        nombre: datosImportados.nombre,
        apellido: datosImportados.apellido,
        relacion: relacion || "Familiar",
        identidad: datosImportados.identidad || {},
        datosClinicos: datosImportados.datosClinicos || {},
        adicionales: datosImportados.adicionales || {},
      };

      familiares.push(nuevoFamiliar);
      notificarCambioFamiliares();
      guardarFamiliaresEnAlmacenamiento();

      setAlertModal({
        visible: true,
        tipo: "exito",
        titulo: "Importación exitosa",
        mensaje: `Se importó a ${nuevoFamiliar.nombre} ${nuevoFamiliar.apellido} correctamente.`,
      });

      // Redirigir a su detalle después del éxito
      router.push(fichaShowRoute(nuevoId));
    } catch {
      setAlertModal({
        visible: true,
        tipo: "error",
        titulo: "Error al importar",
        mensaje: "El código QR escaneado no contiene un formato de perfil válido de esta aplicación.",
      });
    }
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={familiaresFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Pressable
              onPress={() => router.push(crearFamiliarRoute())}
              style={({ pressed }) => [
                styles.addCard,
                pressed && styles.addCardPressed,
              ]}
            >
              <Text style={styles.addSign}>+</Text>
              <Text style={styles.addText}>Agregar familiar</Text>
            </Pressable>

            <Pressable
              onPress={iniciarImportacion}
              style={({ pressed }) => [
                styles.importCard,
                pressed && styles.addCardPressed,
              ]}
            >
              <Ionicons name="qr-code-outline" size={24} color="#F4FAFF" />
              <Text style={styles.addText}>Importar familiar (QR)</Text>
            </Pressable>

            <Text style={styles.title}>Familiares</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre y apellido"
              placeholderTextColor="#5A6A7C"
              value={texto}
              onChangeText={setTexto}
              returnKeyType="search"
            />
          </>
        }
        renderItem={({ item }) => (
          <FamiliarCard
            item={item}
            onPress={() => router.push(fichaShowRoute(item.id))}
            onToggleFavorito={() => {
              const actualmenteFav = item.esFavorito === true || item.esFavorito === "true";
              item.esFavorito = !actualmenteFav;
              notificarCambioFamiliares();
              guardarFamiliaresEnAlmacenamiento();
            }}
            onEliminar={() => {
              const idx = familiares.findIndex((f) => f.id === item.id);
              if (idx !== -1) familiares.splice(idx, 1);
              notificarCambioFamiliares();
              guardarFamiliaresEnAlmacenamiento();
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron familiares</Text>
        }
      />

      {/* Modal para elegir el vínculo antes de escanear */}
      <Modal
        visible={isVinculoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVinculoModalVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.vincCard}>
            <Text style={styles.confirmTitle}>¿Qué familiar estás agregando?</Text>
            <Text style={styles.vincSubtitle}>Seleccioná el vínculo del familiar a importar:</Text>

            <ScrollView style={{ maxHeight: 280, width: "100%", marginVertical: 10 }}>
              <View style={styles.radioGroup}>
                {VINCULOS.map((v) => {
                  const selected = vincSelect === v;
                  return (
                    <Pressable
                      key={v}
                      onPress={() => setVincSelect(v)}
                      style={[styles.radioRow, selected && styles.radioRowSelected]}
                    >
                      <View style={[styles.radioCircle, selected && styles.radioCircleFilled]}>
                        {selected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
                        {v}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {vincSelect === "Otro" && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.vincInputLabel}>Especificá el vínculo:</Text>
                  <TextInput
                    style={styles.vincInput}
                    value={vincOtro}
                    onChangeText={setVincOtro}
                    placeholder="Ej: Cuñado, Padrino..."
                    placeholderTextColor="#6D89A8"
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setIsVinculoModalVisible(false)}
                style={({ pressed }) => [styles.confirmCancel, pressed && styles.confirmPressed]}
              >
                <Text style={styles.confirmCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={confirmarVinculo}
                style={({ pressed }) => [styles.confirmNext, pressed && styles.confirmPressed]}
              >
                <Text style={styles.confirmNextText}>Siguiente</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Escáner QR de Cámara */}
      <Modal
        visible={isCameraModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsCameraModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          {/* Overlay del Lector */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scanTargetArea} />
            <Text style={styles.scannerText}>Apuntá la cámara al código QR de salud</Text>
            
            <Pressable
              onPress={() => setIsCameraModalVisible(false)}
              style={({ pressed }) => [
                styles.scannerCancelButton,
                pressed && styles.confirmPressed,
              ]}
            >
              <Text style={styles.scannerCancelText}>Cancelar escaneo</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <AppModalAlert
        visible={alertModal.visible}
        tipo={alertModal.tipo}
        titulo={alertModal.titulo}
        mensaje={alertModal.mensaje}
        onClose={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

export function FamiliarCard({
  item,
  onPress,
  onToggleFavorito,
  onEliminar,
}: {
  item: Familiar;
  onPress: () => void;
  onToggleFavorito?: () => void;
  onEliminar?: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item.imagenUrl]);

  const shouldShowFallback = !item.imagenUrl || imageError;

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {shouldShowFallback ? (
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={26} color="#EAF4FF" />
          </View>
        ) : (
          <Image
            source={item.imagenUrl}
            style={styles.avatarImage}
            onError={() => setImageError(true)}
          />
        )}

        <View style={styles.cardTextBlock}>
          <Text style={styles.nameText}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.relationText}>{item.relacion}</Text>
        </View>

        <View style={styles.cardActions}>
          {onToggleFavorito && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorito();
              }}
              style={styles.actionButton}
            >
              <Ionicons
                name={(item.esFavorito === true || item.esFavorito === "true") ? "heart" : "heart-outline"}
                size={24}
                color={(item.esFavorito === true || item.esFavorito === "true") ? "#EB5757" : "#8AA9C9"}
              />
            </Pressable>
          )}
          {onEliminar && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                setConfirmVisible(true);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={22} color="#C0392B" />
            </Pressable>
          )}
        </View>
      </Pressable>

      {/* Modal de confirmación de borrado */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable style={styles.confirmOverlay} onPress={() => setConfirmVisible(false)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="trash" size={30} color="#E74C3C" />
            </View>
            <Text style={styles.confirmTitle}>¿Eliminar familiar?</Text>
            <Text style={styles.confirmMessage}>
              Se eliminará a{" "}
              <Text style={{ fontWeight: "800", color: "#F0F8FF" }}>
                {item.nombre} {item.apellido}
              </Text>
              {" "}de tu lista. Esta acción no se puede deshacer.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                style={({ pressed }) => [styles.confirmCancel, pressed && styles.confirmPressed]}
              >
                <Text style={styles.confirmCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setConfirmVisible(false);
                  onEliminar?.();
                }}
                style={({ pressed }) => [styles.confirmDelete, pressed && styles.confirmPressed]}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.confirmDeleteText}>Eliminar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  addCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    marginBottom: 10,
  },
  importCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: "#0F2E52",
    borderWidth: 1,
    borderColor: "#2A4E7C",
    marginBottom: 18,
  },
  addCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  addSign: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F4FAFF",
    marginTop: -2,
  },
  addText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F4FAFF",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F4FAFF",
    marginBottom: 14,
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#F4FAFF",
    marginBottom: 16,
  },
  separator: {
    height: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#24528A",
  },
  cardTextBlock: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F4FAFF",
  },
  relationText: {
    marginTop: 4,
    fontSize: 15,
    color: "#F4FAFF",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
    color: "#52606D",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  // Confirmation modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(4, 13, 26, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmCard: {
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
  confirmIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(231, 76, 60, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F0F8FF",
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 15,
    color: "#A8C8E8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 6,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  confirmCancel: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmCancelText: {
    color: "#EAF4FF",
    fontWeight: "700",
    fontSize: 15,
  },
  confirmDelete: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#7A1F1A",
    borderWidth: 1,
    borderColor: "#B84040",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  confirmPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  vincCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#112240",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A4E7C",
    padding: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  vincSubtitle: {
    fontSize: 14,
    color: "#A8C8E8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  radioGroup: {
    width: "100%",
    gap: 8,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2A4E7C",
    backgroundColor: "#173867",
  },
  radioRowSelected: {
    borderColor: "#4A8FC4",
    backgroundColor: "#0F2E52",
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#4B79B6",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleFilled: {
    borderColor: "#5BA3E0",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5BA3E0",
  },
  radioLabel: {
    fontSize: 15,
    color: "#A8C8E8",
    fontWeight: "600",
  },
  radioLabelSelected: {
    color: "#EAF4FF",
    fontWeight: "700",
  },
  vincInputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EAF4FF",
    marginBottom: 6,
  },
  vincInput: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    color: "#F4FAFF",
    paddingHorizontal: 12,
    fontSize: 15,
  },
  confirmNext: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#1E6B40",
    borderWidth: 1,
    borderColor: "#2D9C5E",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmNextText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  // Scanner
  scannerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanTargetArea: {
    width: 250,
    height: 250,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#4ADE80",
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  scannerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 30,
    marginBottom: 40,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  scannerCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#B42318",
    borderWidth: 1,
    borderColor: "#E53E3E",
  },
  scannerCancelText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
