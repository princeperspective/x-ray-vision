import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { checkBackendConnection } from '../services/ObjectRecognitionService';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [tfReady, setTfReady] = useState(false);

  useEffect(() => {
    // Check connection to Python Backend on startup
    const checkConnection = async () => {
      const isOnline = await checkBackendConnection();
      if (!isOnline) {
        Alert.alert(
          'Backend Unavailable',
          'Could not connect to the Python server. \n\n1. Ensure "python main.py" is running.\n2. Verify the IP address in ObjectRecognitionService.ts matches your computer.\n3. Ensure Phone and Computer are on the same WiFi.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('✅ Connected to Python Backend!');
      }
    };
    checkConnection();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
          <Stack.Screen name="scan" options={{ title: 'Scan Object', presentation: 'modal' }} />
          <Stack.Screen name="result" options={{ title: 'X-Ray View' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
