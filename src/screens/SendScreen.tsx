import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useWallet } from '../hooks/useWallet';
import { getConnection, sendSol, sendSplToken } from '../lib/solana';

export function SendScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Send'>) {
  const { wallet } = useWallet();
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [mint, setMint] = useState('');
  const [decimals, setDecimals] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!wallet) {
      return;
    }
    const amountValue = Number(amount);
    if (!destination || Number.isNaN(amountValue)) {
      Alert.alert('Invalid input', 'Destination and amount are required.');
      return;
    }

    Alert.alert('Confirm', 'Approve this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        style: 'default',
        onPress: async () => {
          setSending(true);
          try {
            const connection = getConnection();
            if (!mint) {
              await sendSol(connection, wallet, destination, amountValue);
            } else {
              const decimalsValue = Number(decimals);
              await sendSplToken(connection, wallet, destination, mint, amountValue, decimalsValue || 0);
            }
            Alert.alert('Success', 'Transaction sent.');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Send failed', 'Unable to send transaction.');
          } finally {
            setSending(false);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Send tokens</Text>
      <TextField value={destination} onChangeText={setDestination} placeholder="Destination public key" />
      <TextField value={amount} onChangeText={setAmount} placeholder="Amount" />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optional SPL token</Text>
        <TextField value={mint} onChangeText={setMint} placeholder="Token mint (leave blank for SOL)" />
        <TextField value={decimals} onChangeText={setDecimals} placeholder="Token decimals" />
      </View>
      <PrimaryButton label={sending ? 'Sending...' : 'Approve & Send'} onPress={handleSend} disabled={sending} />
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
  section: {
    gap: 10
  },
  sectionTitle: {
    fontWeight: '600'
  }
});
