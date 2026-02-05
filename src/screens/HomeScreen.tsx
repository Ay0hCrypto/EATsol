import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { PrimaryButton } from '../components/PrimaryButton';
import { useWallet } from '../hooks/useWallet';
import { closeEmptyTokenAccount, getConnection, getBalances } from '../lib/solana';
import { getSolPriceUsd } from '../lib/prices';
import { getConfirmedTransactions } from '../lib/transactions';
import { CONFIG } from '../config';
import * as Clipboard from 'expo-clipboard';
import { PublicKey } from '@solana/web3.js';

export function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { wallet, stored, removeWallet } = useWallet();
  const [balances, setBalances] = useState<{ sol: number; tokens: any[] } | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);

  const refresh = useCallback(async () => {
    if (!wallet) {
      return;
    }
    setLoading(true);
    try {
      const connection = getConnection();
      const [balanceData, price, txs] = await Promise.all([
        getBalances(connection, wallet.publicKey),
        getSolPriceUsd(),
        getConfirmedTransactions(connection, wallet.publicKey)
      ]);
      setBalances(balanceData);
      setSolPrice(price);
      setTransactions(txs);
    } catch (error) {
      Alert.alert('Refresh failed', 'Unable to load balances or transactions.');
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (!wallet) {
      navigation.reset({ index: 0, routes: [{ name: 'Import' }] });
      return;
    }
    refresh();
  }, [wallet, navigation, refresh]);

  const handleCopy = async () => {
    if (wallet) {
      await Clipboard.setStringAsync(wallet.publicKey.toBase58());
      Alert.alert('Copied', 'Public key copied to clipboard.');
    }
  };

  const handleRemove = async () => {
    await removeWallet();
    navigation.reset({ index: 0, routes: [{ name: 'Import' }] });
  };

  const handleCloseEmptyAccounts = async () => {
    if (!wallet || !balances) {
      return;
    }
    const emptyAccounts = balances.tokens.filter((token) => token.balance === 0);
    if (!emptyAccounts.length) {
      Alert.alert('No empty accounts', 'There are no empty token accounts to close.');
      return;
    }
    Alert.alert(
      'Close empty accounts',
      `Close ${emptyAccounts.length} accounts for a fee of ${CONFIG.fees.closeAccountFeeSol} SOL each?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setClosing(true);
            try {
              const connection = getConnection();
              const feeDestination = new PublicKey(CONFIG.fees.feeWallet);
              const feeLamports = Math.round(CONFIG.fees.closeAccountFeeSol * 1_000_000_000);
              for (const account of emptyAccounts) {
                await closeEmptyTokenAccount(connection, wallet, new PublicKey(account.address), feeDestination, feeLamports);
              }
              Alert.alert('Success', 'Closed empty accounts.');
              refresh();
            } catch (error) {
              Alert.alert('Close failed', 'Unable to close empty accounts.');
            } finally {
              setClosing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Account</Text>
        <Text style={styles.mono}>{wallet?.publicKey.toBase58()}</Text>
        <PrimaryButton label="Copy" onPress={handleCopy} style={styles.smallButton} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>SOL Balance</Text>
        <Text style={styles.balance}>{balances ? balances.sol.toFixed(4) : '--'} SOL</Text>
        <Text style={styles.subtle}>USD: {solPrice ? (balances ? balances.sol * solPrice : 0).toFixed(2) : '--'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Tokens</Text>
        {balances?.tokens.length ? (
          balances.tokens.map((token) => (
            <View style={styles.tokenRow} key={token.address}>
              <Text style={styles.mono}>{token.mint}</Text>
              <Text>{token.balance}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.subtle}>No SPL tokens found.</Text>
        )}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Send" onPress={() => navigation.navigate('Send')} style={styles.actionButton} />
        <PrimaryButton label="Receive" onPress={() => navigation.navigate('Receive')} style={styles.actionButton} />
        <PrimaryButton label="Swap" onPress={() => navigation.navigate('Swap')} style={styles.actionButton} />
        <PrimaryButton label="Browser" onPress={() => navigation.navigate('Browser')} style={styles.actionButton} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Confirmed Transactions</Text>
        {transactions.length ? (
          transactions.map((tx) => (
            <View style={styles.txRow} key={tx.signature}>
              <Text style={styles.mono}>{tx.signature}</Text>
              <Text style={styles.subtle}>Slot: {tx.slot}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.subtle}>No confirmed transactions yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Wallet Export</Text>
        <Text style={styles.subtle}>Seed: {stored?.mnemonic ?? 'Not available'}</Text>
        <Text style={styles.subtle}>Private key stored securely.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Network</Text>
        <Text style={styles.subtle}>RPC: {CONFIG.rpc.primary}</Text>
        <Text style={styles.subtle}>Fallback: {CONFIG.rpc.heliusFallback}</Text>
      </View>

      <PrimaryButton label={loading ? 'Refreshing...' : 'Refresh'} onPress={refresh} disabled={loading} />
      <PrimaryButton
        label={closing ? 'Closing...' : 'Close empty accounts'}
        onPress={handleCloseEmptyAccounts}
        disabled={closing}
      />
      <PrimaryButton label="Remove wallet" onPress={handleRemove} style={styles.removeButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    gap: 8
  },
  label: {
    fontWeight: '700',
    fontSize: 14
  },
  balance: {
    fontSize: 24,
    fontWeight: '700'
  },
  subtle: {
    color: '#6b7280'
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12
  },
  smallButton: {
    marginTop: 8
  },
  actions: {
    gap: 10
  },
  actionButton: {
    marginBottom: 6
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  txRow: {
    marginBottom: 8
  },
  removeButton: {
    backgroundColor: '#dc2626'
  }
});
