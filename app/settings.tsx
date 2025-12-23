import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { getApiUrl, setApiUrl } from "../services/ObjectRecognitionService";

export default function SettingsScreen() {
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    // Load current URL
    setUrl(getApiUrl());
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleSaveAndTest = async () => {
    if (!url.trim()) return;

    setChecking(true);
    setLogs([]); // Clear previous logs

    addLog("🚀 Starting connection diagnostic...");
    addLog(`📝 Parsing URL input: ${url}`);

    // logic mirrored from setApiUrl
    let cleanUrl = url.trim();
    if (cleanUrl.endsWith("/")) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    if (!cleanUrl.endsWith("/predict")) {
      cleanUrl += "/predict";
    }

    addLog(`🔗 Normalized API Endpoint: ${cleanUrl}`);

    // Save to service
    await setApiUrl(cleanUrl);
    addLog("💾 Configuration saved to local storage.");

    // Perform Test
    const rootUrl = cleanUrl.replace("/predict", "");
    addLog(`📡 Pinging Health Check Endpoint: ${rootUrl}`);

    const startTime = Date.now();
    try {
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out (3000ms)")), 3000)
      );

      const fetchPromise = fetch(rootUrl, { method: "GET" });

      // Race against timeout
      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;
      const duration = Date.now() - startTime;

      addLog(`⏱️ Latency: ${duration}ms`);
      addLog(`📥 HTTP Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        try {
          const text = await response.text();
          // Truncate if too long
          const safeText =
            text.length > 100 ? text.substring(0, 100) + "..." : text;
          addLog(`📄 Response Body: ${safeText}`);
        } catch (e) {
          addLog("⚠️ Could not read response body.");
        }
        addLog("✅ TEST PASSED: Backend is reachable.");
        addLog("------------------------------------");
        addLog("You can now go back and scan objects.");
      } else {
        addLog(`❌ TEST FAILED: Server returned error.`);
        addLog("Check server logs for details.");
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      addLog(`⏱️ Duration until failure: ${duration}ms`);
      addLog(`❌ CONNECTION ERROR: ${error.message}`);
      addLog("Possible causes:");
      addLog("1. Phone and PC not on same Wi-Fi.");
      addLog("2. Firewall blocking port 8000.");
      addLog("3. Wrong IP address entered.");
    } finally {
      setChecking(false);
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
          Configure the IP address of your Python server. The terminal below
          will show real-time diagnostics.
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
          onPress={handleSaveAndTest}
          disabled={checking}
        >
          <Text style={styles.buttonText}>
            {checking ? "Running Diagnostics..." : "Save & Test Connection"}
          </Text>
        </TouchableOpacity>

        {/* Terminal Window */}
        <View style={styles.terminalContainer}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDotRed} />
            <View style={styles.terminalDotYellow} />
            <View style={styles.terminalDotGreen} />
            <Text style={styles.terminalTitle}>CONNECTION_DIAGNOSTICS</Text>
          </View>
          <ScrollView
            style={styles.terminalContent}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {logs.length === 0 ? (
              <Text style={styles.terminalTextPlaceholder}>
                System Ready. Waiting for user input...
              </Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} style={styles.terminalText}>
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        </View>

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
    marginBottom: 20,
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
    marginTop: 0,
    marginBottom: 20,
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
    marginTop: 20,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  // Terminal Styles
  terminalContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 10,
    height: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#2d2d2d",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  terminalDotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff5f56",
    marginRight: 6,
  },
  terminalDotYellow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffbd2e",
    marginRight: 6,
  },
  terminalDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#27c93f",
    marginRight: 10,
  },
  terminalTitle: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginLeft: 6,
    fontWeight: "bold",
  },
  terminalContent: {
    padding: 12,
    flex: 1,
  },
  terminalText: {
    color: "#00ff00",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },
  terminalTextPlaceholder: {
    color: "#555",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    fontStyle: "italic",
  },
});
