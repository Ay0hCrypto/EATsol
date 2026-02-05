import React from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useWallet } from '../hooks/useWallet';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

export function ReceiveScreen() {
  const { wallet } = useWallet();
  const address = wallet?.publicKey.toBase58() ?? '';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    Alert.alert('Copied', 'Public key copied to clipboard.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Receive</Text>
      <Text style={styles.label}>Public key</Text>
      <Text style={styles.mono}>{address}</Text>
      {address ? <QRCode value={address} size={200} /> : null}
      <PrimaryButton label="Copy" onPress={handleCopy} style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    alignItems: 'center'
  },
  heading: {
    fontSize: 22,
    fontWeight: '700'
  },
  label: {
    fontWeight: '600'
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center'
  },
  button: {
    alignSelf: 'stretch'
  }
});
