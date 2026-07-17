import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/navigation/routes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
//Traducimos errores comunes al español para mostrarlos 
function traducirError(error: FirebaseError): string {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con este email.";
    case "auth/invalid-email":
      return "El email ingresado no es válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/operation-not-allowed":
      return "El registro no está habilitado. Contactá al administrador.";
    default:
      return "Ocurrió un error. Intentá de nuevo.";
  }
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (!email.trim()) {
      setError("Ingresá tu email.");
      return;
    }
    if (!password) {
      setError("Ingresá una contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await signUp(email.trim(), password);
      router.back();
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(traducirError(e));
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* Ícono */}
        <View style={styles.iconCircle}>
          <Ionicons name="person-add-outline" size={48} color="#4ADE80" />
        </View>

        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>
          Registrate para sincronizar tus datos entre dispositivos
        </Text>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@mail.com"
            placeholderTextColor="#6D89A8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!cargando}
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#6D89A8"
              secureTextEntry={!showPassword}
              editable={!cargando}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#8AA9C9"
              />
            </Pressable>
          </View>
        </View>

        {/* Confirmar Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repetí tu contraseña"
            placeholderTextColor="#6D89A8"
            secureTextEntry={!showPassword}
            editable={!cargando}
          />
        </View>

        {/* Botón Register */}
        <Pressable
          onPress={handleRegister}
          disabled={cargando}
          style={({ pressed }) => [
            styles.registerButton,
            pressed && styles.buttonPressed,
            cargando && styles.buttonDisabled,
          ]}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Crear cuenta</Text>
          )}
        </Pressable>

        {/* Link a Login */}
        <Pressable
          onPress={() => router.replace(ROUTES.AUTH_LOGIN as any)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            ¿Ya tenés cuenta?{" "}
            <Text style={styles.linkTextBold}>Iniciá sesión</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B1F3A",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  iconCircle: {
    alignSelf: "center",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#173867",
    borderWidth: 1,
    borderColor: "#4B79B6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F4FAFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#8AA9C9",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    color: "#FF8A8A",
    fontSize: 14,
    fontWeight: "600",
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EAF4FF",
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
    color: "#F4FAFF",
    paddingHorizontal: 14,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4B79B6",
    backgroundColor: "#173867",
  },
  passwordInput: {
    flex: 1,
    minHeight: 50,
    color: "#F4FAFF",
    paddingHorizontal: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  registerButton: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#1E6B40",
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkButton: {
    alignSelf: "center",
    paddingVertical: 12,
  },
  linkText: {
    color: "#8AA9C9",
    fontSize: 15,
  },
  linkTextBold: {
    color: "#5BA3E0",
    fontWeight: "800",
  },
});
