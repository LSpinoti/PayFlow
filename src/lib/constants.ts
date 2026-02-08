// ENS custom text record keys for PayFlow payment preferences
export const ENS_RECORDS = {
  CHAIN: "com.payflow.chain",
  TOKEN: "com.payflow.token",
  MAX_TIP: "com.payflow.maxTip",
} as const;

// ENS Public Resolver on mainnet
export const ENS_PUBLIC_RESOLVER = "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63" as const;

// Yellow Network ClearNode endpoints
export const YELLOW_ENDPOINTS = {
  PRODUCTION: "wss://clearnet.yellow.com/ws",
  SANDBOX: "wss://clearnet-sandbox.yellow.com/ws",
} as const;

// Supported token addresses by chain
export const TOKENS: Record<number, { usdc: string; name: string }> = {
  1: {
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    name: "USDC",
  },
  42161: {
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    name: "USDC",
  },
  10: {
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    name: "USDC",
  },
  8453: {
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    name: "USDC",
  },
  137: {
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    name: "USDC",
  },
};

// Default payment preferences
export const DEFAULT_PREFS = {
  chainId: 42161, // Arbitrum
  token: TOKENS[42161].usdc,
  maxTip: "100", // 100 USDC
};
