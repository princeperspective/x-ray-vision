import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import OverlayView from "../components/OverlayView";
import { identifyObject } from "../services/ObjectRecognitionService";
import { Component, ObjectData } from "../types";

export default function ResultScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [data, setData] = useState<ObjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (imageUri) {
      analyzeImage(imageUri);
    }
  }, [imageUri]);

  const analyzeImage = async (uri: string) => {
    setLoading(true);
    try {
      const result = await identifyObject(uri);
      setData(result);
      if (result) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      console.error("Error identifying object:", error);
      Alert.alert("Error", "Failed to identify object.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComponentPress = (component: Component) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(component.name, component.description);
  };

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No image provided.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HUD Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ANALYSIS RESULT</Text>
        <View style={styles.statusDot} />
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
        {data && (
          <OverlayView data={data} onComponentPress={handleComponentPress} />
        )}

        {/* Holographic Grid Overlay */}
        <View style={styles.gridOverlay} />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00ffff" />
            <Text style={styles.loadingText}>PROCESSING NEURAL NET...</Text>
            <Text style={styles.subLoadingText}>Identifying patterns...</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.detailsContainer}>
        {data ? (
          <>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{data.name.toUpperCase()}</Text>
              <Text style={styles.confidence}>98.4% MATCH</Text>
            </View>

            <Text style={styles.description}>{data.description}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>INTERNAL COMPONENTS</Text>
            {data.components.map((comp, index) => (
              <View key={comp.id} style={styles.componentItem}>
                <Text style={styles.componentIndex}>0{index + 1}</Text>
                <View style={styles.componentContent}>
                  <Text style={styles.componentName}>
                    {comp.name.toUpperCase()}
                  </Text>
                  <Text style={styles.componentDesc}>{comp.description}</Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          !loading && (
            <Text style={styles.errorText}>
              OBJECT UNIDENTIFIED. TRY DIFFERENT ANGLE.
            </Text>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a14", // Dark blue-black for sci-fi feel
  },
  header: {
    height: 60,
    backgroundColor: "#001a1a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#00ffff",
  },
  headerText: {
    color: "#00ffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00ff00",
    marginLeft: 10,
  },
  imageContainer: {
    flex: 3, // Give more space to image
    backgroundColor: "#000",
    position: "relative",
    borderBottomWidth: 2,
    borderBottomColor: "#00ffff",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.1)",
    margin: 10,
    borderStyle: "dotted",
    borderRadius: 10,
    pointerEvents: "none",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#00ffff",
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 2,
  },
  subLoadingText: {
    color: "#008888",
    fontSize: 12,
    marginTop: 5,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  detailsContainer: {
    flex: 2,
    padding: 24,
    backgroundColor: "#050a14",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    fontFamily:
      Platform.OS === "ios" ? "Apple SD Gothic Neo" : "sans-serif-condensed",
  },
  confidence: {
    color: "#00ff00",
    fontSize: 12,
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#00ff00",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    fontSize: 16,
    color: "#aaccff",
    marginBottom: 20,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5599ff",
    marginBottom: 15,
    letterSpacing: 1,
  },
  componentItem: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 10,
    borderRadius: 8,
  },
  componentIndex: {
    color: "#00ffff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 15,
    opacity: 0.5,
  },
  componentContent: {
    flex: 1,
  },
  componentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  componentDesc: {
    fontSize: 14,
    color: "#88aaff",
  },
  errorText: {
    color: "#ff5555",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
  },
});
