export const CONFIG = {
  rpc: {
    primary: 'https://api.mainnet-beta.solana.com',
    heliusFallback: 'https://mainnet.helius-rpc.com',
    commitment: 'confirmed'
  },
  helius: {
    backrunApiKey: 'a4453b96-6663-4daf-b551-8aae1d403b45',
    sendTransactionUrl: 'https://api.helius.xyz/v0/transactions?api-key='
  },
  fees: {
    closeAccountFeeSol: 0.00005,
    feeWallet: 'EAT5eyaiBWCMy2k2AJQQxP3WsZXXdcWzfCYgXcaTPQTa'
  },
  jupiter: {
    quoteUrl: 'https://quote-api.jup.ag/v6/quote',
    swapUrl: 'https://quote-api.jup.ag/v6/swap'
  },
  prices: {
    coingeckoBase: 'https://api.coingecko.com/api/v3',
    birdeyeBase: 'https://public-api.birdeye.so'
  }
};

export type CommitmentType = 'confirmed' | 'finalized' | 'processed';
