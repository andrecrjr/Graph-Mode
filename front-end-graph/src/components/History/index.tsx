import dynamic from "next/dynamic";

export const LazyHistory = dynamic(() => import("./History"), {
  loading: () => <p className="w-full text-center dark:text-white">Loading History</p>,
  ssr: false,
});
