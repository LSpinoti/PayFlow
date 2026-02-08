import {
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createSubmitAppStateMessage,
  createAuthVerifyMessageFromChallenge,
  createPingMessage,
  createGetAppSessionsMessageV2,
  createGetLedgerBalancesMessage,
  parseAuthChallengeResponse,
  getMethod,
  getError,
  RPCProtocolVersion,
  RPCChannelStatus,
  type RPCAppDefinition,
  type RPCAppSessionAllocation,
} from "@erc7824/nitrolite";
import type { Address, Hex, WalletClient } from "viem";
import { hashMessage } from "viem";
import { YELLOW_ENDPOINTS } from "./constants";

// The SDK's MessageSigner type: (payload: RPCData) => Promise<Hex>
// RPCData = [RequestID, RPCMethod, object, Timestamp?]
type RPCData = [number, string, object, number?];
type NitroliteMessageSigner = (payload: RPCData) => Promise<Hex>;

export interface YellowPayment {
  amount: string;
  recipient: Address;
  timestamp: number;
  asset: string;
}

// Create a Nitrolite-compatible message signer from a wallet client
export function createWalletMessageSigner(
  walletClient: WalletClient
): NitroliteMessageSigner {
  return async (payload: RPCData): Promise<Hex> => {
    const message = JSON.stringify(payload);
    const account = walletClient.account;
    if (!account) throw new Error("Wallet account not available");

    const signature = await walletClient.signMessage({
      account,
      message,
    });
    return signature;
  };
}

// Connection manager for Yellow Network ClearNode
export class YellowConnection {
  private ws: WebSocket | null = null;
  private signer: NitroliteMessageSigner;
  private address: Address;
  private connected = false;
  private authenticated = false;
  private messageHandlers: Map<string, (data: string) => void> = new Map();
  private pendingMessages: Map<
    number,
    { resolve: (data: unknown) => void; reject: (err: Error) => void }
  > = new Map();
  private onStatusChange?: (status: string) => void;

  constructor(signer: NitroliteMessageSigner, address: Address) {
    this.signer = signer;
    this.address = address;
  }

  setStatusCallback(cb: (status: string) => void) {
    this.onStatusChange = cb;
  }

  private updateStatus(status: string) {
    this.onStatusChange?.(status);
  }

  async connect(useSandbox = true): Promise<void> {
    const endpoint = useSandbox
      ? YELLOW_ENDPOINTS.SANDBOX
      : YELLOW_ENDPOINTS.PRODUCTION;

    return new Promise((resolve, reject) => {
      this.updateStatus("connecting");

      this.ws = new WebSocket(endpoint);

      this.ws.onopen = () => {
        this.connected = true;
        this.updateStatus("connected");
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = () => {
        this.updateStatus("error");
        reject(new Error("WebSocket connection error"));
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.authenticated = false;
        this.updateStatus("disconnected");
      };
    });
  }

  private handleMessage(data: string) {
    try {
      const parsed = JSON.parse(data);
      const method = getMethod(parsed);
      const error = getError(parsed);

      if (error) {
        console.error("[Yellow] RPC Error:", error);
      }

      // Check for auth_challenge response to complete auth flow
      if (method === "auth_challenge") {
        this.handleAuthChallenge(data);
        return;
      }

      // Handle pending request responses
      const reqId = parsed?.res?.[0];
      if (reqId && this.pendingMessages.has(reqId)) {
        const handler = this.pendingMessages.get(reqId);
        this.pendingMessages.delete(reqId);
        handler?.resolve(data);
        return;
      }

      // Broadcast to any registered handlers
      this.messageHandlers.forEach((handler) => handler(data));
    } catch (e) {
      console.error("[Yellow] Failed to parse message:", e);
    }
  }

  private async handleAuthChallenge(data: string) {
    try {
      const challenge = parseAuthChallengeResponse(data);
      // The parsed response has params.challengeMessage
      const challengeMessage =
        (challenge as unknown as { params: { challengeMessage: string } })
          .params?.challengeMessage ??
        (challenge as unknown as { challengeMessage: string })
          .challengeMessage ??
        "";
      const verifyMsg = await createAuthVerifyMessageFromChallenge(
        this.signer,
        challengeMessage
      );
      this.send(verifyMsg);
      this.authenticated = true;
      this.updateStatus("authenticated");
    } catch (e) {
      console.error("[Yellow] Auth challenge failed:", e);
      this.updateStatus("auth_failed");
    }
  }

  send(message: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }
    this.ws.send(message);
  }

