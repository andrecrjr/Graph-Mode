"use client";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import AuthButton from "../Buttons";
import { useSession } from "next-auth/react";

export default function MockPage({ children }: { children: React.ReactNode }) {
  const { id: pageId } = useParams();

  const { status } = useSession();
  console.log(status);
  const router = useRouter();

  if (status === "authenticated") {
    router.push("/app");
  }

  return (
    <>
      {pageId === "mock" && <AuthButton />}
      {children}
    </>
  );
}
