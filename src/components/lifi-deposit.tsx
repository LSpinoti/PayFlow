"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import {
  ArrowRightLeft,
  Loader2,
  Clock,
  Fuel,
  Route,
  ChevronDown,
  Check,
} from "lucide-react";
import { CHAIN_META } from "@/lib/chains";
import { TOKENS } from "@/lib/constants";
import { parseTokenAmount, formatTokenAmount } from "@/lib/lifi";
import { useLifiDeposit } from "@/hooks/useLifiDeposit";

interface LifiDepositProps {
  toChainId: number;
  toTokenAddress: string;
  toAddress?: string;
  onSuccess?: () => void;
}

export function LifiDeposit({
  toChainId,
  toTokenAddress,
  toAddress,
  onSuccess,
}: LifiDepositProps) {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const [amount, setAmount] = useState("");
  const [fromChain, setFromChain] = useState<number>(currentChainId);
  const [showRoutes, setShowRoutes] = useState(false);

  const {
    status,
    routeInfo,
    routes,
    error,
    txHash,
    fetchQuote,
    fetchRoutes,
    executeDeposit,
    reset,
  } = useLifiDeposit();

  const fromToken = TOKENS[fromChain]?.usdc;

  async function handleGetQuote() {
    if (!address || !amount || !fromToken) return;

    await fetchRoutes({
      fromChainId: fromChain,
      fromTokenAddress: fromToken,
      fromAmount: parseTokenAmount(amount),
      fromAddress: address,
      toChainId,
      toTokenAddress,
      toAddress,
    });
  }

  async function handleDeposit() {
    await executeDeposit();
    if (onSuccess) onSuccess();
  }

  const supportedChains = Object.entries(CHAIN_META).filter(
    ([id]) => Number(id) !== toChainId
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ArrowRightLeft className="h-4 w-4 text-blue-400" />
        <h3 className="font-semibold text-sm">Cross-Chain Deposit via LI.FI</h3>
      </div>

      {/* From Chain Selector */}
      <div className="glass-card rounded-lg p-4">
        <label className="text-xs text-muted-foreground mb-2 block">
          From Chain
        </label>
        <select
          value={fromChain}
          onChange={(e) => {
            setFromChain(Number(e.target.value));
            reset();
          }}
          className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none"
        >
          {supportedChains.map(([id, meta]) => (
            <option key={id} value={id}>
              {meta.name}
            </option>
          ))}
        </select>
      </div>

      {/* Amount Input */}
      <div className="glass-card rounded-lg p-4">
        <label className="text-xs text-muted-foreground mb-2 block">
          Amount (USDC)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              reset();
            }}
            className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none font-mono"
          />
          <button
            onClick={handleGetQuote}
            disabled={!amount || !address || status === "quoting"}
            className="px-4 py-2.5 bg-blue-500/15 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "quoting" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Get Quote"
            )}
          </button>
        </div>
      </div>

      {/* Route Destination Info */}
      <div className="glass-card rounded-lg p-4">
        <label className="text-xs text-muted-foreground mb-2 block">
          To Chain
        </label>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: CHAIN_META[toChainId]?.color ?? "#888" }}
          >
            {CHAIN_META[toChainId]?.icon?.charAt(0) ?? "?"}
          </div>
          <span className="text-sm font-medium">
            {CHAIN_META[toChainId]?.name ?? `Chain ${toChainId}`}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            Recipient&apos;s preferred chain
          </span>
        </div>
      </div>

      {/* Quote Results */}
      {routeInfo && status === "quoted" && (
        <div className="glass-card rounded-lg p-4 border-blue-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Route</span>
            <span className="text-xs font-mono text-blue-400">
              {routeInfo.toolsUsed}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Route className="h-3 w-3" />
                <span className="text-xs">Steps</span>
              </div>
              <span className="text-sm font-semibold">{routeInfo.steps}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Est. Time</span>
              </div>
              <span className="text-sm font-semibold">
                {Math.ceil(routeInfo.estimatedTime / 60)}m
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Fuel className="h-3 w-3" />
                <span className="text-xs">Gas</span>
              </div>
              <span className="text-sm font-semibold">
                ${Number(routeInfo.gasCost).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">You receive</span>
            <span className="text-sm font-semibold text-green-400">
              ~{formatTokenAmount(routeInfo.toAmount)} {routeInfo.toToken}
            </span>
          </div>

          {/* Show more routes toggle */}
          {routes.length > 1 && (
            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${showRoutes ? "rotate-180" : ""}`}
              />
              {routes.length} routes available
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg p-3 bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Success */}
      {status === "success" && txHash && (
        <div className="rounded-lg p-3 bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              Deposit confirmed!
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </p>
        </div>
      )}

      {/* Action Button */}
      {status === "quoted" && (
        <button
          onClick={handleDeposit}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Deposit via LI.FI
        </button>
      )}

      {status === "executing" || status === "confirming" ? (
        <button
          disabled
          className="w-full py-3 bg-blue-500/50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {status === "executing" ? "Sending transaction..." : "Confirming..."}
        </button>
      ) : null}
    </div>
  );
}
