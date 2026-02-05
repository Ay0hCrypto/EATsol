import { Connection, PublicKey } from '@solana/web3.js';
import { CONFIG, CommitmentType } from '../config';

export async function getConfirmedTransactions(connection: Connection, owner: PublicKey) {
  const signatures = await connection.getSignaturesForAddress(owner, {
    limit: 20
  });

  const confirmed = signatures.filter((sig) => sig.confirmationStatus === 'confirmed' || sig.confirmationStatus === 'finalized');
  const transactions = await Promise.all(
    confirmed.map((sig) => connection.getParsedTransaction(sig.signature, { commitment: CONFIG.rpc.commitment as CommitmentType }))
  );

  return transactions
    .map((tx, index) => ({
      signature: confirmed[index].signature,
      slot: confirmed[index].slot,
      blockTime: confirmed[index].blockTime,
      tx
    }))
    .filter((item) => item.tx);
}
