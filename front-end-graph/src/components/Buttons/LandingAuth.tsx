"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { useUserSession } from "../Context/UserSessionContext";
import Link from "next/link";
import { CheckCheckIcon, SparkleIcon } from "lucide-react";

export const LandingAuthButton = ({ label = "Go to Graph Mode" }) => {
  const { session } = useUserSession();
  const _onClick = () => {
    setTimeout(() => {
      signIn("notion", {
        callbackUrl: "/extension?utm_source=landing-page",
      });
    }, 100);
  };
  if (session) {
    return (
      <Link href="/extension?utm_source=landing-page" className="w-full">
        <Button className="w-full bg-green-600 hover:bg-green-700">
          {label}
          <CheckCheckIcon className="ml-2 w-4" />
        </Button>
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
