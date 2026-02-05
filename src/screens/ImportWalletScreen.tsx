import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useWallet } from '../hooks/useWallet';

export function ImportWalletScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Import'>) {
  const { wallet, importMnemonic, importSecretKey, loading } = useWallet();
  const [mnemonic, setMnemonic] = useState('');
  const [secretKey, setSecretKey] = useState('');

  useEffect(() => {
    if (!loading && wallet) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  }, [loading, wallet, navigation]);

  const handleMnemonic = async () => {
    try {
      await importMnemonic(mnemonic);
    } catch (error) {
      Alert.alert('Import failed', 'Unable to import mnemonic.');
    }
  };

  const handleSecretKey = async () => {
    try {
      const parsed = JSON.parse(secretKey) as number[];
      await importSecretKey(parsed);
    } catch (error) {
      Alert.alert('Import failed', 'Private key must be a JSON byte array.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Import wallet</Text>
      <Text style={styles.label}>Seed phrase (English)</Text>
      <TextField
        value={mnemonic}
        onChangeText={setMnemonic}
        placeholder="twelve or twenty-four words"
        multiline
        numberOfLines={3}
      />
      <PrimaryButton label="Import seed" onPress={handleMnemonic} style={styles.button} disabled={!mnemonic.trim()} />
      <Text style={styles.label}>Private key byte array</Text>
      <TextField
        value={secretKey}
        onChangeText={setSecretKey}
        placeholder="[201, 89, 92, 104, 75, ...]"
        multiline
        numberOfLines={3}
      />
      <PrimaryButton label="Import private key" onPress={handleSecretKey} style={styles.button} disabled={!secretKey.trim()} />
      <Text style={styles.help}>
        Wallets are stored encrypted in SecureStore and persist until you remove them.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: '700'
  },
  label: {
    fontSize: 14,
    fontWeight: '600'
  },
  button: {
    marginTop: 8
  },
  help: {
    color: '#6b7280',
    marginTop: 8
  }
});
