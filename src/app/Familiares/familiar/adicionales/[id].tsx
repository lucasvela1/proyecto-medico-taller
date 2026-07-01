import { familiares, ItemClinico } from "@/data/familiares";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
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

export default function AdicionalesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const familiar = familiares.find((item) => item.id === id);

  const [peso, setPeso] = useState(familiar?.adicionales?.peso ?? "");
  const [altura, setAltura] = useState(familiar?.adicionales?.altura ?? "");
  const [esDonante, setEsDonante] = useState(
    familiar?.adicionales?.esDonante ?? false,
  );
  const [notas, setNotas] = useState(familiar?.adicionales?.notas ?? "");

  const [dispositivos, setDispositivos] = useState<ItemClinico[]>(
    familiar?.adicionales?.dispositivosMedicos ?? [],
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDispositivoId, setEditingDispositivoId] = useState<
    string | null
  >(null);
  const [nuevoDispositivo, setNuevoDispositivo] = useState("");

  const resetDispositivoForm = () => {
    setNuevoDispositivo("");
    setEditingDispositivoId(null);
  };

  const abrirNuevoDispositivo = () => {
    resetDispositivoForm();
    setIsModalVisible(true);
  };

  const abrirEdicionDispositivo = (item: ItemClinico) => {
    setEditingDispositivoId(item.id);
    setNuevoDispositivo(item.nombre);
    setIsModalVisible(true);
  };

  const guardarDispositivo = () => {
    if (!nuevoDispositivo.trim()) {
      Alert.alert("Falta el dato", "El nombre del dispositivo es obligatorio.");
      return;
    }

    const payload: ItemClinico = {
      id: editingDispositivoId ?? `${Date.now()}`,
      nombre: nuevoDispositivo.trim(),
    };

    setDispositivos((prev) => {
      if (!editingDispositivoId) {
        return [...prev, payload];
      }

      return prev.map((item) =>
        item.id === editingDispositivoId ? payload : item,
      );
    });

    resetDispositivoForm();
    setIsModalVisible(false);
  };

  const guardarCambios = () => {
    if (familiar) {
      familiar.adicionales = {
        ...familiar.adicionales,
        peso: peso,
        altura: altura,
        esDonante: esDonante,
        notas: notas,
        dispositivosMedicos: dispositivos,
      };
      Alert.alert(
        "Guardado",
        "Los datos adicionales fueron guardados correctamente.",
      );
    }
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Adicionales</Text>

        {!familiar ? (
          <Text style={styles.notFoundText}>Familiar no encontrado</Text>
        ) : (
          <>
            <Text style={styles.name}>
              {familiar.nombre} {familiar.apellido}
            </Text>

            <InputField
              label="Peso"
              value={peso}
              onChangeText={setPeso}
              placeholder="Ejemplo: 72 kg"
            />
            <InputField
              label="Altura"
              value={altura}
              onChangeText={setAltura}
              placeholder="Ejemplo: 1.75 m"
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dispositivos medicos</Text>
              <Pressable
                onPress={abrirNuevoDispositivo}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.addButtonText}>+ Agregar</Text>
              </Pressable>
            </View>

            {dispositivos.length === 0 ? (
              <Text style={styles.emptyText}>
                No hay dispositivos cargados.
              </Text>
            ) : (
              <FlatList
                data={dispositivos}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.itemsList}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => abrirEdicionDispositivo(item)}
                    style={({ pressed }) => [
                      styles.itemCard,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.itemName}>{item.nombre}</Text>
                  </Pressable>
                )}
              />
            )}

            <Pressable
              onPress={() => setEsDonante((prev) => !prev)}
              style={({ pressed }) => [
                styles.checkboxRow,
                pressed && styles.buttonPressed,
              ]}
            >
              <View
                style={[
                  styles.checkboxBox,
                  esDonante && styles.checkboxBoxChecked,
                ]}
              >
                {esDonante ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>Donante</Text>
            </Pressable>

            <View style={styles.notesGroup}>
              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={styles.notesInput}
                value={notas}
                onChangeText={setNotas}
                placeholder="Escribe observaciones adicionales"
                placeholderTextColor="#6D89A8"
                multiline
                textAlignVertical="top"
              />
            </View>

            <Pressable
              onPress={guardarCambios}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
              ]}
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
        onRequestClose={() => {
          setIsModalVisible(false);
          resetDispositivoForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingDispositivoId
                ? "Editar dispositivo medico"
                : "Nuevo dispositivo medico"}
            </Text>

            <InputField
              label="Nombre"
              value={nuevoDispositivo}
              onChangeText={setNuevoDispositivo}
              placeholder="Ejemplo: Marcapasos"
              compact
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setIsModalVisible(false);
                  resetDispositivoForm();
                }}
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={guardarDispositivo}
                style={({ pressed }) => [
                  styles.modalConfirmButton,
                  pressed && styles.buttonPressed,
                ]}
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
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    color: "#BDD2E8",
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
    marginTop: 4,
    marginBottom: 8,
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
  itemsList: {
    marginBottom: 10,
  },
  separator: {
    height: 8,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#123155",
    padding: 12,
  },
  itemName: {
    color: "#F4FAFF",
    fontSize: 16,
    fontWeight: "700",
  },
  checkboxRow: {
    marginTop: 2,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#6E9DD7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2A4B",
  },
  checkboxBoxChecked: {
    backgroundColor: "#2D7D46",
    borderColor: "#2D7D46",
  },
  checkboxLabel: {
    color: "#F4FAFF",
    fontSize: 16,
    fontWeight: "700",
  },
  notesGroup: {
    marginBottom: 10,
  },
  notesInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    color: "#F4FAFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 10,
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
