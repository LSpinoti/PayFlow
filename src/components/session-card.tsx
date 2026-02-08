"use client";

import { Zap, ArrowUpRight, Clock, XCircle } from "lucide-react";
import { formatTokenAmount } from "@/lib/lifi";

interface SessionCardProps {
  id: string;
  recipient: string;
  recipientLabel?: string;
  senderBalance: string;
  recipientBalance: string;
  totalPayments: number;
  createdAt: string;
  status: "active" | "settling" | "closed";
  onClose?: () => void;
}

const STATUS_STYLES = {
  active: "bg-green-500/15 text-green-400",
  settling: "bg-yellow-500/15 text-yellow-400",
  closed: "bg-muted text-muted-foreground",
};

export function SessionCard({
  id,
  recipient,
  recipientLabel,
  senderBalance,
  recipientBalance,
  totalPayments,
  createdAt,
  status,
  onClose,
}: SessionCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-yellow-500/15 flex items-center justify-center">
            <Zap className="h-4 w-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-sm font-semibold">
              {recipientLabel || `${recipient.slice(0, 8)}...${recipient.slice(-6)}`}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {id.slice(0, 12)}...
            </div>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Your Balance</div>
          <div className="text-sm font-mono font-semibold">
            {formatTokenAmount(senderBalance)} USDC
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Sent</div>
          <div className="text-sm font-mono text-yellow-400">
            {formatTokenAmount(recipientBalance)} USDC
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Payments</div>
          <div className="text-sm font-semibold">{totalPayments}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {createdAt}
        </div>
        <div className="flex gap-2">
          {status === "active" && onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-secondary text-muted-foreground rounded-lg hover:text-foreground transition-colors"
            >
              <XCircle className="h-3 w-3" />
              Settle
            </button>
          )}
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
            <ArrowUpRight className="h-3 w-3" />
            View
          </button>
        </div>
      </div>
    </div>
  );
}
