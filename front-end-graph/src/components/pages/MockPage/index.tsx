"use client";
import { useParams } from "next/navigation";
import React from "react";
import AuthButton from "@/components/Buttons";

export default function MockPage({ children }: { children: React.ReactNode }) {
  const { id: pageId } = useParams();

  return (
    <>
      {pageId === "mock" && (
        <div className="absolute right-3">
          <AuthButton />
        </div>
      )}
      {children}
    </>
  );
}
