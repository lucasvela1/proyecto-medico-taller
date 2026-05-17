import { familiares } from "@/app/data/familiares";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ContactoEmergencia = {
  id: string;
  nombreApellido: string;
  relacion: string;
  numeroTel: string;
  direccion: string;
};

export default function IdentidadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const familiar = familiares.find((item) => item.id === id);

  const [nombre, setNombre] = useState(familiar?.nombre ?? "");
  const [apellido, setApellido] = useState(familiar?.apellido ?? "");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContactoId, setEditingContactoId] = useState<string | null>(null);

  const [nuevoNombreApellido, setNuevoNombreApellido] = useState("");
  const [nuevaRelacion, setNuevaRelacion] = useState("");
  const [nuevoNumeroTel, setNuevoNumeroTel] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");

  const resetContactoForm = () => {
    setNuevoNombreApellido("");
    setNuevaRelacion("");
    setNuevoNumeroTel("");
    setNuevaDireccion("");
    setEditingContactoId(null);
  };

  const guardarCambios = () => {
    Alert.alert("Guardado", "Los datos fueron guardados correctamente.");
  };

  const abrirNuevoContacto = () => {
    resetContactoForm();
    setIsModalVisible(true);
  };

  const abrirEdicionContacto = (contacto: ContactoEmergencia) => {
    setEditingContactoId(contacto.id);
    setNuevoNombreApellido(contacto.nombreApellido);
    setNuevaRelacion(contacto.relacion);
    setNuevoNumeroTel(contacto.numeroTel);
    setNuevaDireccion(contacto.direccion);
    setIsModalVisible(true);
  };

  const guardarContacto = () => {
    if (!nuevoNombreApellido.trim() || !nuevaRelacion.trim()) {
      Alert.alert("Faltan datos", "Nombre y relacion son obligatorios.");
      return;
    }

    const contactoPayload: ContactoEmergencia = {
      id: editingContactoId ?? `${Date.now()}`,
      nombreApellido: nuevoNombreApellido.trim(),
      relacion: nuevaRelacion.trim(),
      numeroTel: nuevoNumeroTel.trim(),
      direccion: nuevaDireccion.trim(),
    };

    setContactos((prev) => {
      if (!editingContactoId) {
        return [...prev, contactoPayload];
      }

      return prev.map((item) => (item.id === editingContactoId ? contactoPayload : item));
    });

    resetContactoForm();
    setIsModalVisible(false);
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Identidad y contacto</Text>

        {!familiar ? (
          <Text style={styles.notFoundText}>Familiar no encontrado</Text>
        ) : (
          <>
            <InputField label="Nombre" value={nombre} onChangeText={setNombre} />
            <InputField label="Apellido" value={apellido} onChangeText={setApellido} />
            <InputField
              label="DNI"
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
            />
            <InputField
              label="Fecha de nacimiento"
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              placeholder="DD/MM/AAAA"
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contactos de emergencia</Text>
              <Pressable
                onPress={abrirNuevoContacto}
                style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.addButtonText}>+ Agregar</Text>
              </Pressable>
            </View>

            {contactos.length === 0 ? (
              <Text style={styles.emptyText}>No hay contactos cargados.</Text>
            ) : (
              <FlatList
                data={contactos}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.contactList}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => abrirEdicionContacto(item)}
                    style={({ pressed }) => [styles.contactCard, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.contactName}>{item.nombreApellido}</Text>
                    <Text style={styles.contactDetail}>Relacion: {item.relacion}</Text>
                    <Text style={styles.contactDetail}>
                      Numero tel: {item.numeroTel || "No informado"}
                    </Text>
                    <Text style={styles.contactDetail}>
                      Direccion: {item.direccion || "No informada"}
                    </Text>
                  </Pressable>
                )}
              />
            )}

            <Pressable
              onPress={guardarCambios}
              style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingContactoId ? "Editar contacto de emergencia" : "Nuevo contacto de emergencia"}
            </Text>

            <InputField
              label="Nombre y apellido"
              value={nuevoNombreApellido}
              onChangeText={setNuevoNombreApellido}
              compact
            />
            <InputField
              label="Relacion"
              value={nuevaRelacion}
              onChangeText={setNuevaRelacion}
              compact
            />
            <InputField
              label="Numero tel"
              value={nuevoNumeroTel}
              onChangeText={setNuevoNumeroTel}
              placeholder="Opcional"
              keyboardType="phone-pad"
              compact
            />
            <InputField
              label="Direccion"
              value={nuevaDireccion}
              onChangeText={setNuevaDireccion}
              placeholder="Opcional"
              compact
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setIsModalVisible(false);
                  resetContactoForm();
                }}
                style={({ pressed }) => [styles.modalCancelButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={guardarContacto}
                style={({ pressed }) => [styles.modalConfirmButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.modalConfirmText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad";
  compact?: boolean;
};

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  compact = false,
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
  },
  content: {
    padding: 16,
    paddingTop: 28,
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F4FAFF",
    marginBottom: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: "#F4FAFF",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputGroupCompact: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EAF4FF",
    marginBottom: 6,
  },
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
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F4FAFF",
  },
  addButton: {
    backgroundColor: "#24528A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#6E9DD7",
  },
  addButtonText: {
    color: "#F4FAFF",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyText: {
    color: "#BDD2E8",
    marginBottom: 10,
  },
  contactList: {
    marginBottom: 14,
  },
  separator: {
    height: 8,
  },
  contactCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#123155",
    padding: 12,
  },
  contactName: {
    color: "#F4FAFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  contactDetail: {
    color: "#D8E7F6",
    fontSize: 14,
  },
  saveButton: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#2D7D46",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
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
  modalTitle: {
    color: "#F4FAFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  modalActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6E9DD7",
    backgroundColor: "#173867",
  },
  modalCancelText: {
    color: "#EAF4FF",
    fontWeight: "700",
  },
  modalConfirmButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2D7D46",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
