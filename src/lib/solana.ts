import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmRawTransaction
} from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import { mnemonicToSeedSync } from '@scure/bip39';
import { CONFIG, CommitmentType } from '../config';
import {
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token';

export const getConnection = (rpcOverride?: string) =>
  new Connection(rpcOverride ?? CONFIG.rpc.primary, {
    commitment: CONFIG.rpc.commitment as CommitmentType
  });

export function keypairFromMnemonic(mnemonic: string): Keypair {
  const seed = mnemonicToSeedSync(mnemonic);
  const derived = derivePath("m/44'/501'/0'/0'", seed.toString('hex'));
  return Keypair.fromSeed(derived.key);
}

export function keypairFromSecretKey(secretKey: number[]): Keypair {
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

export async function getBalances(connection: Connection, owner: PublicKey) {
  const [solBalance, tokenAccounts] = await Promise.all([
    connection.getBalance(owner, CONFIG.rpc.commitment as CommitmentType),
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID })
  ]);

  const tokens = tokenAccounts.value.map((account) => {
    const parsed = account.account.data.parsed.info;
    return {
      mint: parsed.mint as string,
      balance: parsed.tokenAmount.uiAmount as number,
      decimals: parsed.tokenAmount.decimals as number,
      address: account.pubkey.toBase58()
    };
  });

  return {
    sol: solBalance / LAMPORTS_PER_SOL,
    tokens
  };
}

export async function sendSol(
  connection: Connection,
  from: Keypair,
  destination: string,
  amountSol: number
) {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: new PublicKey(destination),
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL)
    })
  );
  transaction.feePayer = from.publicKey;
  const { blockhash } = await connection.getLatestBlockhash(CONFIG.rpc.commitment as CommitmentType);
  transaction.recentBlockhash = blockhash;
  transaction.sign(from);
  const raw = transaction.serialize();
  return sendAndConfirmRawTransaction(connection, raw, {
    commitment: CONFIG.rpc.commitment as CommitmentType
  });
}

export async function sendSplToken(
  connection: Connection,
  from: Keypair,
  destination: string,
  mint: string,
  amount: number,
  decimals: number
) {
  const destinationPubkey = new PublicKey(destination);
  const mintPubkey = new PublicKey(mint);
  const sourceAta = await getAssociatedTokenAddress(mintPubkey, from.publicKey);
  const destAta = await getAssociatedTokenAddress(mintPubkey, destinationPubkey);
  const transaction = new Transaction().add(
    createTransferInstruction(
      sourceAta,
      destAta,
      from.publicKey,
      Math.round(amount * Math.pow(10, decimals))
    )
  );
  transaction.feePayer = from.publicKey;
  const { blockhash } = await connection.getLatestBlockhash(CONFIG.rpc.commitment as CommitmentType);
  transaction.recentBlockhash = blockhash;
  transaction.sign(from);
  const raw = transaction.serialize();
  return sendAndConfirmRawTransaction(connection, raw, {
    commitment: CONFIG.rpc.commitment as CommitmentType
  });
}

export async function closeEmptyTokenAccount(
  connection: Connection,
  from: Keypair,
  tokenAccount: PublicKey,
  feeDestination: PublicKey,
  feeLamports: number
) {
  const transaction = new Transaction().add(
    createCloseAccountInstruction(tokenAccount, from.publicKey, from.publicKey),
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: feeDestination,
      lamports: feeLamports
    })
  );
  transaction.feePayer = from.publicKey;
  const { blockhash } = await connection.getLatestBlockhash(CONFIG.rpc.commitment as CommitmentType);
  transaction.recentBlockhash = blockhash;
  transaction.sign(from);
  const raw = transaction.serialize();
  return sendAndConfirmRawTransaction(connection, raw, {
    commitment: CONFIG.rpc.commitment as CommitmentType
  });
}
