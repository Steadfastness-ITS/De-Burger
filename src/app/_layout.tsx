import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { AppProvider } from '../data/AppState';
import { LobsterTwo_700Bold_Italic } from '@expo-google-fonts/lobster-two';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    LobsterTwo_700Bold_Italic,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Blue placeholder (matches the splash) while fonts load.
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: '#2B56EE' }} />;
  }

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" options={{ gestureEnabled: false }} />
        <Stack.Screen name="support" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="orders" />
      </Stack>
    </AppProvider>
  );
}
