"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import AuthButton from "../Buttons";
import { usePathname } from "next/navigation";

export default function Header() {
  //Force redirect
  useEffect(() => {
    if (window.location.href.includes("graph-mode.vercel.app")) {
      window.location.href = "https://graph-mode.com";
    }
  }, []);

  const router = usePathname();
  if (!router.includes("/graph/"))
    return (
      <header className="px-4 bg-gray-50 lg:px-6 h-14 flex items-center z-40 w-full ">
        <Link
          className="text-sm font-medium hover:underline underline-offset-4 mr-4"
          href="/"
        >
          <h1>Graph Mode</h1>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/#support"
          >
            Support
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/terms"
          >
            Privacy
          </Link>
        </nav>
        <div className="absolute l-0 top-12 ml-auto sm:static">
          <AuthButton />
        </div>
      </header>
    );
}
