/* eslint-disable @next/next/no-img-element */
"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useUserSession } from "../Context/UserSessionContext";

const AuthButton = ({ label = "Login with Notion" }: { label?: string }) => {
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
            if (window && window.dataLayer) {
              window.dataLayer.push({
                event: "login_with_AuthButton",
                category: "authenticated user",
                label: "login_init",
                usuario_logado: true,
              });
            }
            signIn("notion", {
              callbackUrl: "/app",
            });
          }}
          className="w-fit text-white top-0 right-0 font-semibold py-2 px-4 rounded-lg shadow mt-2 z-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
