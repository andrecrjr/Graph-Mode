"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import AuthButton from "../Buttons";
import { usePathname } from "next/navigation";

export default function Header() {
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
            ☕
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/terms"
          >
            Privacy
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="https://acjr.notion.site/12db5e58148c80c19144ce5f22f3f392?pvs=105"
            target="_blank"
          >
            Contact
          </Link>
        </nav>
        <div className="absolute l-0 top-12 ml-auto sm:static">
          <AuthButton />
        </div>
      </header>
    );
}
