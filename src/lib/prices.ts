import { CONFIG } from '../config';

export async function getSolPriceUsd() {
  const response = await fetch(`${CONFIG.prices.coingeckoBase}/simple/price?ids=solana&vs_currencies=usd`);
  if (!response.ok) {
    throw new Error('Failed to fetch SOL price');
  }
  const data = await response.json();
  return data.solana.usd as number;
}

export async function getBirdeyeTokenPriceUsd(mint: string) {
  const response = await fetch(`${CONFIG.prices.birdeyeBase}/public/price?address=${mint}`);
  if (!response.ok) {
    throw new Error('Failed to fetch token price');
  }
  const data = await response.json();
  return data?.data?.value as number | undefined;
}
