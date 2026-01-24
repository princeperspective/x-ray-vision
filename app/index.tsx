import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#1A1A2E", "#16213E"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="scan-circle-outline" size={100} color="#00ffcc" />
          <Text style={styles.title}>X-RAY VISION</Text>
          <Text style={styles.subtitle}>Object Decomposition & Analysis</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => router.push("/scan")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="camera"
              size={24}
              color="#000"
              style={styles.btnIcon}
            />
            <Text style={styles.buttonTextPrimary}>START SCAN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push("/settings")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="settings-sharp"
              size={24}
              color="#00ffcc"
              style={styles.btnIcon}
            />
            <Text style={styles.buttonTextSecondary}>SETTINGS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by PyTorch & MobileNetV2
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: "space-between",
    paddingVertical: 80,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 2,
    marginTop: 20,
    textShadowColor: "rgba(0, 255, 204, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#8892b0",
    marginTop: 10,
    letterSpacing: 1,
  },
  actions: {
    width: "100%",
    gap: 20,
  },
  button: {
    height: 60,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: "#00ffcc",
    borderColor: "#00ffcc",
    shadowColor: "#00ffcc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonSecondary: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "#00ffcc",
  },
  buttonTextPrimary: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 1,
  },
  buttonTextSecondary: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00ffcc",
    letterSpacing: 1,
  },
  btnIcon: {
    marginRight: 10,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "#4a5568",
    fontSize: 12,
  },
});
