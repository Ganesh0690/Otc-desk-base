export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || "https://otc-desk.vercel.app";

  return Response.json({
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    miniapp: {
      version: "1",
      name: "OTC Desk",
      homeUrl: URL,
      iconUrl: `${URL}/icon.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: "P2P Token Swaps",
      description:
        "Trade tokens peer-to-peer with smart contract escrow on Base. No intermediaries, no slippage, minimal fees.",
      screenshotUrls: [],
      primaryCategory: "finance",
      tags: ["otc", "swap", "defi", "trading", "p2p"],
      heroImageUrl: `${URL}/og.png`,
      tagline: "Trade directly",
      ogTitle: "OTC Desk - P2P Token Swaps on Base",
      ogDescription: "Peer-to-peer token swaps with escrow protection.",
      ogImageUrl: `${URL}/og.png`,
      noindex: false,
    },
  });
}
