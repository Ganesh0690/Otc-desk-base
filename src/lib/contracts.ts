import { base } from "wagmi/chains";

export const CHAIN = base;
export const CHAIN_ID = 8453;

export const OTC_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_OTC_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const FEE_BPS = 75;
export const BPS_DENOMINATOR = 10000;

export function calculateFee(amount: bigint): bigint {
  return (amount * BigInt(FEE_BPS)) / BigInt(BPS_DENOMINATOR);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
