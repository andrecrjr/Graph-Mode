import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/Auth/AuthProvider";
import { GraphContextProvider } from "@/components/Context/GraphContext";
import { MainContainer } from "@/components/Layout/MainLayout";
import { GoogleAnalytics } from "@next/third-parties/google";
import { EditorProvider } from "@/components/Context/EditorContext";

const roboto = Roboto({ subsets: ["latin"], weight: ["100", "300", "400"] });

export const metadata: Metadata = {
  title: "Notion Graph Mode",
  description: "Your Notion Pages with Graph View in Pages like-Obsidian",
  category: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ldJSON = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "MobileApplication"],
    name: "Notion Graph Mode",
    description:
      "Transform your Notion pages into an interactive graphic view.",
    operatingSystem: "All",
    applicationCategory: "ProductivityApplication",
  };
  return (
    <html lang="en">
      <head>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_FRONT_USER_URL}`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJSON) }}
        />
      </head>
      <body className={`w-screen ${roboto.className}`}>
        <MainContainer>
          <GraphContextProvider>
            <EditorProvider>
              <AuthProvider>{children}</AuthProvider>
            </EditorProvider>
          </GraphContextProvider>
        </MainContainer>
        {process.env.NODE_ENV === "production" &&
          process.env.NEXT_PUBLIC_GA_TAG && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_TAG} />
          )}
      </body>
    </html>
  );
}
