import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const [takingPicture, setTakingPicture] = useState(false);

  // Animation Shared Values
  const scanLine = useSharedValue(0);

  useEffect(() => {
    // Start the scanning animation
    scanLine.value = withRepeat(
      withTiming(height, { duration: 2500, easing: Easing.linear }),
      -1, // Infinite repeat
      true // Reverse direction
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLine.value }],
    };
  });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !takingPicture) {
      // Haptic Feedback: Heavy Impact for "Shutter" feel
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      setTakingPicture(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          skipProcessing: false,
        });

        // Double Tap feeling on success capture
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        if (photo) {
          router.push({
            pathname: "/result",
            params: { imageUri: photo.uri },
          });
        }
      } catch (error) {
        console.error("Failed to take picture:", error);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } finally {
        setTakingPicture(false);
      }
    }
  };

  function toggleCameraFacing() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Scanning Overlay */}
        <View style={styles.overlayContainer}>
          <View style={styles.gridOverlay} />
          <Animated.View style={[styles.scanLine, animatedStyle]}>
            <View style={styles.scanLineGlow} />
          </Animated.View>
        </View>

        {/* HUD Elements */}
        <View style={styles.hudTop}>
          <Text style={styles.hudText}>SYSTEM: ONLINE</Text>
          <Text style={styles.hudText}>MODE: X-RAY</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={takingPicture}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <View style={styles.spacer} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
    justifyContent: "space-between",
    alignItems: "flex-end",
    zIndex: 20,
  },
  button: {
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00fffa", // Cyan for sci-fi look
    textShadowColor: "rgba(0, 255, 250, 0.5)",
    textShadowRadius: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "#00fffa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 255, 250, 0.8)",
    shadowColor: "#00fffa",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  spacer: {
    width: 40,
  },
  // Animation & HUD
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: "flex-start",
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#00fffa",
    shadowColor: "#00fffa",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  scanLineGlow: {
    width: "100%",
    height: 40,
    backgroundColor: "rgba(0, 255, 250, 0.2)",
    marginTop: -20,
  },
  hudTop: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 15,
  },
  hudText: {
    color: "rgba(0, 255, 250, 0.7)",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 12,
    fontWeight: "bold",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 250, 0.1)",
    margin: 20,
    borderStyle: "dashed",
    borderRadius: 20,
  },
});
