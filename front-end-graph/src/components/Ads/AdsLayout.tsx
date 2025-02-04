"use client";

import Router from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { useUserSession } from "../Context/UserSessionContext";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdsBannerProps {
  "data-ad-slot": string;
  "data-ad-format": string;
  "data-full-width-responsive": string;
  "data-ad-layout"?: string;
  className?: string;
}

const AdBanner = (props: AdsBannerProps) => {
  const { session } = useUserSession();

  const isVip =
    session?.user.lifetimePaymentId || session?.user.nextPaymentDate;
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const p: any = {};

    p.google_ad_client = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID;
    p.enable_page_level_ads = true;

    try {
      if (typeof window === "object" && !isVip) {
        // biome-ignore lint/suspicious/noAssignInExpressions: adsense
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
          p,
        );
      }
    } catch {
      // Pass
    }
  }, [isVip]);

  return (
    <>
      <ins
        ref={adRef}
        className="adsbygoogle adbanner-customize mt-2 mb-2"
        style={{
          display: "block",
          overflow: "hidden",
          border:
            process.env.NODE_ENV === "development" ? "1px solid red" : "none",
        }}
        data-adtest="on"
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}
        {...props}
      />
    </>
  );
};
export default AdBanner;
