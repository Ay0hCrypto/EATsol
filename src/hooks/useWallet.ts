import { useCallback, useEffect, useState } from 'react';
import { Keypair } from '@solana/web3.js';
import { keypairFromMnemonic, keypairFromSecretKey } from '../lib/solana';
import { clearWallet, loadWallet, saveWallet, StoredWallet } from '../lib/storage';

export function useWallet() {
  const [wallet, setWallet] = useState<Keypair | null>(null);
  const [stored, setStored] = useState<StoredWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await loadWallet();
      setStored(data);
      if (data?.secretKey) {
        setWallet(keypairFromSecretKey(data.secretKey));
      }
      setLoading(false);
    };
    load();
  }, []);

  const importMnemonic = useCallback(async (mnemonic: string) => {
    const keypair = keypairFromMnemonic(mnemonic.trim());
    const payload: StoredWallet = {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: Array.from(keypair.secretKey),
      mnemonic
    };
    await saveWallet(payload);
    setStored(payload);
    setWallet(keypair);
  }, []);

  const importSecretKey = useCallback(async (secret: number[]) => {
    const keypair = keypairFromSecretKey(secret);
    const payload: StoredWallet = {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: Array.from(keypair.secretKey)
    };
    await saveWallet(payload);
    setStored(payload);
    setWallet(keypair);
  }, []);

  const removeWallet = useCallback(async () => {
    await clearWallet();
    setWallet(null);
    setStored(null);
  }, []);

  return {
    wallet,
    stored,
    loading,
    importMnemonic,
    importSecretKey,
    removeWallet
  };
}
