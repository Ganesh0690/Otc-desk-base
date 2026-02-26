"use client";

import { useState, useRef, useEffect } from "react";
import { TOKEN_LIST, TokenInfo } from "@/lib/tokens";

type Props = {
  selected: TokenInfo;
  onSelect: (token: TokenInfo) => void;
  exclude?: string;
};

export function TokenSelector({ selected, onSelect, exclude }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = TOKEN_LIST.filter((t) => t.symbol !== exclude);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-4 border border-white/[0.06]
                   hover:border-white/[0.12] transition-all duration-200 min-w-[100px]"
      >
        <TokenIcon symbol={selected.symbol} />
        <span className="font-mono text-sm text-white font-medium">
          {selected.symbol}
        </span>
        <svg
          className={`w-3 h-3 text-muted ml-auto transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 glass-panel-elevated rounded-xl overflow-hidden z-50 animate-fade-in">
          {filtered.map((token) => (
            <button
              key={token.symbol}
              type="button"
              onClick={() => {
                onSelect(token);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors
                ${selected.symbol === token.symbol ? "bg-accent/5 text-accent" : "text-white"}`}
            >
              <TokenIcon symbol={token.symbol} />
              <div className="text-left">
                <p className="font-mono text-sm font-medium">{token.symbol}</p>
                <p className="text-[10px] text-muted">{token.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenIcon({ symbol }: { symbol: string }) {
  const colors: Record<string, string> = {
    ETH: "#627EEA",
    USDC: "#2775CA",
  };
  const color = colors[symbol] || "#666";

  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono font-bold text-white shrink-0"
      style={{ background: `${color}30`, border: `1px solid ${color}50` }}
    >
      {symbol.slice(0, 1)}
    </div>
  );
}
