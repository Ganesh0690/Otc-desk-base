export type TokenInfo = {
  address: `0x${string}` | "";
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
};

export const TOKENS: Record<string, TokenInfo> = {
  ETH: {
    address: "",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logo: "/eth.svg",
  },
  USDC: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "/usdc.svg",
  },
};

export const TOKEN_LIST = Object.values(TOKENS);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

export function getTokenByAddress(address: string): TokenInfo | undefined {
  if (address === ZERO_ADDRESS || address === "") {
    return TOKENS.ETH;
  }
  return TOKEN_LIST.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
}

export function getTokenAddress(token: TokenInfo): `0x${string}` {
  return token.address === "" ? ZERO_ADDRESS : (token.address as `0x${string}`);
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const intPart = amount / divisor;
  const fracPart = amount % divisor;
  const fracStr = fracPart.toString().padStart(decimals, "0").slice(0, 6).replace(/0+$/, "");
  if (fracStr === "") return intPart.toString();
  return `${intPart}.${fracStr}`;
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  const parts = amount.split(".");
  const intPart = BigInt(parts[0] || "0") * BigInt(10 ** decimals);
  if (parts.length === 1) return intPart;
  const fracStr = (parts[1] || "0").padEnd(decimals, "0").slice(0, decimals);
  return intPart + BigInt(fracStr);
}
