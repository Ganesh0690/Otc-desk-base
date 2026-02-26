"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseUnits, maxUint256 } from "viem";
import { OTC_ABI, ERC20_ABI } from "@/lib/abi";
import { OTC_CONTRACT_ADDRESS } from "@/lib/contracts";
import { TOKENS, TokenInfo, getTokenAddress, ZERO_ADDRESS } from "@/lib/tokens";
import { TokenSelector } from "./TokenSelector";

type Props = {
  onOrderCreated: () => void;
};

export function CreateOrder({ onOrderCreated }: Props) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [sellToken, setSellToken] = useState<TokenInfo>(TOKENS.ETH);
  const [buyToken, setBuyToken] = useState<TokenInfo>(TOKENS.USDC);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "approving" | "creating" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const swapTokens = useCallback(() => {
    const tmpToken = sellToken;
    const tmpAmount = sellAmount;
    setSellToken(buyToken);
    setBuyToken(tmpToken);
    setSellAmount(buyAmount);
    setBuyAmount(tmpAmount);
  }, [sellToken, buyToken, sellAmount, buyAmount]);

  const handleCreate = useCallback(async () => {
    if (!address || !publicClient) return;
    if (!sellAmount || !buyAmount) return;

    setStatus("creating");
    setErrorMsg("");

    try {
      const sellAmountParsed = parseUnits(sellAmount, sellToken.decimals);
      const buyAmountParsed = parseUnits(buyAmount, buyToken.decimals);
      const sellAddr = getTokenAddress(sellToken);
      const buyAddr = getTokenAddress(buyToken);
      const isETHSell = sellAddr === ZERO_ADDRESS;

      if (!isETHSell) {
        setStatus("approving");
        const allowance = await publicClient.readContract({
          address: sellAddr,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, OTC_CONTRACT_ADDRESS],
        });

        if (allowance < sellAmountParsed) {
          const approveTx = await writeContractAsync({
            address: sellAddr,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [OTC_CONTRACT_ADDRESS, maxUint256],
          });
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }
        setStatus("creating");
      }

      const hash = await writeContractAsync({
        address: OTC_CONTRACT_ADDRESS,
        abi: OTC_ABI,
        functionName: "createOrder",
        args: [sellAddr, buyAddr, sellAmountParsed, buyAmountParsed],
        value: isETHSell ? sellAmountParsed : BigInt(0),
      });

      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("success");
      setSellAmount("");
      setBuyAmount("");
      onOrderCreated();

      setTimeout(() => setStatus("idle"), 3000);
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.shortMessage || e?.message || "Transaction failed");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, [address, publicClient, sellAmount, buyAmount, sellToken, buyToken, writeContractAsync, onOrderCreated]);

  const rate = sellAmount && buyAmount && parseFloat(sellAmount) > 0
    ? (parseFloat(buyAmount) / parseFloat(sellAmount)).toFixed(4)
    : null;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.04]">
        <h2 className="font-display font-bold text-white text-base">Create Order</h2>
        <p className="text-xs text-muted mt-0.5">Deposit tokens into escrow to create a trade</p>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="text-[11px] text-muted font-mono uppercase tracking-wider mb-2 block">
            You Sell
          </label>
          <div className="flex gap-2">
            <TokenSelector
              selected={sellToken}
              onSelect={setSellToken}
              exclude={buyToken.symbol}
            />
            <input
              type="number"
              placeholder="0.00"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="input-field flex-1 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={swapTokens}
            className="w-9 h-9 rounded-full bg-surface-3 border border-white/[0.06] flex items-center justify-center
                       hover:bg-surface-4 hover:border-accent/20 transition-all duration-200 group"
          >
            <svg
              className="w-4 h-4 text-muted group-hover:text-accent transition-colors"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path d="M4 6l4-4 4 4M4 10l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div>
          <label className="text-[11px] text-muted font-mono uppercase tracking-wider mb-2 block">
            You Receive
          </label>
          <div className="flex gap-2">
            <TokenSelector
              selected={buyToken}
              onSelect={setBuyToken}
              exclude={sellToken.symbol}
            />
            <input
              type="number"
              placeholder="0.00"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="input-field flex-1 font-mono"
            />
          </div>
        </div>

        {rate && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-2 border border-white/[0.04]">
            <span className="text-xs text-muted">Rate</span>
            <span className="text-xs font-mono text-white">
              1 {sellToken.symbol} = {rate} {buyToken.symbol}
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="px-4 py-2.5 rounded-xl bg-danger/5 border border-danger/10">
            <p className="text-xs text-danger font-mono">{errorMsg}</p>
          </div>
        )}

        {status === "success" && (
          <div className="px-4 py-2.5 rounded-xl bg-accent/5 border border-accent/10">
            <p className="text-xs text-accent font-mono">Order created successfully</p>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!isConnected || !sellAmount || !buyAmount || status === "approving" || status === "creating"}
          className="btn-primary w-full"
        >
          {!isConnected
            ? "Connect Wallet"
            : status === "approving"
            ? "Approving..."
            : status === "creating" || isConfirming
            ? "Creating Order..."
            : "Create Order"}
        </button>

        <p className="text-center text-[10px] text-muted/60 font-mono">
          Taker pays 0.75% fee on fill
        </p>
      </div>
    </div>
  );
}
