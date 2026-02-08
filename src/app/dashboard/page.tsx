"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  Zap,
  ArrowRightLeft,
  Send,
  Plus,
  Activity,
  TrendingUp,
  Clock,
  Globe,
} from "lucide-react";
import { SessionCard } from "@/components/session-card";
import { EnsProfile } from "@/components/ens-profile";

// Demo data for active sessions (these would come from Yellow Network in production)
const DEMO_SESSIONS = [
  {
    id: "0xabc123def456789012345678",
    recipient: "0x1234567890abcdef1234567890abcdef12345678",
    recipientLabel: "alice.eth",
    senderBalance: "750000",
    recipientBalance: "250000",
    totalPayments: 5,
    createdAt: "2 hours ago",
    status: "active" as const,
  },
  {
    id: "0xdef789abc012345678901234",
    recipient: "0xabcdef1234567890abcdef1234567890abcdef12",
    recipientLabel: "bob.eth",
    senderBalance: "0",
    recipientBalance: "500000",
    totalPayments: 12,
    createdAt: "1 day ago",
    status: "closed" as const,
  },
];

const STATS = [
  {
    label: "Total Sent",
    value: "$12.50",
    change: "+$3.20 today",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    label: "Active Sessions",
    value: "1",
    change: "Across 2 chains",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    label: "Payments Made",
    value: "17",
    change: "5 today",
    icon: Activity,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Chains Used",
    value: "3",
    change: "ARB, OP, BASE",
    icon: Globe,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

const RECENT_ACTIVITY = [
  {
    type: "payment",
    description: "Sent 0.10 USDC to alice.eth",
    time: "2 min ago",
    icon: Zap,
    iconColor: "text-yellow-400",
  },
  {
    type: "deposit",
    description: "Deposited 1.00 USDC via LI.FI (Arbitrum)",
    time: "2 hours ago",
    icon: ArrowRightLeft,
    iconColor: "text-blue-400",
  },
  {
    type: "payment",
    description: "Sent 0.50 USDC to alice.eth",
    time: "2 hours ago",
    icon: Zap,
    iconColor: "text-yellow-400",
  },
  {
    type: "settlement",
    description: "Settled session with bob.eth",
    time: "1 day ago",
    icon: Wallet,
    iconColor: "text-green-400",
  },
];

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"sessions" | "activity">(
    "sessions"
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Connect your wallet to view your dashboard.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your PayFlow activity
            </p>
          </div>
        </div>
        <Link
          href="/send"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Payment
        </Link>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between">
          <EnsProfile />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Wallet Balance</div>
              <div className="text-lg font-semibold font-mono">$--</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, change, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <div
                className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center`}
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-xs text-muted-foreground">{change}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "sessions"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sessions
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "activity"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Activity
        </button>
      </div>

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {DEMO_SESSIONS.length > 0 ? (
            DEMO_SESSIONS.map((session) => (
              <SessionCard
                key={session.id}
                {...session}
                onClose={
                  session.status === "active" ? () => {} : undefined
                }
              />
            ))
          ) : (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a new payment to create your first state channel session.
              </p>
              <Link
                href="/send"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              >
                <Send className="h-4 w-4" />
                Send Payment
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="glass-card rounded-xl divide-y divide-border/50">
          {RECENT_ACTIVITY.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4"
            >
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{item.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Clock className="h-3 w-3" />
                {item.time}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Integration Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 p-4 bg-secondary/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">Yellow Network</span>
          </div>
          <p className="text-xs text-muted-foreground">
            State channels for instant, gasless micropayments with on-chain
            settlement security.
          </p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-secondary/20">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">LI.FI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Cross-chain routing for seamless deposits from any EVM chain with
            optimal swap rates.
          </p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-secondary/20">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium">ENS</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Decentralized identity with custom text records for payment
            preferences and routing.
          </p>
        </div>
      </div>
    </div>
  );
}
