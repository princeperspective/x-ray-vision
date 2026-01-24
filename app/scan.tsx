import {
  CameraView,
  useCameraPermissions,
  CameraType,
  FlashMode,
} from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = Math.min(width, height) * 0.7;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [scanning, setScanning] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // Animations
  const scanLineY = useSharedValue(0);
  const aimOpacity = useSharedValue(1);

  useEffect(() => {
    // Continuous scanning animation
    scanLineY.value = withRepeat(
      withTiming(SCAN_AREA_SIZE, { duration: 2000, easing: Easing.linear }),
      -1,
      true
    );
    aimOpacity.value = withRepeat(
      withTiming(0.5, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedScanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const animatedAimStyle = useAnimatedStyle(() => ({
    opacity: aimOpacity.value,
  }));

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="scan-outline" size={64} color="#00ffcc" />
        <Text style={styles.permissionText}>
          Optical Sensors Require Access
        </Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>INITIALIZE CAMERA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const takePicture = async () => {
    if (cameraRef.current && !scanning) {
      setScanning(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: false,
        });

        if (photo) {
          router.push({
            pathname: "/result",
            params: { imageUri: photo.uri },
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setScanning(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          {/* Header HUD */}
          <View style={styles.header}>
            <TouchableOpacity onPress={router.back} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={24} color="#00ffcc" />
            </TouchableOpacity>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>SYSTEM ACTIVE</Text>
            </View>
            <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
              <Ionicons
                name={flash === "on" ? "flash" : "flash-off"}
                size={24}
                color={flash === "on" ? "#ffee00" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          {/* Scanner Rect */}
          <View style={styles.scannerContainer}>
            {/* Corners */}
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />

            {/* Grid Lines */}
            <View style={styles.gridVertical} />
            <View style={styles.gridHorizontal} />

            {/* Animated Scan Line */}
            <Animated.View style={[styles.scanLine, animatedScanLineStyle]}>
              <LinearGradient
                colors={[
                  "rgba(0,255,204,0)",
                  "rgba(0,255,204,0.8)",
                  "rgba(0,255,204,0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>

            {/* Central Aim */}
            <Animated.View style={[styles.aim, animatedAimStyle]}>
              <Ionicons name="add" size={40} color="rgba(0,255,204,0.5)" />
            </Animated.View>
          </View>

          {/* Bottom HUD */}
          <View style={styles.footer}>
            <View style={styles.metrics}>
              <Text style={styles.metricLabel}>
                ISO: <Text style={styles.metricValue}>AUTO</Text>
              </Text>
              <Text style={styles.metricLabel}>
                EXP: <Text style={styles.metricValue}>0.0</Text>
              </Text>
            </View>

            <View style={styles.captureRow}>
              <TouchableOpacity onPress={toggleCamera} style={styles.sideBtn}>
                <Ionicons name="camera-reverse" size={28} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePicture}
                style={styles.shutterOuter}
                activeOpacity={0.8}
                disabled={scanning}
              >
                <LinearGradient
                  colors={["#00ffcc", "#00997a"]}
                  style={styles.shutterInner}
                >
                  {scanning ? (
                    <Ionicons name="hourglass" size={32} color="#000" />
                  ) : (
                    <Ionicons name="scan" size={32} color="#000" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.sideBtn} />
            </View>

            <Text style={styles.hint}>ALIGN OBJECT TO ANALYZE STRUCTURE</Text>
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
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#050510",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  permissionText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  permButton: {
    backgroundColor: "rgba(0, 255, 204, 0.2)",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: "#00ffcc",
    borderRadius: 4,
  },
  permButtonText: {
    color: "#00ffcc",
    fontWeight: "bold",
    letterSpacing: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)", // Slight dark tint
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,255,204,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,255,204,0.3)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00ffcc",
    marginRight: 8,
  },
  statusText: {
    color: "#00ffcc",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  scannerContainer: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    alignSelf: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#00ffcc",
    borderWidth: 4,
  },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  gridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "rgba(0,255,204,0.3)",
  },
  gridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "rgba(0,255,204,0.3)",
  },
  scanLine: {
    height: 4,
    width: "100%",
    position: "absolute",
    top: 0,
    shadowColor: "#00ffcc",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  aim: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: 30,
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  metricLabel: {
    color: "#8892b0",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  metricValue: {
    color: "#fff",
  },
  captureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    padding: 4,
  },
  shutterInner: {
    flex: 1,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sideBtn: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  hint: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 10,
  },
});
