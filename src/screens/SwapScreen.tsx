import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, Switch, View } from 'react-native';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useWallet } from '../hooks/useWallet';
import { getConnection } from '../lib/solana';
import { createSwapTransaction, getJupiterQuote, signAndSendSwap } from '../lib/jupiter';
import { CONFIG } from '../config';

export function SwapScreen() {
  const { wallet } = useWallet();
  const [inputMint, setInputMint] = useState('');
  const [outputMint, setOutputMint] = useState('');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('50');
  const [useHelius, setUseHelius] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [fromToken, setFromToken] = useState<TokenOption | null>(null);
  const [toToken, setToToken] = useState<TokenOption | null>(null);

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
      setFromToken(options[0]);
      setToToken(options[1] ?? options[0]);
    };
    loadTokens();
  }, [wallet]);

  const handleSwap = async () => {
    if (!wallet) {
      return;
    }
    if (!inputMint || !outputMint || !amount) {
      Alert.alert('Missing fields', 'Fill in all swap fields.');
      return;
    }

    Alert.alert('Approve swap', 'Confirm swap transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          setLoading(true);
          try {
            const decimals = fromToken.decimals ?? 0;
            const amountBaseUnits = Math.round(Number(amount) * Math.pow(10, decimals));
            const quote = await getJupiterQuote({
              inputMint: fromToken.mint,
              outputMint: toToken.mint,
              amount: amountBaseUnits,
              slippageBps: Number(slippage)
            });
            const swapTransaction = await createSwapTransaction(quote, wallet.publicKey.toBase58());
            const connection = getConnection(useHelius ? CONFIG.rpc.heliusFallback : CONFIG.rpc.primary);
            await signAndSendSwap(connection, wallet, swapTransaction, useHelius);
            Alert.alert('Swap sent', 'Swap transaction submitted.');
          } catch (error) {
            Alert.alert('Swap failed', 'Unable to complete swap.');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Swap via Jupiter</Text>
      <TextField value={inputMint} onChangeText={setInputMint} placeholder="Input mint" />
      <TextField value={outputMint} onChangeText={setOutputMint} placeholder="Output mint" />
      <TextField value={amount} onChangeText={setAmount} placeholder="Amount (base units)" />
      <TextField value={slippage} onChangeText={setSlippage} placeholder="Slippage (bps)" />
      <View style={styles.row}>
        <Text>Use Helius backrun</Text>
        <Switch value={useHelius} onValueChange={setUseHelius} />
      </View>
      <PrimaryButton label={loading ? 'Swapping...' : 'Approve & Swap'} onPress={handleSwap} disabled={loading} />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
