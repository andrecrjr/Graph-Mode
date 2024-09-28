/* eslint-disable @next/next/no-img-element */
"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";

const AuthButton = () => {
  const { data: session } = useSession();

  return (
    <>
      {session ? (
        <Button
          onClick={() => signOut()}
          className="absolute top-0 right-0 mr-4"
          variant="ghost"
        >
          Logout
        </Button>
      ) : (
        <Button
          onClick={() => signIn("notion")}
          className="w-fit text-white absolute top-0 right-0 mr-4 font-semibold py-2 px-4 rounded-lg shadow mt-2"
        >
          Login with Notion
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
