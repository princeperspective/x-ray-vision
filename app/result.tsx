import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import ObjectRecognitionService from "../services/ObjectRecognitionService";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

export default function ResultScreen() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imageUri) {
      analyzeImage();
    }
  }, [imageUri]);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Analyzing:", imageUri);
      const data = await ObjectRecognitionService.predict(imageUri as string);
      console.log("Result:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri as string }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Header controls */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Analysis Overlay */}
      {loading && (
        <View style={styles.loaderContainer}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <ActivityIndicator size="large" color="#00ffcc" />
          <Text style={styles.loadingText}>Analyzing Object Structure...</Text>
        </View>
      )}

      {!loading && result && (
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)", "#000"]}
          style={styles.resultsOverlay}
        >
          <View style={styles.hudHeader}>
            <View>
              <Text style={styles.label}>
                {result.predictions[0].label.toUpperCase().split(",")[0]}
              </Text>
              <Text style={styles.confidence}>
                CONFIDENCE:{" "}
                {(result.predictions[0].confidence * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DETECTED</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>INTERNAL COMPOSITION</Text>

          <ScrollView
            style={styles.componentList}
            showsVerticalScrollIndicator={false}
          >
            {result.xray_components &&
              result.xray_components.map((comp: string, i: number) => (
                <View key={i} style={styles.componentRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.componentText}>{comp}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
              ))}
          </ScrollView>
        </LinearGradient>
      )}

      {!loading && error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color="#ff4444" />
          <Text style={styles.errorText}>Analysis Failed</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={analyzeImage}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#00ffcc",
    marginTop: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  resultsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    padding: 30,
    paddingTop: 60,
  },
  hudHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 255, 204, 0.5)",
    textShadowRadius: 10,
  },
  confidence: {
    color: "#00ffcc",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 5,
  },
  badge: {
    borderColor: "#00ffcc",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#00ffcc",
    fontSize: 10,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 20,
  },
  sectionTitle: {
    color: "#8892b0",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
    letterSpacing: 1,
  },
  componentList: {
    flex: 1,
  },
  componentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00ffcc",
    marginRight: 15,
  },
  componentText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  errorDetail: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  retryBtn: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  hint: {
    color: "#888",
    marginTop: 10,
  },
});
