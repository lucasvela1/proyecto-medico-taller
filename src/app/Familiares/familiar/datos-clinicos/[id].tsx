import { familiares, ItemClinico } from "@/data/familiares";
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

type ListaClinica = "alergias" | "enfermedades" | "medicamentos";

export default function DatosClinicosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const familiar = familiares.find((item) => item.id === id);

  const [grupoSanguineo, setGrupoSanguineo] = useState(
    familiar?.datosClinicos?.grupoSanguineo ?? "",
  );
  const [coberturaMedica, setCoberturaMedica] = useState(
    familiar?.datosClinicos?.coberturaMedica ?? "",
  );
  const [numeroAfiliado, setNumeroAfiliado] = useState(
    familiar?.datosClinicos?.numeroAfiliado ?? "",
  );

  const [alergias, setAlergias] = useState<ItemClinico[]>(
    familiar?.datosClinicos?.alergias ?? [],
  );
  const [enfermedades, setEnfermedades] = useState<ItemClinico[]>(
    familiar?.datosClinicos?.enfermedades ?? [],
  );
  const [medicamentos, setMedicamentos] = useState<ItemClinico[]>(
    familiar?.datosClinicos?.medicamentos ?? [],
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [listaActiva, setListaActiva] = useState<ListaClinica | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [nuevoItemNombre, setNuevoItemNombre] = useState("");

  const listaConfig: Record<ListaClinica, { titulo: string; vacio: string }> = {
    alergias: {
      titulo: "Alergias",
      vacio: "No hay alergias cargadas.",
    },
    enfermedades: {
      titulo: "Enfermedades",
      vacio: "No hay enfermedades cargadas.",
    },
    medicamentos: {
      titulo: "Medicamentos",
      vacio: "No hay medicamentos cargados.",
    },
  };

  const getLista = (lista: ListaClinica) => {
    if (lista === "alergias") return alergias;
    if (lista === "enfermedades") return enfermedades;
    return medicamentos;
  };

  const setLista = (lista: ListaClinica, value: ItemClinico[]) => {
    if (lista === "alergias") {
      setAlergias(value);
      return;
    }

    if (lista === "enfermedades") {
      setEnfermedades(value);
      return;
    }

    setMedicamentos(value);
  };

  const resetItemForm = () => {
    setNuevoItemNombre("");
    setEditingItemId(null);
    setListaActiva(null);
  };

  const abrirNuevoItem = (lista: ListaClinica) => {
    setListaActiva(lista);
    setEditingItemId(null);
    setNuevoItemNombre("");
    setIsModalVisible(true);
  };

  const abrirEdicionItem = (lista: ListaClinica, item: ItemClinico) => {
    setListaActiva(lista);
    setEditingItemId(item.id);
    setNuevoItemNombre(item.nombre);
    setIsModalVisible(true);
  };

  const guardarItemLista = () => {
    if (!listaActiva) {
      return;
    }

    if (!nuevoItemNombre.trim()) {
      Alert.alert("Falta el dato", "El nombre del elemento es obligatorio.");
      return;
    }

    const itemPayload: ItemClinico = {
      id: editingItemId ?? `${Date.now()}`,
      nombre: nuevoItemNombre.trim(),
    };

    const listaActual = getLista(listaActiva);
    const listaActualizada = editingItemId
      ? listaActual.map((item) =>
          item.id === editingItemId ? itemPayload : item,
        )
      : [...listaActual, itemPayload];

    setLista(listaActiva, listaActualizada);
    resetItemForm();
    setIsModalVisible(false);
  };

  const guardarCambios = () => {
    if (familiar) {
      familiar.datosClinicos = {
        ...familiar.datosClinicos,
        grupoSanguineo: grupoSanguineo,
        coberturaMedica: coberturaMedica,
        numeroAfiliado: numeroAfiliado,
        alergias: alergias,
        enfermedades: enfermedades,
        medicamentos: medicamentos,
      };
      Alert.alert(
        "Guardado",
        "Los datos clinicos fueron guardados correctamente.",
      );
    }
  };

  const renderSeccionLista = (lista: ListaClinica) => {
    const config = listaConfig[lista];
    const data = getLista(lista);

    return (
      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{config.titulo}</Text>
          <Pressable
            onPress={() => abrirNuevoItem(lista)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </Pressable>
        </View>

        {data.length === 0 ? (
          <Text style={styles.emptyText}>{config.vacio}</Text>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.itemsList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => abrirEdicionItem(lista, item)}
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
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Datos clinicos importantes</Text>

        {!familiar ? (
          <Text style={styles.notFoundText}>Familiar no encontrado</Text>
        ) : (
          <>
            <Text style={styles.name}>
              {familiar.nombre} {familiar.apellido}
            </Text>

            <InputField
              label="Grupo sanguineo"
              value={grupoSanguineo}
              onChangeText={setGrupoSanguineo}
            />

            {renderSeccionLista("alergias")}
            {renderSeccionLista("enfermedades")}
            {renderSeccionLista("medicamentos")}

            <InputField
              label="Cobertura medica"
              value={coberturaMedica}
              onChangeText={setCoberturaMedica}
            />
            <InputField
              label="Numero de afiliado"
              value={numeroAfiliado}
              onChangeText={setNumeroAfiliado}
              keyboardType="numeric"
            />

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
          resetItemForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItemId
                ? `Editar ${listaActiva ? listaConfig[listaActiva].titulo.toLowerCase() : "elemento"}`
                : `Nuevo ${listaActiva ? listaConfig[listaActiva].titulo.toLowerCase() : "elemento"}`}
            </Text>

            <InputField
              label="Nombre"
              value={nuevoItemNombre}
              onChangeText={setNuevoItemNombre}
              placeholder="Ejemplo: Penicilina"
              compact
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setIsModalVisible(false);
                  resetItemForm();
                }}
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={guardarItemLista}
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
  listSection: {
    marginTop: 2,
    marginBottom: 8,
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
    marginBottom: 6,
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
