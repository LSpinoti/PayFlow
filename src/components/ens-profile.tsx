"use client";

import { useAccount, useEnsName, useEnsAvatar } from "wagmi";
import { mainnet } from "wagmi/chains";
import { normalize } from "viem/ens";

export function EnsProfile({ compact = false }: { compact?: boolean }) {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
  });

  if (!address) return null;

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {ensAvatar ? (
          <img
            src={ensAvatar}
            alt={ensName ?? "avatar"}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold">
            {(ensName ?? address).charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium">
          {ensName ?? shortAddress}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {ensAvatar ? (
        <img
          src={ensAvatar}
          alt={ensName ?? "avatar"}
          className="h-10 w-10 rounded-full ring-2 ring-primary/30"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center text-lg font-bold">
          {(ensName ?? address).charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">
          {ensName ?? shortAddress}
        </span>
        {ensName && (
          <span className="text-xs text-muted-foreground">{shortAddress}</span>
        )}
      </div>
    </div>
  );
}
