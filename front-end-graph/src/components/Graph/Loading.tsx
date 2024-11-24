"use client";
import React from "react";
import { useGraphContextData } from "../Context/GraphContext";
import clsx from "clsx";
import LoadingDynamicPlaceholder from "../Loading";

const LoadingGraphPlaceholder: React.FC<{ classNames?: string }> = ({
  classNames,
}) => {
  const {
    state: { loadingFetchGraph },
  } = useGraphContextData();
  const baseClassNames =
    "absolute top-0 bottom-0 left-0 right-0 bg-white flex h-screen w-screen justify-center place-items-center flex-col";

  if (loadingFetchGraph) return <LoadingDynamicPlaceholder />;
};

export default LoadingGraphPlaceholder;
