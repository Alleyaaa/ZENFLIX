import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./poster-fallback.css";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/lib/lang-context";
import AchievementToast from "@/components/AchievementToast";

const APP_NAME = "Zenflix";
const APP_DEFAULT_TITLE = "Zenflix — Nonton Film Streaming Premium";
const APP_DESCRIPTION = "Streaming film dan series terbaru di Zenflix. Koleksi film bioskop, series, anime, dan drama berkualitas HD. Nonton gratis, tanpa buffering.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: "%s",
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  keywords: ["nonton film", "streaming film", "film online", "nonton series", "film indonesia", "bioskop online", "zenflix", "nonton gratis"],
  authors: [{ name: "Zenflix" }],
  creator: "Zenflix",
  publisher: "Zenflix",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zenflix.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('zenflix-theme');
                  if (theme) document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] antialiased">
              <LanguageProvider>
                <AuthProvider>
                  {children}
                  <AchievementToast />
                </AuthProvider>
              </LanguageProvider>
            </body>
    </html>
  );
}