  async sendAndWait(
    message: string,
    requestId: number,
    timeoutMs = 10000
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingMessages.delete(requestId);
        reject(new Error("Request timed out"));
      }, timeoutMs);

      this.pendingMessages.set(requestId, {
        resolve: (data) => {
          clearTimeout(timer);
          resolve(data);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });

      this.send(message);
    });
  }

  onMessage(id: string, handler: (data: string) => void) {
    this.messageHandlers.set(id, handler);
  }

  removeHandler(id: string) {
    this.messageHandlers.delete(id);
  }

  // Create a payment app session between two participants
  async createPaymentSession(
    recipientAddress: Address,
    asset: string,
    senderAmount: string,
    recipientAmount: string
  ): Promise<string> {
    const definition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_2,
      application: "payflow-v1",
      participants: [this.address, recipientAddress],
      weights: [50, 50],
      quorum: 100,
      challenge: 0,
      nonce: Date.now(),
    };

    const allocations: RPCAppSessionAllocation[] = [
      { participant: this.address, asset, amount: senderAmount },
      { participant: recipientAddress, asset, amount: recipientAmount },
    ];

    const sessionMsg = await createAppSessionMessage(this.signer, {
      definition,
      allocations,
    });

    this.send(sessionMsg);
    return `session-${Date.now()}`;
  }

  // Submit a payment state update (off-chain transfer within session)
  async submitPayment(
    appSessionId: Hex,
    senderAddress: Address,
    recipientAddress: Address,
    asset: string,
    senderBalance: string,
    recipientBalance: string
  ): Promise<void> {
    const allocations: RPCAppSessionAllocation[] = [
      { participant: senderAddress, asset, amount: senderBalance },
      { participant: recipientAddress, asset, amount: recipientBalance },
    ];

    const stateMsg = await createSubmitAppStateMessage(this.signer, {
      app_session_id: appSessionId,
      allocations,
    });

    this.send(stateMsg);
  }

  // Close an app session (triggers on-chain settlement)
  async closeSession(
    appSessionId: Hex,
    senderAddress: Address,
    recipientAddress: Address,
    asset: string,
    finalSenderBalance: string,
    finalRecipientBalance: string
  ): Promise<void> {
    const allocations: RPCAppSessionAllocation[] = [
      { participant: senderAddress, asset, amount: finalSenderBalance },
      {
        participant: recipientAddress,
        asset,
        amount: finalRecipientBalance,
      },
    ];

    const closeMsg = await createCloseAppSessionMessage(this.signer, {
      app_session_id: appSessionId,
      allocations,
    });

    this.send(closeMsg);
  }

  // Get active sessions for the current user
  async getSessions(): Promise<void> {
    const msg = createGetAppSessionsMessageV2(
      this.address,
      RPCChannelStatus.Open
    );
    this.send(msg);
  }

  // Get ledger balances
  async getBalances(): Promise<void> {
    const msg = await createGetLedgerBalancesMessage(this.signer);
    this.send(msg);
  }

  // Ping to keep connection alive
  async ping(): Promise<void> {
    const msg = await createPingMessage(this.signer);
    this.send(msg);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.authenticated = false;
    this.messageHandlers.clear();
    this.pendingMessages.clear();
    this.updateStatus("disconnected");
  }

  isConnected(): boolean {
    return this.connected;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}
