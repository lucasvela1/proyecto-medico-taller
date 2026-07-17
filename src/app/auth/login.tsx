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

function traducirError(error: FirebaseError): string {
  switch (error.code) {
    case "auth/invalid-email":
      return "El email ingresado no es válido.";
    case "auth/user-disabled":
      return "Esta cuenta fue deshabilitada.";
    case "auth/user-not-found":
      return "No existe una cuenta con este email.";
    case "auth/wrong-password":
      return "La contraseña es incorrecta.";
    case "auth/invalid-credential":
      return "Email o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intentá de nuevo más tarde.";
    default:
      return "Ocurrió un error. Intentá de nuevo.";
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("Ingresá tu email.");
      return;
    }
    if (!password) {
      setError("Ingresá tu contraseña.");
      return;
    }

    setCargando(true);
    try {
      await signIn(email.trim(), password);
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
          <Ionicons name="person-circle-outline" size={56} color="#5BA3E0" />
        </View>

        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>
          Ingresá con tu cuenta para sincronizar tus datos y favoritos
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
              placeholder="Tu contraseña"
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

        {/* Botón Login */}
        <Pressable
          onPress={handleLogin}
          disabled={cargando}
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.buttonPressed,
            cargando && styles.buttonDisabled,
          ]}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          )}
        </Pressable>

        {/* Link a Register */}
        <Pressable
          onPress={() => router.replace(ROUTES.AUTH_REGISTER as any)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            ¿No tenés cuenta?{" "}
            <Text style={styles.linkTextBold}>Registrate</Text>
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
  loginButton: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#1D6FE0",
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
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
