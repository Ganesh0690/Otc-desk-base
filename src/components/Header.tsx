"use client";

import { useAccount, useDisconnect, useBalance } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import { formatAddress } from "@/lib/contracts";

export function Header() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  return (
    <header className="relative z-10 w-full border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 8L8 2L14 8L8 14L2 8Z"
                stroke="#00D97E"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M5 8L8 5L11 8L8 11L5 8Z"
                fill="#00D97E"
                fillOpacity="0.3"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-base tracking-tight leading-none">
              OTC Desk
            </h1>
            <p className="text-[10px] text-muted font-mono tracking-widest uppercase mt-0.5">
              Base Mainnet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && balance && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-white/[0.04]">
              <span className="text-xs text-muted font-mono">
                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </span>
            </div>
          )}
          <Wallet>
            <ConnectWallet
              className="!bg-accent !text-black !font-display !font-semibold !text-xs !rounded-xl !px-4 !py-2.5 !border-0 hover:!bg-accent-bright !transition-all"
            >
              <Avatar className="h-5 w-5" />
              <Name className="!text-black !font-display" />
            </ConnectWallet>
            <WalletDropdown className="!bg-surface-2 !border-white/[0.08] !rounded-xl">
              <WalletDropdownDisconnect className="!text-danger hover:!bg-danger/10 !rounded-lg" />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>
    </header>
  );
}
