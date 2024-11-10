"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { useUserSession } from "../Context/UserSessionContext";
import Link from "next/link";

export const LandingAuthButton = () => {
  const { session } = useUserSession();
  const _onClick = () => {
    signIn("notion", {
      callbackUrl: "/app?landing=true",
    });
  };
  if (session) {
    return (
      <Link href="/app">
        <Button>Go to Graph Mode 🎇</Button>
      </Link>
    );
  }
  return (
    <Button onClick={_onClick}>
      Login with Notion{" "}
      <img
        loading="lazy"
        alt="notion site logo"
        className="ml-3"
        height="24"
        width="24"
        id="provider-logo"
        src="https://authjs.dev/img/providers/notion.svg"
      />
    </Button>
  );
};
