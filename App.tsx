import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ImportWalletScreen } from './src/screens/ImportWalletScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SendScreen } from './src/screens/SendScreen';
import { ReceiveScreen } from './src/screens/ReceiveScreen';
import { SwapScreen } from './src/screens/SwapScreen';
import { BrowserScreen } from './src/screens/BrowserScreen';

export type RootStackParamList = {
  Import: undefined;
  Home: undefined;
  Send: undefined;
  Receive: undefined;
  Swap: undefined;
  Browser: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

declare const global: typeof globalThis;

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Import" component={ImportWalletScreen} options={{ title: 'Import Wallet' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'EATsol Wallet' }} />
        <Stack.Screen name="Send" component={SendScreen} options={{ title: 'Send' }} />
        <Stack.Screen name="Receive" component={ReceiveScreen} options={{ title: 'Receive' }} />
        <Stack.Screen name="Swap" component={SwapScreen} options={{ title: 'Swap' }} />
        <Stack.Screen name="Browser" component={BrowserScreen} options={{ title: 'Browser' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
