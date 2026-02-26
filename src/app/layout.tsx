import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://otc-desk.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "OTC Desk - P2P Token Swaps on Base",
    description: "Peer-to-peer token swaps with escrow protection. Trade directly, pay less.",
    openGraph: {
      title: "OTC Desk",
      description: "P2P Token Swaps on Base",
      images: [`${APP_URL}/og.png`],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: `${APP_URL}/og.png`,
        button: {
          title: "Trade Now",
          action: {
            type: "launch_miniapp",
            name: "OTC Desk",
            url: APP_URL,
            splashImageUrl: `${APP_URL}/splash.png`,
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-0">
        <div className="noise-overlay" />
        <div className="gradient-mesh" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
