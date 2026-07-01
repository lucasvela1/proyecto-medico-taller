import { AppModalAlert } from "@/components/AppModalAlert";
import {
  ContactoEmergencia,
  familiares,
  guardarFamiliaresEnAlmacenamiento,
  notificarCambioFamiliares,
} from "@/data/familiares";
import { fichaShowRoute } from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
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

export default function CrearFamiliarScreen() {
  const router = useRouter();

  // Datos de identidad
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  // Vínculo
  const [vincSelect, setVincSelect] = useState<Vinculo | null>(null);
  const [vincOtro, setVincOtro] = useState("");

  // Contactos de emergencia
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [isContactoModal, setIsContactoModal] = useState(false);
  const [editingContactoId, setEditingContactoId] = useState<string | null>(null);
  const [cNombreApellido, setCNombreApellido] = useState("");
  const [cRelacion, setCRelacion] = useState("");
  const [cTel, setCTel] = useState("");
  const [cDireccion, setCDireccion] = useState("");

  // Alerta
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    tipo: "exito" | "error";
    titulo: string;
    mensaje: string;
  }>({ visible: false, tipo: "exito", titulo: "", mensaje: "" });

  const resetContactoForm = () => {
    setCNombreApellido("");
    setCRelacion("");
    setCTel("");
    setCDireccion("");
    setEditingContactoId(null);
  };

  const abrirNuevoContacto = () => {
    resetContactoForm();
    setIsContactoModal(true);
  };

  const abrirEdicionContacto = (c: ContactoEmergencia) => {
    setEditingContactoId(c.id);
    setCNombreApellido(c.nombreApellido);
    setCRelacion(c.relacion);
    setCTel(c.numeroTel);
    setCDireccion(c.direccion);
    setIsContactoModal(true);
  };

  const guardarContacto = () => {
    if (!cNombreApellido.trim() || !cRelacion.trim()) {
      setAlertModal({
        visible: true,
        tipo: "error",
        titulo: "Faltan datos",
        mensaje: "Nombre y relación del contacto son obligatorios.",
      });
      return;
    }
    const payload: ContactoEmergencia = {
      id: editingContactoId ?? `${Date.now()}`,
      nombreApellido: cNombreApellido.trim(),
      relacion: cRelacion.trim(),
      numeroTel: cTel.trim(),
      direccion: cDireccion.trim(),
    };
    setContactos((prev) =>
      editingContactoId
        ? prev.map((c) => (c.id === editingContactoId ? payload : c))
        : [...prev, payload]
    );
    resetContactoForm();
    setIsContactoModal(false);
  };

  const handleCrear = () => {
    if (!nombre.trim() || !apellido.trim()) {
      setAlertModal({
        visible: true,
        tipo: "error",
        titulo: "Datos obligatorios",
        mensaje: "El nombre y el apellido son obligatorios.",
      });
      return;
    }
    if (!vincSelect) {
      setAlertModal({
        visible: true,
        tipo: "error",
        titulo: "Vínculo requerido",
        mensaje: "Por favor seleccioná el vínculo con el familiar.",
      });
      return;
    }
    if (vincSelect === "Otro" && !vincOtro.trim()) {
      setAlertModal({
        visible: true,
        tipo: "error",
        titulo: "Especificá el vínculo",
        mensaje: "Describí el vínculo en el campo de texto.",
      });
      return;
    }

    const relacion = vincSelect === "Otro" ? vincOtro.trim() : vincSelect;
    const nuevoId = `fam-${Date.now()}`;

    familiares.push({
      id: nuevoId,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      relacion,
      identidad: {
        dni: dni.trim(),
        fechaNacimiento: fechaNacimiento.trim(),
        contactosEmergencia: contactos,
      },
    });

    notificarCambioFamiliares();
    guardarFamiliaresEnAlmacenamiento();

    // Navegar al detalle del familiar recién creado (reemplazando esta pantalla)
    router.replace(fichaShowRoute(nuevoId));
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nuevo familiar</Text>

        {/* ── Vínculo ── */}
        <Text style={styles.sectionTitle}>Vínculo</Text>
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
          <InputField
            label="Especificá el vínculo"
            value={vincOtro}
            onChangeText={setVincOtro}
            placeholder="Ej: Cuñado, Padrino..."
          />
        )}

        {/* ── Identidad ── */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Identidad y contacto</Text>

        <InputField label="Nombre *" value={nombre} onChangeText={setNombre} />
        <InputField label="Apellido *" value={apellido} onChangeText={setApellido} />
        <InputField label="DNI" value={dni} onChangeText={setDni} keyboardType="numeric" />
        <InputField
          label="Fecha de nacimiento"
          value={fechaNacimiento}
          onChangeText={setFechaNacimiento}
          placeholder="DD/MM/AAAA"
        />

        {/* ── Contactos ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contactos de emergencia</Text>
          <Pressable
            onPress={abrirNuevoContacto}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </Pressable>
        </View>

        {contactos.length === 0 ? (
          <Text style={styles.emptyText}>No hay contactos cargados.</Text>
        ) : (
          <FlatList
            data={contactos}
            keyExtractor={(c) => c.id}
            scrollEnabled={false}
            contentContainerStyle={{ marginBottom: 14 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => abrirEdicionContacto(item)}
                style={({ pressed }) => [styles.contactCard, pressed && styles.pressed]}
              >
                <Text style={styles.contactName}>{item.nombreApellido}</Text>
                <Text style={styles.contactDetail}>Relación: {item.relacion}</Text>
                <Text style={styles.contactDetail}>Tel: {item.numeroTel || "No informado"}</Text>
                <Text style={styles.contactDetail}>Dir: {item.direccion || "No informada"}</Text>
              </Pressable>
            )}
          />
        )}

        {/* ── Crear ── */}
        <Pressable
          onPress={handleCrear}
          style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Crear familiar</Text>
        </Pressable>
      </ScrollView>

      {/* Modal de contacto de emergencia */}
      <Modal
        visible={isContactoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setIsContactoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingContactoId ? "Editar contacto" : "Nuevo contacto de emergencia"}
            </Text>
            <InputField label="Nombre y apellido" value={cNombreApellido} onChangeText={setCNombreApellido} compact />
            <InputField label="Relación" value={cRelacion} onChangeText={setCRelacion} compact />
            <InputField label="Nro. de teléfono" value={cTel} onChangeText={setCTel} placeholder="Opcional" keyboardType="phone-pad" compact />
            <InputField label="Dirección" value={cDireccion} onChangeText={setCDireccion} placeholder="Opcional" compact />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => { setIsContactoModal(false); resetContactoForm(); }}
                style={({ pressed }) => [styles.modalCancelButton, pressed && styles.pressed]}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={guardarContacto}
                style={({ pressed }) => [styles.modalConfirmButton, pressed && styles.pressed]}
              >
                <Text style={styles.modalConfirmText}>Guardar</Text>
              </Pressable>
            </View>
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
    </>
  );
}

