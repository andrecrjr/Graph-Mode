"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { useUserSession } from "../Context/UserSessionContext";
import Link from "next/link";

export const LandingAuthButton = ({ label = "Go to Graph Mode 🎇" }) => {
  const { session } = useUserSession();
  const _onClick = () => {
    if (!!window.dataLayer) {
      window.dataLayer.push({
        event: "login with notion in landing page",
        category: "authenticated user",
        label: "login_init_landing",
        usuario_logado: true,
      });
    }
    setTimeout(() => {
      signIn("notion", {
        callbackUrl: "/app?landing=true",
      });
    }, 100);
  };
  if (session) {
    return (
      <Link href="/app" className="w-full">
        <Button className="w-full">{label}</Button>
      </Link>
    );
  }
  return (
    <Button onClick={_onClick} className="w-full">
      Get Started Free with{" "}
      <img
        loading="lazy"
        alt="Notion logo"
        className="ml-3"
        height="24"
        width="24"
        id="provider-logo"
        src="https://authjs.dev/img/providers/notion.svg"
      />
    </Button>
  );
};
