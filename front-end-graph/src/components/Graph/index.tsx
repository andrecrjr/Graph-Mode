"use client";

import dynamic from "next/dynamic";
import LoadingDynamicPlaceholder from "../Loading";

export const GraphComponent = dynamic(() => import("./GraphComponent"), {
  loading: () => <LoadingDynamicPlaceholder />,
  ssr: false,
});

export const GraphSVGLazyComponent = dynamic(() => import("./GraphSvg"), {
  loading: () => <LoadingDynamicPlaceholder message="Loading your" />,
  ssr: false,
});

export const LoadingGraphLazyComponent = dynamic(() => import("./Loading"), {
  loading: () => <LoadingDynamicPlaceholder />,
  ssr: false,
});
