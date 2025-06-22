import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import BuyMeCoffee from "./BuyCoffee";
import { NotionHome } from "../svg/NotionHome";
import { ArrowRight, LucideChartNetwork, Puzzle } from "lucide-react";
import { PricingTierComponent } from "../pages/dynamicPages";
import ZettelkastenComparison from "./ZeltekastenWay";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full md:py-24 h-screen flex flex-col items-center justify-center dark:bg-gray-900 transition-colors duration-200">
        <div className="container mt-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold sm:text-7xl tracking-tight dark:text-white">
                Unlock the Power of Graph Mode
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 sm:text-xl dark:text-gray-400">
                Enhance your Notion with our Graph view. Build, visualize, and explore relationships across all your notes in your Browser.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="/graph/mock">
                <Button variant={"secondary"} className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                  View Demo <LucideChartNetwork className="ml-1" />
                </Button>
              </Link>
              <Link href="#chrome-extension">
                <Button variant={"secondary"} className="dark:bg-green-700 dark:text-gray-100 dark:hover:bg-green-600">
                  Chrome Extension <Puzzle className="ml-2" />
                </Button>
              </Link>
              <Link href="/app">
                <Button className="bg-green-700 hover:bg-green-700 dark:text-white dark:hover:bg-green-600">
                  Go to Graph Mode
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
      <section
        className="w-full py-12 md:py-24 z-50 min-h-screen lg:py-32 bg-white dark:bg-gray-800 flex items-center justify-center transition-colors duration-200"
        id="chrome-extension"
      >
        <div className="px-4 md:px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight sm:text-5xl dark:text-white transition-colors duration-200">
                🚀 Be First to Know When It{"'"}s Live
              </h3>
              <p className="text-gray-500 md:text-xl dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-200">
                The <strong>Graph Mode Chrome extension</strong> is coming soon {"—"} bringing the same powerful visualization you love from the web app, now directly aside Notion.
              </p>
            </div>
            <div className="w-full mt-8">
              <div className="relative w-full max-w-3xl mx-auto aspect-video">
                <iframe
                  src="https://acjr.notion.site/ebd/1f0b5e58148c803fb994cce92d21134d "
                  className="w-full min-h-[325px] md:h-[750px] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
                  height={800}
                  title="Waitlist Signup Form"
                  loading="lazy"
                />
              </div>
            </div>
            <p className="text-gray-500 md:text-xl dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-200">
              Keep an eye on our <Link href="https://ko-fi.com/post/Great-Cool-Surprise-for-Graph-Mode-X8X31ET4W2" className="text-blue-500 hover:underline">Ko-fi</Link> for updates.
            </p>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 z-50 h-screen lg:py-32 bg-white dark:bg-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 dark:text-white">
                Your Knowledge, Visualized
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Our graph mode transforms Notion Pages into an intuitive,
                interconnected visual experience. See how your ideas link
                together in ways you never imagined.
              </p>
              <div className="flex space-x-4">
                <Link href="/app">
                  <Button size="lg" className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    Start Exploring
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
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
                className="rounded-lg shadow-md dark:shadow-gray-900"
              />
            </div>
          </div>
        </div>
      </section>
      <ZettelkastenComparison />
      <PricingTierComponent />
      <BuyMeCoffee />
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
