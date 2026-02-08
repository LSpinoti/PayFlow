"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import {
  YellowConnection,
  createWalletMessageSigner,
  type YellowPayment,
} from "@/lib/yellow";
import type { Address, Hex } from "viem";

export type YellowStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "authenticated"
  | "auth_failed"
  | "error";

interface SessionState {
  appSessionId: Hex | null;
  senderBalance: bigint;
  recipientBalance: bigint;
  asset: string;
  recipientAddress: Address | null;
  payments: YellowPayment[];
  totalSent: bigint;
}

interface UseYellowSessionReturn {
  // Connection
  status: YellowStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  // Session
  session: SessionState;
  createSession: (
    recipient: Address,
    asset: string,
    amount: string
  ) => Promise<void>;
  sendPayment: (amount: string) => Promise<void>;
  closeSession: () => Promise<void>;
  // Errors
  error: string | null;
}

const INITIAL_SESSION: SessionState = {
  appSessionId: null,
  senderBalance: BigInt(0),
  recipientBalance: BigInt(0),
  asset: "",
  recipientAddress: null,
  payments: [],
  totalSent: BigInt(0),
};

export function useYellowSession(): UseYellowSessionReturn {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<YellowStatus>("disconnected");
  const [session, setSession] = useState<SessionState>(INITIAL_SESSION);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<YellowConnection | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      connectionRef.current?.disconnect();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!walletClient || !address) {
      setError("Wallet not connected");
      return;
    }

    try {
      setError(null);

      // Create a proper Nitrolite-compatible message signer
      const signer = createWalletMessageSigner(walletClient);

      const connection = new YellowConnection(signer, address);
      connection.setStatusCallback((s) => setStatus(s as YellowStatus));

      // Listen for messages
      connection.onMessage("session-handler", (data) => {
        try {
          const parsed = JSON.parse(data);
          // Handle various response types
          if (parsed.res && Array.isArray(parsed.res)) {
            console.log("[Yellow] Response:", parsed);
          }
        } catch {
          // Non-JSON message
        }
      });

      await connection.connect(true);
      connectionRef.current = connection;

      // Keep connection alive with periodic pings
      pingIntervalRef.current = setInterval(() => {
        if (connection.isConnected()) {
          connection.ping().catch(() => {});
        } else {
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        }
      }, 30000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to Yellow Network"
      );
      setStatus("error");
    }
  }, [walletClient, address]);

  const disconnect = useCallback(() => {
    connectionRef.current?.disconnect();
    connectionRef.current = null;
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    setSession(INITIAL_SESSION);
    setStatus("disconnected");
  }, []);

  const createSession = useCallback(
    async (recipient: Address, asset: string, amount: string) => {
      if (!connectionRef.current || !address) {
        setError("Not connected to Yellow Network");
        return;
      }

      try {
        setError(null);
        const amountBigInt = BigInt(amount);

        const sessionId =
          await connectionRef.current.createPaymentSession(
            recipient,
            asset,
            amount,
            "0" // Recipient starts with 0
          );

        setSession({
          appSessionId: sessionId as Hex,
          senderBalance: amountBigInt,
          recipientBalance: BigInt(0),
          asset,
          recipientAddress: recipient,
          payments: [],
          totalSent: BigInt(0),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create session"
        );
      }
    },
    [address]
  );

  const sendPayment = useCallback(
    async (amount: string) => {
      if (!connectionRef.current || !address || !session.appSessionId) {
        setError("No active session");
        return;
      }

      try {
        setError(null);
        const paymentAmount = BigInt(amount);

        if (paymentAmount > session.senderBalance) {
          setError("Insufficient session balance");
          return;
        }

        const newSenderBalance = session.senderBalance - paymentAmount;
        const newRecipientBalance = session.recipientBalance + paymentAmount;

        await connectionRef.current.submitPayment(
          session.appSessionId,
          address,
          session.recipientAddress!,
          session.asset,
          newSenderBalance.toString(),
          newRecipientBalance.toString()
        );

        const payment: YellowPayment = {
          amount,
          recipient: session.recipientAddress!,
          timestamp: Date.now(),
          asset: session.asset,
        };

        setSession((prev) => ({
          ...prev,
          senderBalance: newSenderBalance,
          recipientBalance: newRecipientBalance,
          totalSent: prev.totalSent + paymentAmount,
          payments: [...prev.payments, payment],
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send payment"
        );
      }
    },
    [address, session]
  );

  const closeSession = useCallback(async () => {
    if (!connectionRef.current || !address || !session.appSessionId) {
      setError("No active session");
      return;
    }

    try {
      setError(null);

      await connectionRef.current.closeSession(
        session.appSessionId,
        address,
        session.recipientAddress!,
        session.asset,
        session.senderBalance.toString(),
        session.recipientBalance.toString()
      );

      setSession(INITIAL_SESSION);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to close session"
      );
    }
  }, [address, session]);

  return {
    status,
    connect,
    disconnect,
    session,
    createSession,
    sendPayment,
    closeSession,
    error,
  };
}
