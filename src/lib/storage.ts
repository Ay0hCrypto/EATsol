import * as SecureStore from 'expo-secure-store';

const WALLET_KEY = 'eatsol.wallet.v1';

export type StoredWallet = {
  publicKey: string;
  secretKey: number[];
  mnemonic?: string;
};

export async function saveWallet(wallet: StoredWallet): Promise<void> {
  await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(wallet));
}

export async function loadWallet(): Promise<StoredWallet | null> {
  const raw = await SecureStore.getItemAsync(WALLET_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredWallet;
  } catch (error) {
    console.warn('Failed to parse wallet', error);
    return null;
  }
}

export async function clearWallet(): Promise<void> {
  await SecureStore.deleteItemAsync(WALLET_KEY);
}
