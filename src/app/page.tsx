"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import {
  Zap,
  ArrowRightLeft,
  Globe,
  Shield,
  Send,
  LayoutDashboard,
  User,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Payments",
    description:
      "Send payments in milliseconds through Yellow Network state channels. No gas fees, no waiting for block confirmations.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: ArrowRightLeft,
    title: "Cross-Chain Deposits",
    description:
      "Fund from any EVM chain using LI.FI routing. Bridge and swap in a single transaction from Arbitrum, Optimism, Base, and more.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Globe,
    title: "ENS-Native Identity",
    description:
      "Pay anyone by their ENS name. Recipients store payment preferences as ENS text records for automatic routing.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Shield,
    title: "Trustless Settlement",
    description:
      "All off-chain payments are backed by on-chain smart contracts. Settle anytime and withdraw your funds securely.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

const QUICK_ACTIONS = [
  {
    href: "/send",
    icon: Send,
    label: "Send Payment",
    description: "Pay anyone by ENS name",
  },
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "View sessions & balances",
  },
  {
    href: "/profile",
    icon: User,
    label: "Set Preferences",
    description: "Configure payment settings",
  },
];

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Zap className="h-3.5 w-3.5" />
              Powered by Yellow Network + LI.FI + ENS
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Pay anyone by{" "}
              <span className="gradient-text">ENS name</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Instant off-chain payments through state channels, cross-chain
              deposits from any EVM chain, and ENS-powered payment preferences.
              DeFi payments, simplified.
            </p>

            {!isConnected ? (
              <div className="flex justify-center">
                <ConnectButton label="Connect Wallet to Start" />
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                {QUICK_ACTIONS.map(({ href, icon: Icon, label, description }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group glass-card rounded-xl p-4 hover:border-primary/30 transition-all w-52"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-sm">{label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three powerful integrations working together for seamless DeFi
            payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/15 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Step 1
            </div>
            <h3 className="text-lg font-semibold mb-2">Resolve ENS Name</h3>
            <p className="text-sm text-muted-foreground">
              Enter the recipient&apos;s ENS name. PayFlow reads their payment
              preferences (chain, token, limits) from custom ENS text records.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/15 flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Step 2
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Cross-Chain Deposit
            </h3>
            <p className="text-sm text-muted-foreground">
              LI.FI routes your funds from any chain to the recipient&apos;s
              preferred chain and token. Bridge + swap in one transaction.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-yellow-500/15 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Step 3
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Payment</h3>
            <p className="text-sm text-muted-foreground">
              Yellow Network state channels enable instant, gasless
              micropayments. Settle on-chain only when you&apos;re done.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Built for Speed</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Combining the best of state channels, cross-chain routing, and
            decentralized identity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="glass-card rounded-xl p-6 hover:border-primary/20 transition-colors"
            >
              <div
                className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-4`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            Built for HackMoney 2026 with Yellow Network, LI.FI, and ENS.
          </p>
        </div>
      </footer>
    </div>
  );
}
