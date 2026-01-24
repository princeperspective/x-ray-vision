import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePicture() {
    if (cameraRef.current && !processing) {
      setProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: false,
          skipProcessing: false,
        });

        if (photo) {
          // Pass URI to result screen
          router.push({
            pathname: "/result",
            params: { imageUri: photo.uri },
          });
        }
      } catch (e) {
        console.error(e);
        alert("Failed to capture image");
      } finally {
        setProcessing(false);
      }
    }
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            {processing && (
              <ActivityIndicator
                size="large"
                color="#00ffcc"
                style={styles.loader}
              />
            )}
          </View>
          <Text style={styles.instruction}>Align object within the frame</Text>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={takePicture}
              disabled={processing}
            >
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "#fff",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  iconButton: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  scanArea: {
    width: width - 60,
    height: width - 60,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  instruction: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 4,
  },
  footer: {
    alignItems: "center",
    marginBottom: 30,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },
  permButton: {
    backgroundColor: "#00ffcc",
    padding: 15,
    borderRadius: 8,
    alignSelf: "center",
  },
  permText: {
    fontWeight: "bold",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00ffcc",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#00ffcc",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00ffcc",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#00ffcc",
  },
  loader: {
    transform: [{ scale: 2 }],
  },
});
