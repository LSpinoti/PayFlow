"use client";

import { useState } from "react";
import {
  Zap,
  Loader2,
  Wifi,
  WifiOff,
  Send,
  XCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useYellowSession, type YellowStatus } from "@/hooks/useYellowSession";
import { formatTokenAmount } from "@/lib/lifi";
import type { Address } from "viem";

const STATUS_CONFIG: Record<
  YellowStatus,
  { color: string; label: string; icon: typeof Wifi }
> = {
  disconnected: { color: "text-muted-foreground", label: "Disconnected", icon: WifiOff },
  connecting: { color: "text-yellow-400", label: "Connecting...", icon: Loader2 },
  connected: { color: "text-blue-400", label: "Connected", icon: Wifi },
  authenticated: { color: "text-green-400", label: "Authenticated", icon: CheckCircle },
  auth_failed: { color: "text-destructive", label: "Auth Failed", icon: XCircle },
  error: { color: "text-destructive", label: "Error", icon: XCircle },
};

interface YellowSessionManagerProps {
  recipientAddress?: Address;
  asset?: string;
  initialAmount?: string;
  onPaymentSent?: (amount: string) => void;
}

export function YellowSessionManager({
  recipientAddress,
  asset = "usdc",
  initialAmount = "1000000", // 1 USDC
  onPaymentSent,
}: YellowSessionManagerProps) {
  const {
    status,
    connect,
    disconnect,
    session,
    createSession,
    sendPayment,
    closeSession,
    error,
  } = useYellowSession();

  const [tipAmount, setTipAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  async function handleConnect() {
    await connect();
  }

  async function handleCreateSession() {
    if (!recipientAddress) return;
    await createSession(recipientAddress, asset, initialAmount);
  }

  async function handleSendTip() {
    if (!tipAmount) return;
    setIsSending(true);
    // Convert to smallest unit (6 decimals for USDC)
    const parts = tipAmount.split(".");
    const whole = parts[0] || "0";
    const frac = (parts[1] || "").padEnd(6, "0").slice(0, 6);
    const amountRaw = (
      BigInt(whole) * BigInt(1000000) + BigInt(frac)
    ).toString();
    await sendPayment(amountRaw);
    onPaymentSent?.(tipAmount);
    setTipAmount("");
    setIsSending(false);
  }

  const QUICK_TIPS = ["0.10", "0.50", "1.00", "5.00"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <h3 className="font-semibold text-sm">Yellow Network Payments</h3>
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${statusConfig.color}`}>
          <StatusIcon
            className={`h-3 w-3 ${status === "connecting" ? "animate-spin" : ""}`}
          />
          {statusConfig.label}
        </div>
      </div>

      {/* Connection */}
      {status === "disconnected" && (
        <button
          onClick={handleConnect}
          className="w-full py-3 bg-yellow-500/15 text-yellow-400 rounded-lg font-medium hover:bg-yellow-500/25 transition-colors flex items-center justify-center gap-2"
        >
          <Wifi className="h-4 w-4" />
          Connect to Yellow Network
        </button>
      )}

      {status === "error" && (
        <div className="space-y-2">
          {error && (
            <div className="rounded-lg p-3 bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
          <button
            onClick={handleConnect}
            className="w-full py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Authenticated -- Create Session */}
      {(status === "authenticated" || status === "connected") &&
        !session.appSessionId && (
          <div className="glass-card rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Create a payment session to start sending instant, gasless
              payments.
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Session deposit</span>
              <span className="font-mono">
                {formatTokenAmount(initialAmount)} USDC
              </span>
            </div>
            <button
              onClick={handleCreateSession}
              disabled={!recipientAddress}
              className="w-full py-2.5 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Payment Session
            </button>
          </div>
        )}

      {/* Active Session */}
      {session.appSessionId && (
        <div className="space-y-4">
          {/* Session Info */}
          <div className="glass-card rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Session Balance
              </span>
              <span className="text-sm font-mono font-semibold text-green-400">
                {formatTokenAmount(session.senderBalance.toString())} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Sent</span>
              <span className="text-sm font-mono text-yellow-400">
                {formatTokenAmount(session.totalSent.toString())} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Payments</span>
              <span className="text-sm font-medium">
                {session.payments.length}
              </span>
            </div>
          </div>

          {/* Quick Tips */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Quick Tip
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_TIPS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    tipAmount === amount
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Custom Amount (USDC)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0.00"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-sm border border-border focus:border-yellow-500/50 focus:outline-none font-mono"
              />
              <button
                onClick={handleSendTip}
                disabled={!tipAmount || isSending}
                className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-black rounded-lg text-sm font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send
              </button>
            </div>
          </div>

          {/* Payment History */}
          {session.payments.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Recent Payments
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {session.payments
                  .slice()
                  .reverse()
                  .map((payment, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 px-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          Instant payment
                        </span>
                      </div>
                      <span className="text-xs font-mono text-yellow-400">
                        {formatTokenAmount(payment.amount)} USDC
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Settle & Close */}
          <button
            onClick={closeSession}
            className="w-full py-2.5 bg-secondary text-muted-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Settle & Close Session
          </button>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            All payments are instant and gasless via Yellow Network state
            channels. On-chain settlement happens when you close the session.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && status !== "error" && (
        <div className="rounded-lg p-3 bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
