import { Connection, Keypair, Transaction } from '@solana/web3.js';
import { CONFIG } from '../config';

export type QuoteRequest = {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
};

export async function getJupiterQuote(request: QuoteRequest) {
  const params = new URLSearchParams({
    inputMint: request.inputMint,
    outputMint: request.outputMint,
    amount: request.amount.toString(),
    slippageBps: request.slippageBps.toString()
  });
  const response = await fetch(`${CONFIG.jupiter.quoteUrl}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Jupiter quote');
  }
  return response.json();
}

export async function createSwapTransaction(quote: any, userPublicKey: string) {
  const response = await fetch(CONFIG.jupiter.swapUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create swap transaction');
  }

  const payload = await response.json();
  return payload.swapTransaction as string;
}

export async function signAndSendSwap(
  connection: Connection,
  signer: Keypair,
  serializedTransaction: string,
  sendViaHelius = false
) {
  const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));
  transaction.partialSign(signer);
  const raw = transaction.serialize();

  if (sendViaHelius) {
    const response = await fetch(`${CONFIG.helius.sendTransactionUrl}${CONFIG.helius.backrunApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction: raw.toString('base64'),
        commitment: CONFIG.rpc.commitment
      })
    });
    if (!response.ok) {
      throw new Error('Helius backrun send failed');
    }
    const payload = await response.json();
    return payload.signature as string;
  }

  return connection.sendRawTransaction(raw, {
    skipPreflight: false,
    preflightCommitment: CONFIG.rpc.commitment
  });
}
