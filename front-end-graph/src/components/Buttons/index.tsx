/* eslint-disable @next/next/no-img-element */
"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useUserSession } from "../Context/UserSessionContext";

const AuthButton = ({ label = "Sign in with Notion", className, callbackUrl }: { label?: string, className?: string, callbackUrl?: string }) => {
  const { session } = useUserSession();

  return (
    <>
      {session ? (
        <Button onClick={() => signOut()} variant="ghost">
          Logout
        </Button>
      ) : (
        <Button
          onClick={() => {
            signIn("notion", {
              callbackUrl: callbackUrl || "/app?utm_source=login-button",
              redirect: true,
            });
          }}
          className={`w-fit text-white top-0 right-0 font-semibold py-2 px-4 rounded-lg shadow mt-2 z-50 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-600 ${className}`}
        >
          {label}
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
      )}
    </>
  );

  return;
};

export default AuthButton;
