import React from "react";
import { useGraphContextData } from "../Context/GraphContext";
import { useToast } from "../hooks/use-toast";

const LoadingPlaceholder: React.FC = () => {
  const {
    state: { loadingFetchGraph },
  } = useGraphContextData();

  if (loadingFetchGraph)
    return (
      <div className="absolute top-0 bottom-0 left-0 right-0 bg-white flex h-screen w-screen justify-center place-items-center flex-col">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-6"></div>
        <p className="ml-4 text-lg text-gray-700">
          Loading Graph Data from Notion...
        </p>
        <p className="text-xs italic">Can be a bit slow, wait a minute!</p>
      </div>
    );
};

export default LoadingPlaceholder;
