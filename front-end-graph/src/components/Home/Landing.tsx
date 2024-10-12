import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PricingTiers } from "./Tier";
import BuyMeCoffee from "./BuyCoffee";
import { NotionHome } from "../svg/NotionHome";
import ImprovedFeatures from "./Features";
import CreatorSection from "./CreatorSection";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full  md:py-24 h-screen flex flex-col items-center justify-center z-10">
        <div className="container mt-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold sm:text-7xl">
                Explore Graph Mode
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 sm:text-xl dark:text-gray-400">
                Visualize your Notion Pages like never before. Inspired by
                Zettelkasten/Obsidian, powered by Notion.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="/app">
                <Button>Start to Graph Mode ✨</Button>
              </Link>
              <Link href="/graph/mock">
                <Button>View Example Graph 👀</Button>
              </Link>
            </div>
          </div>
        </div>
        <Link href="https://notion.so" className="mt-auto pb-8">
          <NotionHome />
        </Link>
      </section>
      <ImprovedFeatures />
      <CreatorSection />
      <BuyMeCoffee />
      <PricingTiers />
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

function LayersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
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

function NetworkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </svg>
  );
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
