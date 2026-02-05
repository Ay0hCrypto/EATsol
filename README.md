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

## Environment variables

Set `HELIUS_API_KEY` when building/running so the key is not hardcoded in the repo:

```bash
HELIUS_API_KEY=your-key npm run android
```

> Note: any API key embedded in a client app can be extracted from the APK. Use server-side proxies if you need true secrecy.

## Android release build (APK)

### Option A: Android Studio / Gradle (local)

```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

Your APK will be in `android/app/build/outputs/apk/release/`.

## Icon asset

The repo uses an SVG icon at `assets/icon.svg` to avoid binary files. If your build tooling requires PNG icons, export this SVG to PNG and update `app.json` accordingly.

### Option B: Expo EAS build (cloud)

```bash
eas build -p android --profile production
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
