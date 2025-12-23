import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { Alert } from "react-native";
import {
  initService,
  checkBackendConnection,
} from "../services/ObjectRecognitionService";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // Check connection to Python Backend on startup
    const checkConnection = async () => {
      // 1. Initialize Service (Load correct IP)
      await initService();

      // 2. Check Connection
      const isOnline = await checkBackendConnection();
      if (!isOnline) {
        Alert.alert(
          "Backend Unavailable",
          "Could not connect to the Python server. \n\nCheck your Settings to ensure the IP address is correct.",
          [
            { text: "Retry", onPress: () => checkConnection() },
            { text: "Settings", onPress: () => router.push("/settings") },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        console.log("✅ Connected to Python Backend!");
      }
    };
    checkConnection();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: "Home", headerShown: false }}
          />
          <Stack.Screen
            name="scan"
            options={{ title: "Scan Object", presentation: "modal" }}
          />
          <Stack.Screen name="result" options={{ title: "X-Ray View" }} />
          <Stack.Screen
            name="settings"
            options={{ title: "Settings", presentation: "modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
