"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AuthButton from "../Buttons";
import { usePathname } from "next/navigation";
import DarkModeToggle from "../Buttons/DarkModeToggle";

export default function Header() {
  useEffect(() => {
    if (window.location.href.includes("graph-mode.vercel.app")) {
      window.location.href = "https://graph-mode.com";
    }
  }, []);

  const router = usePathname();
  if (!router.includes("/graph/"))
    return (
      <header className="px-4 lg:px-6 h-14 flex flex-col md:flex-row items-center z-40 w-full pt-4 md:pt-0 gap-4 md:gap-0 dark:bg-gray-900 transition-colors duration-200">
        <Link
          className="hidden md:block text-sm font-medium hover:underline underline-offset-4 mr-4 dark:text-white"
          href="/"
        >
          <h1>Graph Mode</h1>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
            href="/#features"
            aria-label="Features"
          >
            Features
          </Link>
          {process.env.NEXT_PUBLIC_TIER_RELEASED && (
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
              href="/#pricing"
              aria-label="Pricing"
            >
              Pricing
            </Link>
          )}
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center ml-auto">
          <DarkModeToggle className="mr-4" />
          <AuthButton />
        </div>
      </header>
    );

}
