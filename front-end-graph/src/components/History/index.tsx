import dynamic from "next/dynamic";

export const LazyHistory = dynamic(() => import("./History"), {
  loading: () => <p className="w-full text-center">Loading</p>,
  ssr: false,
});
