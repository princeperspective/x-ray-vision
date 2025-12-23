import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getApiUrl,
  setApiUrl,
  checkBackendConnection,
} from "../services/ObjectRecognitionService";

export default function SettingsScreen() {
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load current URL
    setUrl(getApiUrl());
  }, []);

  const handleSave = async () => {
    if (!url.trim()) return;

    setChecking(true);
    // Save first? Or check first? Let's check then save logic, but user might want to force save.
    // Let's just save.
    await setApiUrl(url);

    // Test connection immediately
    const isOnline = await checkBackendConnection();
    setChecking(false);

    if (isOnline) {
      Alert.alert("Success", "Connected to backend!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert(
        "Saved, but unreachable",
        "The URL was saved, but we could not reach the server. Check your computer connection."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Network Settings</Text>
        <Text style={styles.description}>
          Configure the IP address of your Python server. Ensure your phone and
          computer are on the same Wi-Fi.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Server URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="http://192.168.1.X:8000/predict"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, checking && styles.disabled]}
          onPress={handleSave}
          disabled={checking}
        >
          <Text style={styles.buttonText}>
            {checking ? "Testing Connection..." : "Save & Test"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Tip: Run 'ipconfig' (Win) or 'ifconfig' (Mac) on your computer to find
          your local IP.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  hint: {
    marginTop: 30,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});
