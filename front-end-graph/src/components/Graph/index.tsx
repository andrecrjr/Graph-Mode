"use client";

import dynamic from "next/dynamic";
import LoadingPlaceholder from "./Loading";

export const GraphComponent = dynamic(() => import("./GraphComponent"), {
  loading: () => <LoadingPlaceholder />,
  ssr: false,
});
