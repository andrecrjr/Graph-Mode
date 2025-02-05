"use client";
import { useEffect, useRef } from "react";
import { useUserSession } from "../Context/UserSessionContext";

export default function AdsTerraBanner(): JSX.Element {
  const banner = useRef<HTMLDivElement>(null);
  const { session } = useUserSession();
  const isVip = session?.user.lifetimePaymentId || session?.user.subscriptionId;

  useEffect(() => {
    if (banner.current && !banner.current.firstChild && !isVip) {
      const script = document.createElement("script");
      script.async = true;
      script.dataset.cfasync = "false";
      script.src =
        "//pl25784794.profitablecpmrate.com/bd2fda7809b32937cfb0801a3f098cac/invoke.js";

      // Cria o container específico do Adsterra
      const container = document.createElement("div");
      container.id = "container-bd2fda7809b32937cfb0801a3f098cac";

      banner.current.appendChild(container);
      banner.current.appendChild(script);
    }
  }, [banner, isVip]);

  return <div className="min-h-[150px]" ref={banner}></div>;
}
