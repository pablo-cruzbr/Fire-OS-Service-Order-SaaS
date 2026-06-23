import { StatusBar } from "expo-status-bar";
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signin() {
  const { signIn, loadingAuth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });

  function clearFieldError(field: keyof typeof errors) {
    setErrors((prev) => ({ ...prev, [field]: "", general: "" }));
  }

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const newErrors = { email: "", password: "", general: "" };
    let hasError = false;

    if (!normalizedEmail) {
      newErrors.email = "E-mail é obrigatório.";
      hasError = true;
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      newErrors.email = "Informe um e-mail válido.";
      hasError = true;
    }

    if (!trimmedPassword) {
      newErrors.password = "Senha é obrigatória.";
      hasError = true;
    } else if (trimmedPassword.length < 6) {
      newErrors.password = "A senha deve ter no mínimo 6 caracteres.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ email: "", password: "", general: "" });

    try {
      await signIn({ email: normalizedEmail, password: trimmedPassword });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Credenciais inválidas. Tente novamente.";
      setErrors({ email: "", password: "", general: msg });
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />
      <View style={styles.card}>
        <Image style={styles.logo} source={require("../../assets/Logo9.png")} />
        <Text style={styles.title}>Faça seu Login</Text>

        <View style={styles.fieldWrapper}>
          <TextInput
            placeholder="Digite seu email"
            style={[styles.input, !!errors.email && styles.inputError]}
            value={email}
            onChangeText={(v) => { setEmail(v); clearFieldError("email"); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#aaa"
          />
          {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.fieldWrapper}>
          <View style={[styles.passwordWrapper, !!errors.password && styles.inputError]}>
            <TextInput
              placeholder="Digite sua senha"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => { setPassword(v); clearFieldError("password"); }}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {!!errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

        <TouchableOpacity
          style={[styles.button, loadingAuth && styles.buttonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loadingAuth}
        >
          <Text style={styles.buttonText}>Acessar</Text>
        </TouchableOpacity>
      </View>

      {loadingAuth && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size={48} color="#4E3182" />
            <Text style={styles.loadingText}>Entrando...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4E3182",
    justifyContent: "center",
    alignItems: "center",
  },
  circleTop: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.2)",
    top: -80,
    right: -80,
  },
  circleBottom: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.15)",
    bottom: -120,
    left: -100,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 2,
  },
  logo: {
    width: 230,
    height: 60,
    resizeMode: "contain",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#444",
    marginBottom: 20,
  },
  fieldWrapper: {
    width: "100%",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 15,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 5,
    marginLeft: 12,
  },
  button: {
    width: "60%",
    height: 50,
    backgroundColor: "#4E3182",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  loadingBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  loadingText: {
    color: "#4E3182",
    fontSize: 15,
    fontWeight: "600",
  },
});
