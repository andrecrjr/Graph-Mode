"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useUserSession } from "../Context/UserSessionContext";

interface AdsBannerProps {
  id: string; // Unique ID for each ad instance
  "data-ad-slot": string;
  "data-ad-format"?: string;
  "data-full-width-responsive"?: string;
  "data-ad-layout"?: string;
  "ad-style"?: string;
  className?: string;
  refreshOnRouteChange?: boolean; // Optional prop to refresh ads on route change
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner = ({ id, ...props }: AdsBannerProps) => {
  const { session } = useUserSession();
  const isVip =
    session?.user.lifetimePaymentId || session?.user.nextPaymentDate;
  const adRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const loadAd = useCallback(() => {
    if (!adRef.current) return;
    console.log(adRef);

    adRef.current.innerHTML = ""; // Clear previous ads before injecting a new one

    const adElement = document.createElement("ins");
    adElement.className = "adsbygoogle";
    adElement.style.display = "block";
    adElement.setAttribute(
      "data-ad-client",
      process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID!,
    );
    props["data-ad-slot"] &&
      adElement.setAttribute("data-ad-slot", props["data-ad-slot"]);
    props["data-ad-format"] &&
      adElement.setAttribute("data-ad-format", props["data-ad-format"]);
    props["ad-style"] && adElement.setAttribute("style", props["ad-style"]);
    props["data-full-width-responsive"] &&
      adElement.setAttribute(
        "data-full-width-responsive",
        props["data-full-width-responsive"],
      );
    props["data-ad-layout"] &&
      adElement.setAttribute("data-ad-layout", props["data-ad-layout"]);

    adRef.current.appendChild(adElement);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [props]);

  useEffect(() => {
    if (isVip) return; // Don't load ads for VIP users

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadAd();
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }, // Load ad slightly before entering viewport
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [isVip, loadAd]);

  useEffect(() => {
    if (props.refreshOnRouteChange || typeof window !== "undefined") {
      loadAd();
    }
  }, [pathname, loadAd, props.refreshOnRouteChange]);

  return (
    <div
      id={id} // Unique ID
      ref={adRef}
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
