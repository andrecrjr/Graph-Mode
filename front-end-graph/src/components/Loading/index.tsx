import React from "react";
import clsx from "clsx";

interface LoadingPlaceholderProps {
  message?: string;
  className?: string;
}

const LoadingDynamicPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  message = "Loading your data...",
  className,
}) => {
  const baseClassName =
    "flex justify-center items-center flex-col min-h-screen w-screen";

  return (
    <div className={clsx(baseClassName, className)}>
      <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-gray-700">{message}</p>
      <p className="text-xs italic">Please wait...</p>
    </div>
  );
};

export default LoadingDynamicPlaceholder;
