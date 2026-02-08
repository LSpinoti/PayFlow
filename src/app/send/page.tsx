"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Send,
  Search,
  Loader2,
  User,
  Globe,
  ArrowRightLeft,
  Zap,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { useEnsPaymentPrefs } from "@/hooks/useEnsPaymentPrefs";
import { LifiDeposit } from "@/components/lifi-deposit";
import { YellowSessionManager } from "@/components/yellow-session";
import { CHAIN_META } from "@/lib/chains";
import { TOKENS, DEFAULT_PREFS } from "@/lib/constants";

type FlowStep = "resolve" | "deposit" | "pay";

export default function SendPage() {
  const { isConnected, address } = useAccount();
  const [ensInput, setEnsInput] = useState("");
  const [resolvedName, setResolvedName] = useState<string | undefined>();
  const [activeStep, setActiveStep] = useState<FlowStep>("resolve");
  const [depositComplete, setDepositComplete] = useState(false);

  // Resolve ENS name when user submits
  const {
    address: recipientAddress,
    avatar,
    preferences,
    isLoading,
    rawChain,
    rawToken,
    rawMaxTip,
  } = useEnsPaymentPrefs(resolvedName);

  // Determine effective payment params
  const effectiveChainId = preferences.chainId ?? DEFAULT_PREFS.chainId;
  const effectiveToken =
    preferences.token ?? TOKENS[effectiveChainId]?.usdc ?? DEFAULT_PREFS.token;
  const chainName = CHAIN_META[effectiveChainId]?.name ?? `Chain ${effectiveChainId}`;

  function handleResolve() {
    if (!ensInput) return;
    const name = ensInput.endsWith(".eth") ? ensInput : `${ensInput}.eth`;
    setResolvedName(name);
    setActiveStep("resolve");
    setDepositComplete(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleResolve();
  }

  // Auto-advance to deposit step when resolution completes
  useEffect(() => {
    if (recipientAddress && !isLoading) {
      setActiveStep("deposit");
    }
  }, [recipientAddress, isLoading]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Connect your wallet to send payments.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Send className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Send Payment</h1>
          <p className="text-sm text-muted-foreground">
            Pay anyone instantly by their ENS name
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: "resolve" as FlowStep, label: "Resolve ENS", icon: Globe },
          { key: "deposit" as FlowStep, label: "Cross-Chain Deposit", icon: ArrowRightLeft },
          { key: "pay" as FlowStep, label: "Instant Payment", icon: Zap },
        ].map(({ key, label, icon: Icon }, index) => {
          const isActive = activeStep === key;
          const isComplete =
            (key === "resolve" && recipientAddress) ||
            (key === "deposit" && depositComplete);
          return (
            <div key={key} className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors flex-1 ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : isComplete
                      ? "bg-green-500/10 text-green-400"
                      : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline text-xs font-medium">
                  {label}
                </span>
              </div>
              {index < 2 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: ENS Resolution */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-purple-400" />
          <h2 className="font-semibold">Step 1: Resolve ENS Name</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="vitalik.eth"
              value={ensInput}
              onChange={(e) => setEnsInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-3 py-2.5 bg-secondary rounded-lg text-sm border border-border focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={handleResolve}
            disabled={!ensInput || isLoading}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Resolve"
            )}
          </button>
        </div>

        {/* Resolution Result */}
        {resolvedName && !isLoading && (
          <div className="space-y-3">
            {recipientAddress ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/10 rounded-lg">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={resolvedName}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{resolvedName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {recipientAddress.slice(0, 10)}...
                      {recipientAddress.slice(-8)}
                    </div>
                  </div>
                  <Check className="h-5 w-5 text-green-400" />
                </div>

                {/* Payment Preferences */}
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Payment Preferences (from ENS text records)
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Chain</div>
                      <div className="text-sm font-medium">
                        {rawChain ? chainName : (
                          <span className="text-muted-foreground">
                            Default ({CHAIN_META[DEFAULT_PREFS.chainId]?.name})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Token</div>
                      <div className="text-sm font-medium">
                        {rawToken ? (
                          <span className="font-mono text-xs">
                            {rawToken.slice(0, 6)}...{rawToken.slice(-4)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">USDC</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Max Tip
                      </div>
                      <div className="text-sm font-medium">
                        {rawMaxTip ? `${rawMaxTip} USDC` : (
                          <span className="text-muted-foreground">No limit</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-destructive/5 border border-destructive/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  Could not resolve &quot;{resolvedName}&quot;. Check the name
                  and try again.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Cross-Chain Deposit */}
      {recipientAddress && (
        <div
          className={`glass-card rounded-xl p-6 mb-6 transition-opacity ${
            activeStep === "deposit" || depositComplete ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="h-4 w-4 text-blue-400" />
            <h2 className="font-semibold">Step 2: Fund via LI.FI</h2>
            {depositComplete && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                Complete
              </span>
            )}
          </div>

          <LifiDeposit
            toChainId={effectiveChainId}
            toTokenAddress={effectiveToken}
            toAddress={recipientAddress}
            onSuccess={() => {
              setDepositComplete(true);
              setActiveStep("pay");
            }}
          />

          {!depositComplete && (
            <button
              onClick={() => {
                setDepositComplete(true);
                setActiveStep("pay");
              }}
              className="w-full mt-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded-lg transition-colors"
            >
              Skip deposit (use existing balance)
            </button>
          )}
        </div>
      )}

      {/* Step 3: Instant Payment via Yellow */}
      {recipientAddress && (depositComplete || activeStep === "pay") && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h2 className="font-semibold">Step 3: Instant Payment</h2>
          </div>

          <YellowSessionManager
            recipientAddress={recipientAddress}
            asset="usdc"
            initialAmount="1000000"
          />
        </div>
      )}
    </div>
  );
}
