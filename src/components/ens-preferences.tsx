"use client";

import { useState } from "react";
import {
  useAccount,
  useEnsName,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { mainnet } from "wagmi/chains";
import { namehash } from "viem";
import { Save, Loader2, Check, ExternalLink } from "lucide-react";
import { RESOLVER_ABI } from "@/lib/ens";
import { ENS_RECORDS, ENS_PUBLIC_RESOLVER, TOKENS } from "@/lib/constants";
import { CHAIN_META } from "@/lib/chains";
import { useEnsPaymentPrefs } from "@/hooks/useEnsPaymentPrefs";

export function EnsPreferences() {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  const { preferences, rawChain, rawToken, rawMaxTip, isLoading } =
    useEnsPaymentPrefs(ensName ?? undefined);

  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [maxTip, setMaxTip] = useState<string>("");
  const [currentField, setCurrentField] = useState<string>("");

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Initialize form values from existing records
  const effectiveChain = selectedChain || rawChain || "";
  const effectiveToken = selectedToken || rawToken || "";
  const effectiveMaxTip = maxTip || rawMaxTip || "";

  if (!ensName) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <ExternalLink className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">ENS Name Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You need an ENS name to set payment preferences. Get one at{" "}
          <a
            href="https://app.ens.domains"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            app.ens.domains
          </a>
        </p>
      </div>
    );
  }

  function handleSave(key: string, value: string) {
    if (!ensName || !value) return;
    setCurrentField(key);
    writeContract({
      address: ENS_PUBLIC_RESOLVER,
      abi: RESOLVER_ABI,
      functionName: "setText",
      args: [namehash(ensName), key, value],
      chainId: mainnet.id,
    });
  }

  const supportedChains = Object.entries(CHAIN_META);

  return (
    <div className="space-y-6">
      {/* Preferred Chain */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Preferred Chain</h3>
            <p className="text-sm text-muted-foreground">
              The chain where you prefer to receive payments
            </p>
          </div>
          {preferences.chainId && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary">
              Currently: {CHAIN_META[preferences.chainId]?.name ?? preferences.chainId}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <select
            value={effectiveChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none"
          >
            <option value="">Select a chain</option>
            {supportedChains.map(([id, meta]) => (
              <option key={id} value={id}>
                {meta.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleSave(ENS_RECORDS.CHAIN, effectiveChain)}
            disabled={!effectiveChain || isPending || isConfirming}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && currentField === ENS_RECORDS.CHAIN ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess && currentField === ENS_RECORDS.CHAIN ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Preferred Token */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Preferred Token</h3>
            <p className="text-sm text-muted-foreground">
              The token address you prefer to receive
            </p>
          </div>
          {preferences.token && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-mono">
              {preferences.token.slice(0, 6)}...{preferences.token.slice(-4)}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <select
            value={effectiveToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none"
          >
            <option value="">Select a token</option>
            {Object.entries(TOKENS).map(([chainId, token]) => (
              <option key={chainId} value={token.usdc}>
                {token.name} on {CHAIN_META[Number(chainId)]?.name ?? chainId}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleSave(ENS_RECORDS.TOKEN, effectiveToken)}
            disabled={!effectiveToken || isPending || isConfirming}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && currentField === ENS_RECORDS.TOKEN ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess && currentField === ENS_RECORDS.TOKEN ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Max Tip */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Max Tip Amount</h3>
            <p className="text-sm text-muted-foreground">
              Maximum single payment you accept (in token units)
            </p>
          </div>
          {preferences.maxTip && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary">
              Currently: {preferences.maxTip}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. 100"
            value={effectiveMaxTip}
            onChange={(e) => setMaxTip(e.target.value)}
            className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none"
          />
          <button
            onClick={() => handleSave(ENS_RECORDS.MAX_TIP, effectiveMaxTip)}
            disabled={!effectiveMaxTip || isPending || isConfirming}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && currentField === ENS_RECORDS.MAX_TIP ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess && currentField === ENS_RECORDS.MAX_TIP ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border/50 p-4 bg-secondary/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Payment preferences are stored as custom ENS text records on your ENS
          name. These records are publicly readable, allowing anyone to send you
          payments with your preferred settings. Each save requires an on-chain
          transaction on Ethereum mainnet.
        </p>
      </div>
    </div>
  );
}