// ── Input reutilizable ──────────────────────────────────────────────────────

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad";
  compact?: boolean;
};

function InputField({
  label, value, onChangeText, placeholder, keyboardType = "default", compact = false,
}: InputFieldProps) {
  return (
    <View style={compact ? styles.inputGroupCompact : styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6D89A8"
        keyboardType={keyboardType}
      />
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0B1F3A" },
  content: { padding: 16, paddingTop: 28, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: "800", color: "#F4FAFF", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#F4FAFF", marginBottom: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  // Radio buttons
  radioGroup: { gap: 8, marginBottom: 6 },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A4E7C",
    backgroundColor: "#112240",
  },
  radioRowSelected: {
    borderColor: "#4A8FC4",
    backgroundColor: "#0F2E52",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4B79B6",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleFilled: { borderColor: "#5BA3E0" },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#5BA3E0",
  },
  radioLabel: { fontSize: 16, color: "#A8C8E8", fontWeight: "600" },
  radioLabelSelected: { color: "#EAF4FF", fontWeight: "700" },
  // Inputs
  inputGroup: { marginBottom: 14 },
  inputGroupCompact: { marginBottom: 10 },
  label: { fontSize: 15, fontWeight: "700", color: "#EAF4FF", marginBottom: 6 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    color: "#F4FAFF",
    paddingHorizontal: 12,
    fontSize: 16,
  },
  // Contactos
  addButton: {
    backgroundColor: "#24528A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#6E9DD7",
  },
  addButtonText: { color: "#F4FAFF", fontWeight: "700", fontSize: 14 },
  emptyText: { color: "#BDD2E8", marginBottom: 10 },
  contactCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#123155",
    padding: 12,
  },
  contactName: { color: "#F4FAFF", fontSize: 15, fontWeight: "700", marginBottom: 4 },
  contactDetail: { color: "#D8E7F6", fontSize: 13 },
  // Botón crear
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#1E6B40",
    borderWidth: 1,
    borderColor: "#2D9C5E",
  },
  createButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  // Modal contacto
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 16,
    backgroundColor: "#0E2A4B",
    borderWidth: 1,
    borderColor: "#4B79B6",
    padding: 16,
  },
  modalTitle: { color: "#F4FAFF", fontSize: 18, fontWeight: "800", marginBottom: 12 },
  modalActions: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#173867",
  },
  modalCancelText: { color: "#EAF4FF", fontWeight: "700" },
  modalConfirmButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1E6B40",
  },
  modalConfirmText: { color: "#FFFFFF", fontWeight: "800" },
});
