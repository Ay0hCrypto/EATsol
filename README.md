# EATsol

Minimal Solana wallet dApp scaffold for Android (React Native + Expo). The app supports:

- Import/export by seed phrase or private key array
- Encrypted local storage via `expo-secure-store`
- SOL + SPL balances
- Send/receive with user approval
- Swap via Jupiter + optional Helius backrun submission
- Close empty token accounts with fee handling
- Confirmed transaction history only
- In-app WebView browser for MWA / WalletConnect flows (manual approval)

## Quick start

```bash
npm install
npm run android
```

## Configuration

All network and fee settings live in `src/config.ts`:

- Mainnet RPC: `https://api.mainnet-beta.solana.com`
- Helius fallback RPC: `https://mainnet.helius-rpc.com`
- Helius Backrun API key
- Fee wallet + close account fee

## Notes

- Swap amounts are entered in base units (lamports for SOL, raw token units for SPL).
- WalletConnect/MWA are stubbed to manual approval for incoming messages.
- Use confirmed commitment for submissions to follow Helius guidance.
