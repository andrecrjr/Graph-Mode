"use client";

import { useEffect } from "react";
import { useUserSession } from "../Context/UserSessionContext";

interface AdsBannerProps {
  "data-ad-slot": string;
  "data-ad-format": string;
  "data-full-width-responsive": string;
  "data-ad-layout"?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner = (props: AdsBannerProps) => {
  const { session } = useUserSession();
  const isVip =
    session?.user.lifetimePaymentId || session?.user.nextPaymentDate;

  useEffect(() => {
    if (isVip) return; // Don't load ads for VIP users

    const adContainer = document.getElementById("ins-parent");
    if (!adContainer || adContainer.children.length > 0) return; // Prevent duplicate ads

    const adElement = document.createElement("ins");
    adElement.className = "adsbygoogle";
    adElement.style.display = "block";
    adElement.setAttribute(
      "data-ad-client",
      process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID!,
    );
    adElement.setAttribute("data-ad-slot", props["data-ad-slot"]);
    adElement.setAttribute("data-ad-format", props["data-ad-format"]);
    adElement.setAttribute(
      "data-full-width-responsive",
      props["data-full-width-responsive"],
    );
    if (props["data-ad-layout"]) {
      adElement.setAttribute("data-ad-layout", props["data-ad-layout"]);
    }

    adContainer.appendChild(adElement);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [isVip, props]);

  return (
    <div
      id="ins-parent"
      className={`adbanner-customize mt-2 mb-2 ${props.className || ""}`}
      style={{
        display: "block",
        overflow: "hidden",
        border:
          process.env.NODE_ENV === "development" ? "1px solid red" : "none",
      }}
    ></div>
  );
};

export default AdBanner;
