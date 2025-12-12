import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [tfReady, setTfReady] = useState(false);

  useEffect(() => {
    const initTensorFlow = async () => {
      try {
        console.log('Initializing TensorFlow...');
        await tf.ready();
        console.log('TensorFlow initialized successfully');
        setTfReady(true);
      } catch (error) {
        console.error('Failed to initialize TensorFlow:', error);
        // Still set ready to avoid blocking the app
        setTfReady(true);
      }
    };
    initTensorFlow();
  }, []);

  if (!tfReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

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
