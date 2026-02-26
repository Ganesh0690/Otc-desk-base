"use client";

import { useReadContract } from "wagmi";
import { OTC_ABI } from "@/lib/abi";
import { OTC_CONTRACT_ADDRESS } from "@/lib/contracts";
import { formatTokenAmount } from "@/lib/tokens";

export function StatsBar() {
  const { data: stats } = useReadContract({
    address: OTC_CONTRACT_ADDRESS,
    abi: OTC_ABI,
    functionName: "getStats",
  });

  const totalOrders = stats ? Number(stats[0]) : 0;
  const activeOrders = stats ? Number(stats[1]) : 0;
  const totalVolume = stats ? stats[2] : BigInt(0);

  const items = [
    { label: "Total Orders", value: totalOrders.toString() },
    { label: "Active", value: activeOrders.toString() },
    { label: "Volume", value: `${formatTokenAmount(totalVolume, 18)} ETH` },
    { label: "Fee", value: "0.75%" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="stat-card group">
          <p className="text-[11px] text-muted font-mono uppercase tracking-wider mb-1.5">
            {item.label}
          </p>
          <p className="font-display font-bold text-white text-lg leading-none group-hover:text-accent transition-colors duration-300">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
