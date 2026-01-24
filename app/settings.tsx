import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import ObjectRecognitionService from "../services/ObjectRecognitionService";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setUrl(ObjectRecognitionService.getApiUrl());
  }, []);

  const saveSettings = () => {
    if (!url.startsWith("http")) {
      Alert.alert("Invalid URL", "URL must start with http:// or https://");
      return;
    }
    ObjectRecognitionService.setApiUrl(url);
    router.back();
  };

  const testConnection = async () => {
    setTesting(true);
    // Update service with current input to test
    const originalUrl = ObjectRecognitionService.getApiUrl();
    ObjectRecognitionService.setApiUrl(url);

    try {
      const alive = await ObjectRecognitionService.checkHealth();
      if (alive) {
        Alert.alert("Success", "Connected to X-Ray Vision Engine!");
      } else {
        Alert.alert(
          "Connection Failed",
          "Could not reach server. Check if:\n1. Server is running (python main.py)\n2. Phone and PC are on same Wi-Fi\n3. Firewall allows port 8000"
        );
        // Revert on fail? Maybe not, user might want to correct it.
      }
    } catch (e) {
      Alert.alert("Error", "Network error occurred.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuration</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Server Endpoint</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="http://192.168.1.XX:8000"
          placeholderTextColor="#555"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.helper}>
          The API relies on a local Python server. Find your IP using `ipconfig`
          or `ifconfig`.
        </Text>

        <TouchableOpacity
          style={styles.testBtn}
          onPress={testConnection}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#00ffcc" />
          ) : (
            <Text style={styles.testBtnText}>Test Connection</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
          <Text style={styles.saveBtnText}>Save & Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 5,
  },
  form: {
    flex: 1,
  },
  label: {
    color: "#00ffcc",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  helper: {
    color: "#666",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
  testBtn: {
    marginTop: 20,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  testBtnText: {
    color: "#00ffcc",
    fontWeight: "bold",
  },
  footer: {
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: "#00ffcc",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});
