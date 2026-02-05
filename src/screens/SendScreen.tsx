import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useWallet } from '../hooks/useWallet';
import { getConnection, getBalances, sendSol, sendSplToken } from '../lib/solana';
import { TokenSelector, TokenOption } from '../components/TokenSelector';
import * as Clipboard from 'expo-clipboard';

export function SendScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Send'>) {
  const { wallet } = useWallet();
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [sending, setSending] = useState(false);
  const address = wallet?.publicKey.toBase58() ?? '';

  useEffect(() => {
    const loadTokens = async () => {
      if (!wallet) {
        return;
      }
      const connection = getConnection();
      const balances = await getBalances(connection, wallet.publicKey);
      const options: TokenOption[] = [
        {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          balance: balances.sol,
          decimals: 9
        },
        ...balances.tokens.map((token) => ({
          mint: token.mint,
          symbol: token.mint.slice(0, 4),
          balance: token.balance,
          decimals: token.decimals
        }))
      ];
      setTokens(options);
      setSelectedToken(options[0]);
    };
    loadTokens();
  }, [wallet]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    Alert.alert('Copied', 'Wallet address copied.');
  };

  const handleSend = async () => {
    if (!wallet) {
      return;
    }
    const amountValue = Number(amount);
    if (!destination || Number.isNaN(amountValue) || !selectedToken) {
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
            if (selectedToken.symbol === 'SOL') {
              await sendSol(connection, wallet, destination, amountValue);
            } else {
              const decimalsValue = selectedToken.decimals ?? 0;
              await sendSplToken(connection, wallet, destination, selectedToken.mint, amountValue, decimalsValue);
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
      <Pressable onPress={handleCopy} style={styles.addressCard}>
        <Text style={styles.addressLabel}>Your address</Text>
        <Text style={styles.addressValue}>{address}</Text>
        <Text style={styles.addressHint}>Tap to copy</Text>
      </Pressable>
      <TextField value={destination} onChangeText={setDestination} placeholder="Destination public key" />
      <TokenSelector label="Token" tokens={tokens} selected={selectedToken} onSelect={setSelectedToken} />
      <TextField value={amount} onChangeText={setAmount} placeholder="Amount" />
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
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#facc15'
  },
  addressLabel: {
    color: '#6b7280',
    fontWeight: '600'
  },
  addressValue: {
    fontFamily: 'monospace',
    fontSize: 12
  },
  addressHint: {
    color: '#9ca3af',
    fontSize: 12
  }
});
