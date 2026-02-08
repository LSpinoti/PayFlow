"use client";

import { useEnsText, useEnsAddress, useEnsAvatar } from "wagmi";
import { mainnet } from "wagmi/chains";
import { normalize } from "viem/ens";
import { ENS_RECORDS } from "@/lib/constants";
import { parseChainId, type PaymentPreferences } from "@/lib/ens";

interface EnsPaymentPrefsResult {
  // Resolved data
  address: `0x${string}` | null | undefined;
  avatar: string | null | undefined;
  preferences: PaymentPreferences;
  // Loading states
  isLoading: boolean;
  isError: boolean;
  // Raw values
  rawChain: string | null | undefined;
  rawToken: string | null | undefined;
  rawMaxTip: string | null | undefined;
}

export function useEnsPaymentPrefs(
  ensName: string | undefined
): EnsPaymentPrefsResult {
  const normalizedName = ensName ? normalize(ensName) : undefined;

  const {
    data: address,
    isLoading: addressLoading,
    isError: addressError,
  } = useEnsAddress({
    name: normalizedName,
    chainId: mainnet.id,
  });

  const { data: avatar } = useEnsAvatar({
    name: normalizedName,
    chainId: mainnet.id,
  });

  const {
    data: rawChain,
    isLoading: chainLoading,
    isError: chainError,
  } = useEnsText({
    name: normalizedName,
    key: ENS_RECORDS.CHAIN,
    chainId: mainnet.id,
  });

  const {
    data: rawToken,
    isLoading: tokenLoading,
    isError: tokenError,
  } = useEnsText({
    name: normalizedName,
    key: ENS_RECORDS.TOKEN,
    chainId: mainnet.id,
  });

  const {
    data: rawMaxTip,
    isLoading: maxTipLoading,
    isError: maxTipError,
  } = useEnsText({
    name: normalizedName,
    key: ENS_RECORDS.MAX_TIP,
    chainId: mainnet.id,
  });

  const isLoading = addressLoading || chainLoading || tokenLoading || maxTipLoading;
  const isError = addressError || chainError || tokenError || maxTipError;

  const preferences: PaymentPreferences = {
    chainId: parseChainId(rawChain),
    token: rawToken || null,
    maxTip: rawMaxTip || null,
  };

  return {
    address,
    avatar,
    preferences,
    isLoading,
    isError,
    rawChain,
    rawToken,
    rawMaxTip,
  };
}
