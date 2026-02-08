"use client";

import { useState, useCallback } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import {
  getDepositQuote,
  getDepositRoutes,
  extractRouteInfo,
  type DepositQuoteParams,
} from "@/lib/lifi";
import type { Route } from "@lifi/sdk";

export type DepositStatus =
  | "idle"
  | "quoting"
  | "quoted"
  | "executing"
  | "confirming"
  | "success"
  | "error";

interface UseLifiDepositReturn {
  status: DepositStatus;
  quote: Route | null;
  routes: Route[];
  routeInfo: ReturnType<typeof extractRouteInfo> | null;
  error: string | null;
  txHash: `0x${string}` | undefined;
  fetchQuote: (params: DepositQuoteParams) => Promise<void>;
  fetchRoutes: (params: DepositQuoteParams) => Promise<void>;
  executeDeposit: () => Promise<void>;
  reset: () => void;
}

export function useLifiDeposit(): UseLifiDepositReturn {
  const { address } = useAccount();
  const [status, setStatus] = useState<DepositStatus>("idle");
  const [quote, setQuote] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeInfo, setRouteInfo] = useState<ReturnType<
    typeof extractRouteInfo
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: txHash, sendTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const fetchQuote = useCallback(
    async (params: DepositQuoteParams) => {
      try {
        setStatus("quoting");
        setError(null);
        const result = await getDepositQuote({
          ...params,
          fromAddress: params.fromAddress || address || "",
        });
        // The quote from LI.FI is a Step, which contains transactionRequest
        setQuote(result as unknown as Route);
        setRouteInfo(extractRouteInfo(result as unknown as Route));
        setStatus("quoted");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get quote");
        setStatus("error");
      }
    },
    [address]
  );

  const fetchRoutes = useCallback(
    async (params: DepositQuoteParams) => {
      try {
        setStatus("quoting");
        setError(null);
        const result = await getDepositRoutes({
          ...params,
          fromAddress: params.fromAddress || address || "",
        });
        setRoutes(result);
        if (result.length > 0) {
          setQuote(result[0]);
          setRouteInfo(extractRouteInfo(result[0]));
        }
        setStatus("quoted");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get routes");
        setStatus("error");
      }
    },
    [address]
  );

  const executeDeposit = useCallback(async () => {
    if (!quote) return;

    try {
      setStatus("executing");
      setError(null);

      // Get the transaction request from the first step
      const step = (quote as unknown as Route).steps?.[0];
      const txRequest =
        step?.transactionRequest ??
        (quote as unknown as { transactionRequest?: { to: string; data: string; value: string } }).transactionRequest;

      if (txRequest) {
        sendTransaction({
          to: txRequest.to as `0x${string}`,
          data: txRequest.data as `0x${string}`,
          value: txRequest.value ? BigInt(txRequest.value) : undefined,
        });
        setStatus("confirming");
      } else {
        setError(
          "Transaction data not available. In production, use executeRoute() from @lifi/sdk for full execution."
        );
        setStatus("error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute deposit");
      setStatus("error");
    }
  }, [quote, sendTransaction]);

  const reset = useCallback(() => {
    setStatus("idle");
    setQuote(null);
    setRoutes([]);
    setRouteInfo(null);
    setError(null);
  }, []);

  // Update status based on tx confirmation
  if (isConfirming && status === "confirming") {
    // Still confirming
  }
  if (isSuccess && status === "confirming") {
    setStatus("success");
  }

  return {
    status,
    quote,
    routes,
    routeInfo,
    error,
    txHash,
    fetchQuote,
    fetchRoutes,
    executeDeposit,
    reset,
  };
}
