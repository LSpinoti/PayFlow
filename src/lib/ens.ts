import { encodeFunctionData, namehash } from "viem";
import { ENS_RECORDS, ENS_PUBLIC_RESOLVER } from "./constants";

// ENS Public Resolver ABI (setText function)
export const RESOLVER_ABI = [
  {
    name: "setText",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "value", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "text",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
    ],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

// Payment preferences stored in ENS text records
export interface PaymentPreferences {
  chainId: number | null;
  token: string | null;
  maxTip: string | null;
}

// Build the setText transaction data for a given ENS name and key/value
export function buildSetTextTx(ensName: string, key: string, value: string) {
  const node = namehash(ensName);
  const data = encodeFunctionData({
    abi: RESOLVER_ABI,
    functionName: "setText",
    args: [node, key, value],
  });

  return {
    to: ENS_PUBLIC_RESOLVER,
    data,
  };
}

// Build multiple setText transactions for all payment preferences
export function buildSetPreferencesTxs(
  ensName: string,
  prefs: Partial<{
    chainId: string;
    token: string;
    maxTip: string;
  }>
) {
  const txs: { key: string; value: string }[] = [];

  if (prefs.chainId !== undefined) {
    txs.push({ key: ENS_RECORDS.CHAIN, value: prefs.chainId });
  }
  if (prefs.token !== undefined) {
    txs.push({ key: ENS_RECORDS.TOKEN, value: prefs.token });
  }
  if (prefs.maxTip !== undefined) {
    txs.push({ key: ENS_RECORDS.MAX_TIP, value: prefs.maxTip });
  }

  return txs.map(({ key, value }) => buildSetTextTx(ensName, key, value));
}

// Parse chain ID from ENS text record value
export function parseChainId(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}
