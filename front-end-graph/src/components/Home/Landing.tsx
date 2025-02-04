import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import BuyMeCoffee from "./BuyCoffee";
import { NotionHome } from "../svg/NotionHome";
import ImprovedFeatures from "./Features";
import { ArrowRight, LucideChartNetwork } from "lucide-react";
import { PricingTierComponent } from "../pages/dynamicPages";
import CreatorSection from "./CreatorSection";
import { AdBanner } from "../Ads";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full  md:py-24 h-screen flex flex-col items-center justify-center z-10">
        <div className="container mt-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold sm:text-8xl tracking-tight">
                Unlock Graph Mode
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 sm:text-xl dark:text-gray-400">
                Transform your Notion pages into an interactive graph inspired
                by Zettelkasten/Obsidian. Start exploring connections today.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="/graph/mock">
                <Button variant={"secondary"}>
                  View Demo Now <LucideChartNetwork className="ml-1" />
                </Button>
              </Link>
              <Link href="/app">
                <Button className="bg-green-700 hover:bg-green-600">
                  Go to Graph Mode <ArrowRight className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Link
          href="https://notion.so?utm_source=graph-mode"
          className="mt-auto pb-8"
        >
          <NotionHome />
        </Link>
      </section>
      <section className="w-full py-12 md:py-24 z-50 h-screen lg:py-32 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Your Knowledge, Visualized
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Our graph mode transforms Notion Pages into an intuitive,
                interconnected visual experience. See how your ideas link
                together in ways you never imagined.
              </p>
              <div className="flex space-x-4">
                <Link href="/app">
                  <Button size="lg">Start Exploring</Button>
                </Link>
                <Link href="/#pricing">
                  <Button variant="outline" size="lg">
                    Explore Plans <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <img
                src="/images/iosPlaceholder.png"
                alt="Graph Mode Product Screenshot"
                width={600}
                height={400}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
      <ImprovedFeatures />
      {/* <CreatorSection /> */}
      {process.env.NEXT_PUBLIC_TIER_RELEASED && <PricingTierComponent />}
      <BuyMeCoffee />
      <section className="w-full py-12 md:py-24 lg:py-32 min-h-screen  bg-gray-100 z-10 dark:bg-gray-800 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Visualize Your Ideas
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Turn your Notion pages into an interactive knowledge node graph.
                Uncover connections, navigate seamlessly, and gain fresh
                insights into your information.
              </p>
              <Link href="/app">
                <Button>Try Graph Mode Now</Button>
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <svg
                className="w-full max-w-md"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="70" cy="70" r="10" fill="currentColor" />
                <circle cx="130" cy="70" r="10" fill="currentColor" />
                <circle cx="100" cy="130" r="10" fill="currentColor" />
                <line
                  x1="70"
                  y1="70"
                  x2="130"
                  y2="70"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="70"
                  y1="70"
                  x2="100"
                  y2="130"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="130"
                  y1="70"
                  x2="100"
                  y2="130"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function MindMapIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="6" r="3" />
      <circle cx="18" cy="9" r="3" />
      <circle cx="18" cy="18" r="3" />
      <circle cx="9" cy="18" r="3" />
      <line x1="9" x2="18" y1="6" y2="9" />
      <line x1="9" x2="18" y1="18" y2="18" />
      <line x1="9" x2="9" y1="9" y2="15" />
    </svg>
  );
}
