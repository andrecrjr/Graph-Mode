import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/Auth/AuthProvider";
import { GraphContextProvider } from "@/components/Context/GraphContext";
import { MainContainer } from "@/components/Layout/MainLayout";
import { GoogleAnalytics } from "@next/third-parties/google";
import { EditorProvider } from "@/components/Context/EditorContext";
import { ThemeProvider } from "@/components/Context/ThemeContext";
import { DarkModeProvider } from "@/components/Context/DarkModeContext";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import ButtonPWA from "@/components/Buttons/InstallPWA";
import { auth } from "@/components/Auth";
import Script from "next/script";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400"],
});
export const metadata: Metadata = {
  title: "Graph Mode - Browser Extension for Interactive Graph View in Notion",
  description:
    "Transform your Notion pages into an interactive Graph View with Graph Mode Browser Extension. Boost your productivity and note organization with this Extension.",
  keywords:
    "Graph Mode, Graph View, Notion, Zettelkasten, Interactive Graph, Productivity App, Note-Taking, Knowledge Management, Browser Extension, Chrome Extension, Google Chrome Extension, Notion Chrome Extension",
  robots: "index, follow",
  icons: {
    icon: "/images/icons/icon-72x72.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ldJSON = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "MobileApplication", "BrowserExtension"],
    name: "Graph Mode",
    description:
      "Transform your Notion pages into an interactive Zettelkasten/Graph view, with Graph Mode Browser Extension!",
    operatingSystem: "All",
    applicationCategory: "ProductivityApplication",
  };
  const dataSession = await auth();
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href={`/`} />
        <link
          rel="icon"
          type="image/x-icon"
          href="/images/icons/icon-72x72.png"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJSON) }}
        />
      </head>
      <body className={`w-full ${roboto.className}`}>
        <DarkModeProvider>
          <AuthProvider session={dataSession}>
            <Header />
            <MainContainer>
              <GraphContextProvider>
                <ThemeProvider>
                  <EditorProvider>{children}</EditorProvider>
                </ThemeProvider>
                <ButtonPWA />
              </GraphContextProvider>
            </MainContainer>
            <Toaster />
            {process.env.NODE_ENV === "production" &&
              process.env.NEXT_PUBLIC_GA_TAG && (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_TAG} />
              )}
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
