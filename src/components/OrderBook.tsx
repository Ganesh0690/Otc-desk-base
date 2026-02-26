"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { maxUint256 } from "viem";
import { OTC_ABI, ERC20_ABI } from "@/lib/abi";
import { OTC_CONTRACT_ADDRESS, formatAddress, timeAgo, calculateFee } from "@/lib/contracts";
import { getTokenByAddress, formatTokenAmount, ZERO_ADDRESS } from "@/lib/tokens";

type Props = {
  refreshKey: number;
};

export function OrderBook({ refreshKey }: Props) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"fill" | "cancel" | null>(null);

  const { data: orders, refetch } = useReadContract({
    address: OTC_CONTRACT_ADDRESS,
    abi: OTC_ABI,
    functionName: "getActiveOrders",
  });

  const handleFill = useCallback(
    async (orderId: number, buyTokenAddr: string, buyAmount: bigint) => {
      if (!address || !publicClient) return;
      setActionId(orderId);
      setActionType("fill");

      try {
        const fee = calculateFee(buyAmount);
        const totalRequired = buyAmount + fee;
        const isETHBuy = buyTokenAddr === ZERO_ADDRESS;

        if (!isETHBuy) {
          const allowance = await publicClient.readContract({
            address: buyTokenAddr as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [address, OTC_CONTRACT_ADDRESS],
          });

          if (allowance < totalRequired) {
            const approveTx = await writeContractAsync({
              address: buyTokenAddr as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "approve",
              args: [OTC_CONTRACT_ADDRESS, maxUint256],
            });
            await publicClient.waitForTransactionReceipt({ hash: approveTx });
          }
        }

        const hash = await writeContractAsync({
          address: OTC_CONTRACT_ADDRESS,
          abi: OTC_ABI,
          functionName: "fillOrder",
          args: [BigInt(orderId)],
          value: isETHBuy ? totalRequired : BigInt(0),
        });

        await publicClient.waitForTransactionReceipt({ hash });
        refetch();
      } catch (e: any) {
        console.error("Fill failed:", e);
      } finally {
        setActionId(null);
        setActionType(null);
      }
    },
    [address, publicClient, writeContractAsync, refetch]
  );

  const handleCancel = useCallback(
    async (orderId: number) => {
      if (!address || !publicClient) return;
      setActionId(orderId);
      setActionType("cancel");

      try {
        const hash = await writeContractAsync({
          address: OTC_CONTRACT_ADDRESS,
          abi: OTC_ABI,
          functionName: "cancelOrder",
          args: [BigInt(orderId)],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        refetch();
      } catch (e: any) {
        console.error("Cancel failed:", e);
      } finally {
        setActionId(null);
        setActionType(null);
      }
    },
    [address, publicClient, writeContractAsync, refetch]
  );

  const orderList = orders as any[] || [];

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-white text-base">Order Book</h2>
          <p className="text-xs text-muted mt-0.5">
            {orderList.length} active order{orderList.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="w-8 h-8 rounded-lg bg-surface-3 border border-white/[0.06] flex items-center justify-center
                     hover:bg-surface-4 hover:border-white/[0.1] transition-all group"
        >
          <svg className="w-3.5 h-3.5 text-muted group-hover:text-white transition-colors" fill="none" viewBox="0 0 16 16">
            <path
              d="M13.5 6.5A5.5 5.5 0 0 0 3.05 5.37M2.5 9.5A5.5 5.5 0 0 0 12.95 10.63"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path d="M13.5 2.5v4h-4M2.5 13.5v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {orderList.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-3 border border-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 20 20">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-sm text-muted font-body">No active orders</p>
          <p className="text-xs text-muted/60 mt-1">Create the first order to start trading</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {orderList.map((order: any) => {
            const id = Number(order.id);
            const sellToken = getTokenByAddress(order.sellToken);
            const buyToken = getTokenByAddress(order.buyToken);
            const sellSymbol = sellToken?.symbol || "???";
            const buySymbol = buyToken?.symbol || "???";
            const sellDec = sellToken?.decimals || 18;
            const buyDec = buyToken?.decimals || 18;
            const sellAmt = formatTokenAmount(BigInt(order.sellAmount), sellDec);
            const buyAmt = formatTokenAmount(BigInt(order.buyAmount), buyDec);
            const isMaker = address?.toLowerCase() === order.maker?.toLowerCase();
            const created = Number(order.createdAt);
            const isActioning = actionId === id;

            return (
              <div
                key={id}
                className="px-6 py-4 hover:bg-white/[0.01] transition-colors animate-slide-up"
                style={{ animationDelay: `${id * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge-active">#{id}</span>
                      {isMaker && (
                        <span className="text-[10px] font-mono text-accent/60 bg-accent/5 px-2 py-0.5 rounded">
                          YOUR ORDER
                        </span>
                      )}
                      <span className="text-[10px] text-muted/50 font-mono ml-auto">
                        {timeAgo(created)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-medium text-white">{sellAmt}</span>
                        <span className="text-xs font-mono text-muted">{sellSymbol}</span>
                      </div>
                      <svg className="w-4 h-4 text-accent/40 shrink-0" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8h10m-3-3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-medium text-white">{buyAmt}</span>
                        <span className="text-xs font-mono text-muted">{buySymbol}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted/40 font-mono mt-1.5">
                      by {formatAddress(order.maker)}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isMaker ? (
                      <button
                        onClick={() => handleCancel(id)}
                        disabled={isActioning}
                        className="btn-danger text-xs !px-4 !py-2"
                      >
                        {isActioning && actionType === "cancel" ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleFill(id, order.buyToken, BigInt(order.buyAmount))
                        }
                        disabled={isActioning || !address}
                        className="btn-primary text-xs !px-4 !py-2"
                      >
                        {isActioning && actionType === "fill" ? "Filling..." : "Fill Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
