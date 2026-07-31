import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { PageLoader } from "@/components/layout/PageLoader";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/store/Providers";

const SITE = {
  name: "CognitoByte",
  description:
    "CognitoByte builds AI automation systems, custom chatbots, and n8n workflows that save businesses time and cut manual work — fast, affordable, and tailored to you.",
};

const BASE_URL = "https://cognitobyte.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "AI automation",
    "AI agents",
    "chatbot development",
    "n8n workflows",
    "business automation",
    "AI consulting",
  ],
  icons: {
    icon: "/logo-text.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: BASE_URL,
    title: SITE.name,
    description: SITE.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased">
        <PageLoader />
        <Providers>
          <Navbar />
          <main>{children}</main>
          <FooterWrapper />
          <ChatbotWidget />
          <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "Inter, sans-serif" } }} />
        </Providers>
      </body>
    </html>
  );
}
