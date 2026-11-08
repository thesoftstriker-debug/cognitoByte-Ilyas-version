import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "@/styles/globals.css";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${BASE_URL}/#organization`,
                  name: SITE.name,
                  url: BASE_URL,
                  logo: `${BASE_URL}/logo-text.png`,
                  image: `${BASE_URL}/og-image.png`,
                  description: SITE.description,
                  email: "automations@cognitobyte.com",
                  sameAs: [
                    "https://www.linkedin.com/in/hassan-khan-4a6a063b7/",
                  ],
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Islamabad",
                    addressCountry: "PK",
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "automations@cognitobyte.com",
                    contactType: "sales",
                    availableLanguage: ["English", "Urdu"],
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": `${BASE_URL}/#website`,
                  name: SITE.name,
                  url: BASE_URL,
                  description: SITE.description,
                  inLanguage: "en",
                  publisher: { "@id": `${BASE_URL}/#organization` },
                },
              ],
            }),
          }}
        />
        <PageLoader />
        <Providers>
          <AppShell />
          <main>{children}</main>
          <FooterWrapper />
          <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "Inter, sans-serif" } }} />
        </Providers>
      </body>
    </html>
  );
}
