import * as ImagePicker from "expo-image-picker";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/result",
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>X-Ray Vision</Text>
            <Text style={styles.subtitle}>See inside everyday objects</Text>
          </View>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View style={styles.content}>
        <Link href="/scan" asChild>
          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📷</Text>
            </View>
            <Text style={styles.cardTitle}>Scan Object</Text>
            <Text style={styles.cardDescription}>
              Point your camera at an object
            </Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.card} onPress={pickImage}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🖼️</Text>
          </View>
          <Text style={styles.cardTitle}>Pick from Gallery</Text>
          <Text style={styles.cardDescription}>Analyze an existing photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsButton: {
    padding: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
  },
  content: {
    gap: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#aaa",
  },
});
