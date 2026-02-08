"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Zap, Send, LayoutDashboard, User, Home } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/send", label: "Send", icon: Send },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold gradient-text">PayFlow</span>
          </Link>

          {/* Navigation Links */}
          {isConnected && (
            <div className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Wallet Connect */}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      {isConnected && (
        <div className="sm:hidden flex border-t border-border/50">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
