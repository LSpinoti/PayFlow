import { createConfig, getQuote, getRoutes, type Route } from "@lifi/sdk";

// Initialize LI.FI SDK
let initialized = false;

export function initLifi() {
  if (initialized) return;
  createConfig({
    integrator: "PayFlow",
  });
  initialized = true;
}

// Quote parameters
export interface DepositQuoteParams {
  fromChainId: number;
  fromTokenAddress: string;
  fromAmount: string;
  fromAddress: string;
  toChainId: number;
  toTokenAddress: string;
  toAddress?: string;
}

// Get a cross-chain deposit quote
export async function getDepositQuote(params: DepositQuoteParams) {
  initLifi();

  const quote = await getQuote({
    fromChain: params.fromChainId,
    fromToken: params.fromTokenAddress,
    fromAmount: params.fromAmount,
    fromAddress: params.fromAddress,
    toChain: params.toChainId,
    toToken: params.toTokenAddress,
    toAddress: params.toAddress,
    slippage: 0.005, // 0.5% slippage
  });

  return quote;
}

// Get multiple route options for a deposit
export async function getDepositRoutes(params: DepositQuoteParams) {
  initLifi();

  const result = await getRoutes({
    fromChainId: params.fromChainId,
    fromTokenAddress: params.fromTokenAddress,
    fromAmount: params.fromAmount,
    fromAddress: params.fromAddress,
    toChainId: params.toChainId,
    toTokenAddress: params.toTokenAddress,
    toAddress: params.toAddress,
    options: {
      slippage: 0.005,
      order: "CHEAPEST",
    },
  });

  return result.routes;
}

// Format token amount for display (assuming 6 decimals for USDC)
export function formatTokenAmount(
  amount: string,
  decimals: number = 6
): string {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fractional = value % divisor;
  const fractionalStr = fractional.toString().padStart(decimals, "0");
  // Show up to 2 decimal places
  return `${whole}.${fractionalStr.slice(0, 2)}`;
}

// Parse human-readable amount to smallest unit
export function parseTokenAmount(
  amount: string,
  decimals: number = 6
): string {
  const parts = amount.split(".");
  const whole = parts[0] || "0";
  const frac = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals);
  return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(frac)).toString();
}

// Extract useful info from a route for display
export function extractRouteInfo(route: Route) {
  const steps = route.steps || [];
  const firstStep = steps[0];
  const lastStep = steps[steps.length - 1];

  return {
    fromToken: firstStep?.action?.fromToken?.symbol ?? "Unknown",
    toToken: lastStep?.action?.toToken?.symbol ?? "Unknown",
    fromAmount: route.fromAmount,
    toAmount: route.toAmount,
    estimatedTime: steps.reduce(
      (total, step) => total + (step.estimate?.executionDuration ?? 0),
      0
    ),
    gasCost: route.gasCostUSD ?? "0",
    steps: steps.length,
    toolsUsed: steps.map((s) => s.toolDetails?.name ?? s.tool).join(" -> "),
  };
}
