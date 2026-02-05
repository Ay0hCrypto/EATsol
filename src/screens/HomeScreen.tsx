import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { PrimaryButton } from '../components/PrimaryButton';
import { useWallet } from '../hooks/useWallet';
import { closeEmptyTokenAccount, getConnection, getBalances } from '../lib/solana';
import { getSolPriceUsd, getTokenPriceUsd } from '../lib/prices';
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
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  const refresh = useCallback(async (force = false) => {
    if (!wallet) {
      return;
    }
    const now = Date.now();
    if (!force && now - lastRefresh < 120_000) {
      Alert.alert('Refresh limited', 'You can refresh once every 2 minutes.');
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
      const prices: Record<string, number> = {};
      if (balanceData.tokens.length) {
        const priceResults = await Promise.all(
          balanceData.tokens.map((token) => getTokenPriceUsd(token.mint).catch(() => undefined))
        );
        balanceData.tokens.forEach((token, index) => {
          prices[token.mint] = priceResults[index] ?? 0;
        });
      }
      prices['So11111111111111111111111111111111111111112'] = price;
      setTokenPrices(prices);
      setLastRefresh(now);
    } catch (error) {
      Alert.alert('Refresh failed', 'Unable to load balances or transactions.');
    } finally {
      setLoading(false);
    }
  }, [wallet, lastRefresh]);

  useEffect(() => {
    if (!wallet) {
      navigation.reset({ index: 0, routes: [{ name: 'Import' }] });
      return;
    }
    refresh(true);
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

  const handleCloseAccount = async (tokenAccount: string) => {
    if (!wallet) {
      return;
    }
    Alert.alert('Close account', 'Do you want to close this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        onPress: async () => {
          setClosing(true);
          try {
            const connection = getConnection();
            const feeDestination = new PublicKey(CONFIG.fees.feeWallet);
            const feeLamports = Math.round(CONFIG.fees.closeAccountFeeSol * 1_000_000_000);
            await closeEmptyTokenAccount(connection, wallet, new PublicKey(tokenAccount), feeDestination, feeLamports);
            Alert.alert('Closed', 'Account closed successfully.');
            refresh(true);
          } catch (error) {
            Alert.alert('Close failed', 'Unable to close account.');
          } finally {
            setClosing(false);
          }
        }
      }
    ]);
  };

  const totalUsd = useMemo(() => {
    if (!balances || !solPrice) {
      return 0;
    }
    const solUsd = balances.sol * solPrice;
    const tokenUsd = balances.tokens.reduce((sum, token) => sum + token.balance * (tokenPrices[token.mint] ?? 0), 0);
    return solUsd + tokenUsd;
  }, [balances, solPrice, tokenPrices]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refresh()} tintColor="#7c3aed" />}
    >
      <Pressable onPress={handleCopy} style={styles.card}>
        <Text style={styles.label}>Wallet address</Text>
        <Text style={styles.mono}>{wallet?.publicKey.toBase58()}</Text>
        <Text style={styles.subtle}>Tap to copy</Text>
      </Pressable>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total balance</Text>
        <Text style={styles.totalValue}>${totalUsd.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Send" onPress={() => navigation.navigate('Send')} style={styles.actionButton} />
        <PrimaryButton label="Receive" onPress={() => navigation.navigate('Receive')} style={styles.actionButton} />
        <PrimaryButton label="Swap" onPress={() => navigation.navigate('Swap')} style={styles.actionButton} />
        <PrimaryButton label="Browser" onPress={() => navigation.navigate('Browser')} style={styles.actionButton} />
      </View>

      <View style={styles.assetsCard}>
        <Text style={styles.label}>Assets</Text>
        <View style={styles.assetHeader}>
          <Text style={styles.assetHeaderText}>Token</Text>
          <Text style={styles.assetHeaderText}>Balance</Text>
          <Text style={styles.assetHeaderText}>USD</Text>
        </View>
        <View style={styles.tokenRow}>
          <View style={styles.tokenInfo}>
            <View style={styles.tokenLogo}>
              <Text style={styles.logoText}>SOL</Text>
            </View>
            <View>
              <Text style={styles.tokenSymbol}>SOL</Text>
              <Text style={styles.tokenPrice}>${solPrice?.toFixed(2) ?? '--'}</Text>
            </View>
          </View>
          <Text style={styles.tokenValue}>{balances ? balances.sol.toFixed(4) : '--'}</Text>
          <Text style={styles.tokenValue}>
            ${solPrice && balances ? (balances.sol * solPrice).toFixed(2) : '--'}
          </Text>
        </View>
        {balances?.tokens.length ? (
          balances.tokens.map((token) => {
            const symbol = token.mint.slice(0, 4);
            const usdValue = token.balance * (tokenPrices[token.mint] ?? 0);
            return (
              <Pressable
                key={token.address}
                onLongPress={() => {
                  if (token.balance === 0 && !closing) {
                    handleCloseAccount(token.address);
                  }
                }}
                style={styles.tokenRow}
              >
                <View style={styles.tokenInfo}>
                  <View style={styles.tokenLogo}>
                    <Text style={styles.logoText}>{symbol}</Text>
                  </View>
                  <View>
                    <Text style={styles.tokenSymbol}>{symbol}</Text>
                    <Text style={styles.tokenPrice}>${(tokenPrices[token.mint] ?? 0).toFixed(4)}</Text>
                  </View>
                </View>
                <Text style={styles.tokenValue}>{token.balance.toFixed(4)}</Text>
                <Text style={styles.tokenValue}>${usdValue.toFixed(2)}</Text>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.subtle}>No SPL tokens found.</Text>
        )}
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#facc15'
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
    color: '#6b7280'
  },
  subtle: {
    color: '#6b7280'
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12
  },
  totalCard: {
    backgroundColor: '#ede9fe',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center'
  },
  totalLabel: {
    color: '#6b7280',
    fontWeight: '600'
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7c3aed'
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12
  },
  actionButton: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    borderRadius: 24
  },
  assetsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#facc15'
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  assetHeaderText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600'
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 6
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  tokenLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700'
  },
  tokenSymbol: {
    fontWeight: '700',
    color: '#374151'
  },
  tokenPrice: {
    color: '#6b7280',
    fontSize: 12
  },
  tokenValue: {
    minWidth: 70,
    textAlign: 'right',
    color: '#374151'
  },
  txRow: {
    marginBottom: 8
  },
  removeButton: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626'
  }
});
