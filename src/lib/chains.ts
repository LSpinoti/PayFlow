import { mainnet, arbitrum, optimism, base, polygon } from "wagmi/chains";

// Chains supported by PayFlow
export const SUPPORTED_CHAINS = [mainnet, arbitrum, optimism, base, polygon] as const;

// Chain metadata for UI display
export const CHAIN_META: Record<
  number,
  { name: string; color: string; icon: string }
> = {
  1: { name: "Ethereum", color: "#627EEA", icon: "ETH" },
  42161: { name: "Arbitrum", color: "#28A0F0", icon: "ARB" },
  10: { name: "Optimism", color: "#FF0420", icon: "OP" },
  8453: { name: "Base", color: "#0052FF", icon: "BASE" },
  137: { name: "Polygon", color: "#8247E5", icon: "MATIC" },
};

// Get chain name by ID
export function getChainName(chainId: number): string {
  return CHAIN_META[chainId]?.name ?? `Chain ${chainId}`;
}

// Get chain color by ID
export function getChainColor(chainId: number): string {
  return CHAIN_META[chainId]?.color ?? "#888888";
}
