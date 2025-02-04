import React from "react";
import { AuthSection } from "@/components/Home/AuthSection";
import { DemoSection } from "@/components/Home/Demo";
import { GeneralFooter } from "@/components/Footer";
import { BGParticle } from "@/components/Home/BgParticle";
import { LazyHistory } from "@/components/History";
import { auth } from "../Auth";
import AdBanner from "../Ads/AdsLayout";

export default async function AppPage() {
  const data = await auth();
  return (
    <>
      <BGParticle />
      <section className="mt-auto">
        <h1 className="text-4xl lg:text-7xl font-bold text-center mb-4 tracking-tight">
          Graph Mode
        </h1>
        <AuthSection session={data} />
        <DemoSection data={data} />
        <LazyHistory />
        <AdBanner
          id="ad-1"
          data-ad-slot="5070735560"
          ad-style="height:90px"
          className="w-full mt-3 h-[70px] mb-2"
          refreshOnRouteChange={true}
        />
      </section>
      <GeneralFooter />
    </>
  );
}
