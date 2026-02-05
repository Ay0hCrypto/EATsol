import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useWallet } from '../hooks/useWallet';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { getConnection, getBalances } from '../lib/solana';
import { TokenSelector, TokenOption } from '../components/TokenSelector';
import { TextField } from '../components/TextField';

export function ReceiveScreen() {
  const { wallet } = useWallet();
  const address = wallet?.publicKey.toBase58() ?? '';
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [amount, setAmount] = useState('');

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
    Alert.alert('Copied', 'Public key copied to clipboard.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Receive</Text>
      <Pressable onPress={handleCopy} style={styles.addressCard}>
        <Text style={styles.label}>Wallet address</Text>
        <Text style={styles.mono}>{address}</Text>
        <Text style={styles.hint}>Tap to copy</Text>
      </Pressable>
      <TokenSelector label="Token" tokens={tokens} selected={selectedToken} onSelect={setSelectedToken} />
      <TextField value={amount} onChangeText={setAmount} placeholder="Amount (optional)" />
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
  hint: {
    color: '#9ca3af',
    fontSize: 12
  },
  button: {
    alignSelf: 'stretch'
  },
  addressCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#facc15',
    alignItems: 'center',
    gap: 6
  }
});
