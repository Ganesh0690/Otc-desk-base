"use client";

import { useEffect, useState, useCallback } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { CreateOrder } from "@/components/CreateOrder";
import { OrderBook } from "@/components/OrderBook";

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { isConnected } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const handleOrderCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="space-y-2 animate-fade-in">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight tracking-tight">
            Peer-to-peer
            <br />
            <span className="text-accent">token swaps</span>
          </h2>
          <p className="text-sm text-muted max-w-md font-body leading-relaxed">
            Trade directly with other users through smart contract escrow.
            No intermediaries. No slippage. 0.75% fee.
          </p>
        </div>

        <StatsBar />

        {!isConnected && (
          <div className="glass-panel rounded-2xl p-8 text-center animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 6V5a5 5 0 0 1 10 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-1">Connect to start trading</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Connect your wallet to create orders, fill existing trades, and manage your positions on Base.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <CreateOrder onOrderCreated={handleOrderCreated} />
          </div>
          <div className="lg:col-span-3">
            <OrderBook refreshKey={refreshKey} />
          </div>
        </div>

        <footer className="text-center py-6 border-t border-white/[0.04]">
          <p className="text-[10px] text-muted/40 font-mono">
            OTC Desk on Base &middot; Contract escrow &middot; 0.75% taker fee
          </p>
        </footer>
      </main>
    </div>
  );
}
