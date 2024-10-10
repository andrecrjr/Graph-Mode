"use client";

import dynamic from "next/dynamic";

export const GraphComponent = dynamic(() => import("./GraphComponent"), {
  ssr: false,
});
