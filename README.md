# PayFlow - ENS-Powered Cross-Chain Instant Payments

**Pay anyone by ENS name** with instant off-chain payments via Yellow Network state channels and cross-chain deposits via LI.FI.

## Overview

PayFlow combines three powerful Web3 primitives into a seamless payment experience:

1. **ENS** - Recipients store payment preferences (preferred chain, token, tip limits) as custom ENS text records. Senders simply enter an ENS name and the app auto-configures everything.

2. **LI.FI** - Cross-chain deposit routing. Fund payments from any EVM chain (Ethereum, Arbitrum, Optimism, Base, Polygon) with automatic bridge + swap in a single transaction.

3. **Yellow Network** - State channel-based instant payments. After depositing, all payments happen off-chain in milliseconds with zero gas fees. On-chain settlement only when the session ends.

## Architecture

```
Sender Flow                    Yellow State Channels             Receiver Flow
-----------                    ----------------------             -------------
Enter ENS Name                                                   
  |                                                              
Resolve ENS Records                                              
  |                                                              
Read Payment Prefs -------> LI.FI Cross-Chain Deposit            
  (chain, token, maxTip)        |                                
                            Fund Session                         
                                |                                
                          Instant Off-Chain Payments              
                            (gasless, ms latency)                
                                |                                
                          Session Settlement ---------> On-Chain Withdrawal
```

### ENS Text Records

PayFlow uses custom ENS text records to store payment preferences:

| Record Key | Description | Example |
|---|---|---|
| `com.payflow.chain` | Preferred settlement chain ID | `42161` (Arbitrum) |
| `com.payflow.token` | Preferred token contract address | `0xaf88d065e...` (USDC) |
| `com.payflow.maxTip` | Maximum single payment amount | `100` |

### How It Works

1. **Resolve**: Enter a recipient's ENS name. PayFlow resolves their address and reads their `com.payflow.*` text records to determine their preferred chain, token, and payment limits.

2. **Deposit**: Using LI.FI, bridge and swap tokens from your current chain to the recipient's preferred chain and token in a single transaction. LI.FI finds the optimal route across DEXs and bridges.

3. **Pay**: Create a Yellow Network state channel session with the recipient. Send instant, gasless micropayments off-chain. Each payment updates the state channel balance in milliseconds.

4. **Settle**: When done, close the session. Yellow Network settles the final balances on-chain via smart contracts, ensuring trustless fund recovery.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 with custom dark theme
- **Web3**: wagmi v3 + viem + RainbowKit
- **Cross-Chain**: @lifi/sdk for bridge + swap routing
- **State Channels**: @erc7824/nitrolite (Yellow Network / Nitrolite SDK)
- **Identity**: ENS via wagmi hooks + viem for custom text record writes

## Project Structure

```
src/
  app/
    layout.tsx              Root layout with providers
    page.tsx                Landing page
    profile/page.tsx        Set ENS payment preferences
    send/page.tsx           Send payment flow (3-step)
    dashboard/page.tsx      Sessions, balances, activity
  components/
    providers.tsx           wagmi + RainbowKit + React Query
    navbar.tsx              Navigation with wallet connect
    ens-profile.tsx         ENS name + avatar display
    ens-preferences.tsx     Form to set ENS text records
    lifi-deposit.tsx        Cross-chain deposit widget
    yellow-session.tsx      Yellow payment session manager
    session-card.tsx        Session display card
  lib/
    ens.ts                  ENS helper functions
    lifi.ts                 LI.FI SDK configuration
    yellow.ts               Yellow Network connection manager
    chains.ts               Supported chain metadata
    constants.ts            Addresses, record keys, defaults
  hooks/
    useEnsPaymentPrefs.ts   Read ENS payment preferences
    useLifiDeposit.ts       LI.FI deposit quote + execute
    useYellowSession.ts     Yellow session lifecycle
```

## Getting Started

### Prerequisites

- Node.js 18+
- A wallet (MetaMask recommended)
- A WalletConnect Project ID (get one at https://cloud.walletconnect.com)

### Installation

```bash
git clone <repo-url>
cd payflow
npm install
```

### Configuration

Copy the environment file and add your WalletConnect Project ID:

```bash
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_WC_PROJECT_ID
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build

```bash
npm run build
npm start
```

## Demo Flow

1. **Connect wallet** on the landing page
2. **Set preferences** at `/profile` - configure your preferred chain, token, and max tip as ENS text records
3. **Send payment** at `/send`:
   - Enter recipient ENS name (e.g., `vitalik.eth`)
   - View their resolved address and payment preferences
   - Deposit funds cross-chain via LI.FI
   - Create a Yellow Network session and send instant payments
4. **View activity** at `/dashboard` - see active sessions, payment history, and stats

## Prize Track Qualification

### Yellow Network

- Uses `@erc7824/nitrolite` SDK for state channel management
- Demonstrates off-chain transaction logic with instant micropayments
- Session-based spending with WebSocket connection to ClearNode
- On-chain settlement when sessions close

### LI.FI

- Uses `@lifi/sdk` for cross-chain swap + bridge routing
- Supports 5 EVM chains: Ethereum, Arbitrum, Optimism, Base, Polygon
- Shows route details (steps, estimated time, gas cost) before execution
- Working frontend with full deposit flow

### ENS

- Custom ENS code using wagmi hooks (`useEnsText`, `useEnsAddress`, `useEnsAvatar`)
- Creative DeFi use: payment preferences stored as ENS text records
- Writes custom records (`com.payflow.chain`, `com.payflow.token`, `com.payflow.maxTip`) via ENS Public Resolver
- Dynamic resolution - no hard-coded values
- Reads ENS avatar and displays throughout the app

## License

MIT
# PayFlow
