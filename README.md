# OTC Desk - P2P Token Swaps on Base

A real peer-to-peer OTC (Over-The-Counter) token swap mini app for the Base App ecosystem. Users create escrow-backed trade orders, other users fill them, and the platform collects a 0.75% fee on every fill.

**Stack:** Next.js 15, MiniKit, OnchainKit, Wagmi, Viem, Solidity, Hardhat, Tailwind CSS  
**Network:** Base Sepolia Testnet (Chain ID: 84532)

---

## Prerequisites (Windows)

1. **Node.js 18+** — Download from https://nodejs.org
2. **VS Code** — You already have this
3. **Git** — https://git-scm.com/download/win
4. **MetaMask or Coinbase Wallet** browser extension
5. **Base Sepolia ETH** — Get free testnet ETH from https://www.alchemy.com/faucets/base-sepolia

---

## Step-by-Step Implementation

### STEP 1 — Install Dependencies

Open VS Code terminal (Ctrl + `) and run:

```bash
cd otc-desk
npm install
```

### STEP 2 — Get API Keys

You need 3 things:

**A) Coinbase Developer Platform (CDP) API Key:**
1. Go to https://portal.cdp.coinbase.com
2. Create a project
3. Copy the API key — this is your `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
4. Enable the Paymaster for Base Sepolia and copy that URL

**B) BaseScan API Key (for contract verification):**
1. Go to https://basescan.org/register
2. Create account, go to API Keys, create a key

**C) Deployer Wallet Private Key:**
1. Create a new wallet in MetaMask (do NOT use your main wallet)
2. Export the private key
3. Fund it with Base Sepolia ETH from the faucet

### STEP 3 — Configure Environment

Copy the example file:

```bash
copy .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```
NEXT_PUBLIC_OTC_CONTRACT=        (leave empty for now)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=  (your CDP API key)
NEXT_PUBLIC_PAYMASTER_URL=       (your paymaster URL)
DEPLOYER_PRIVATE_KEY=            (your deployer wallet private key, no 0x prefix)
BASESCAN_API_KEY=                (your BaseScan API key)
```

### STEP 4 — Deploy the Smart Contract

```bash
npx hardhat compile --config hardhat.config.cjs
npx hardhat run scripts/deploy.cjs --network base-sepolia --config hardhat.config.cjs
```

You will see output like:

```
OTCDesk deployed to: 0xABC123...
```

Copy that address and paste it into `.env.local` as `NEXT_PUBLIC_OTC_CONTRACT`.

### STEP 5 — Get Testnet USDC (Optional)

The official Circle USDC on Base Sepolia is at:
`0x036CbD53842c5426634e7929541eC2318f3dCF7E`

To get testnet USDC, use the Circle faucet: https://faucet.circle.com
Select "Base Sepolia" and request USDC.

### STEP 6 — Run the App Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### STEP 7 — Test the Flow

1. Connect your wallet (switch to Base Sepolia network)
2. Create an order (e.g., sell 0.001 ETH for 3 USDC)
3. Your ETH is locked in the smart contract escrow
4. Open a second browser/wallet and fill the order
5. The filler pays 3 USDC + 0.75% fee, receives the escrowed ETH
6. The maker receives 3 USDC directly

### STEP 8 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts. Then add your environment variables in the Vercel dashboard under Settings > Environment Variables.

### STEP 9 — Register as Mini App

1. Go to https://www.base.dev/preview
2. Enter your deployed Vercel URL
3. Use the "Account association" tab to generate credentials
4. Update the `accountAssociation` fields in `src/app/.well-known/farcaster.json/route.ts`
5. Redeploy to Vercel
6. Post your app URL in the Base App to publish it

---

## Project Structure

```
otc-desk/
  contracts/
    OTCDesk.sol          Smart contract (Solidity)
  scripts/
    deploy.cjs           Hardhat deployment script
  src/
    app/
      layout.tsx          Root layout with metadata
      page.tsx            Main page
      providers.tsx       MiniKit + Wagmi providers
      globals.css         Premium dark theme styles
      .well-known/        Farcaster manifest route
      api/webhook/        Notification webhook
    components/
      Header.tsx          Nav bar with wallet connect
      StatsBar.tsx        Protocol metrics display
      CreateOrder.tsx     Order creation form
      OrderBook.tsx       Live order book with fill/cancel
      TokenSelector.tsx   Token dropdown picker
    lib/
      abi.ts              Contract ABIs
      tokens.ts           Token definitions (Base Sepolia)
      contracts.ts        Contract config and helpers
  hardhat.config.cjs      Hardhat config for deployment
  tailwind.config.js      Custom dark theme
```

---

## How It Works

1. **Maker** creates an order by depositing sell tokens into the contract escrow
2. **Taker** fills the order by sending the requested buy tokens + 0.75% fee
3. The contract atomically swaps: taker gets escrowed tokens, maker gets buy tokens
4. The 0.75% fee goes to the contract owner (you)
5. Makers can cancel unfilled orders and reclaim their escrowed tokens

---

## Smart Contract Details

- **Network:** Base Sepolia (84532)
- **Fee:** 0.75% (75 basis points) charged to the taker
- **Escrow:** Tokens locked in contract until filled or cancelled
- **Supports:** ETH and any ERC-20 token
- **Security:** ReentrancyGuard pattern, maker-only cancellation

---

## Adding More Tokens

Edit `src/lib/tokens.ts` and add entries to the `TOKENS` object:

```typescript
WETH: {
  address: "0x4200000000000000000000000000000000000006",
  symbol: "WETH",
  name: "Wrapped Ether",
  decimals: 18,
  logo: "/weth.svg",
},
```

---

## Going to Mainnet

When ready for Base mainnet:

1. Change `baseSepolia` to `base` in `providers.tsx`
2. Update token addresses to mainnet addresses in `tokens.ts`
3. Update `CHAIN` in `contracts.ts`
4. Redeploy the contract to Base mainnet
5. Update `NEXT_PUBLIC_OTC_CONTRACT` in your env
