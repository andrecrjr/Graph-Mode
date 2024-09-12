import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/Auth/AuthProvider";
import { GraphContextProvider } from "@/components/Graph/GraphContext";
import { MainContainer } from "@/components/Layout/MainLayout";
import { GoogleAnalytics } from "@next/third-parties/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["100", "300", "400"] });

export const metadata: Metadata = {
  title: "Notion Graph Mode",
  description: "Your Notion Pages with Graph View in Pages like-Obsidian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`w-screen ${roboto.className}`}>
        <MainContainer>
          <GraphContextProvider>
            <AuthProvider>{children}</AuthProvider>
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
