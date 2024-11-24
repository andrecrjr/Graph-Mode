import React from "react";
import { useGraphContextData } from "../Context/GraphContext";
import clsx from "clsx";

const LoadingPlaceholder: React.FC<{ classNames?: string }> = ({
  classNames,
}) => {
  const {
    state: { loadingFetchGraph },
  } = useGraphContextData();
  const baseClassNames =
    "absolute top-0 bottom-0 left-0 right-0 bg-white flex h-screen w-screen justify-center place-items-center flex-col";

  if (loadingFetchGraph)
    return (
      <div className={clsx(baseClassNames, classNames)}>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-6"></div>
        <p className="ml-4 text-lg text-gray-700">Loading Your Data!</p>
        <p className="text-xs italic">Will be fast!</p>
      </div>
    );
};

export default LoadingPlaceholder;
