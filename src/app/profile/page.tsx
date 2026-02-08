"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { User, Settings } from "lucide-react";
import { EnsProfile } from "@/components/ens-profile";
import { EnsPreferences } from "@/components/ens-preferences";

export default function ProfilePage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Connect your wallet to manage your payment preferences.
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
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Payment Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Configure how you receive payments via ENS text records
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <EnsProfile />
          <div className="text-xs px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 font-medium">
            Connected
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <EnsPreferences />
    </div>
  );
}
