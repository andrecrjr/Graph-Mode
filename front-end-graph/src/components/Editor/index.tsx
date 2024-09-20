"use client"; // this registers <Editor> as a Client Component
import dynamic from "next/dynamic";

export const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
});
