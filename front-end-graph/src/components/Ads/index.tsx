import dynamic from "next/dynamic";

export const AdBanner = dynamic(() => import("./AdsLayout"), {
  ssr: false,
});
