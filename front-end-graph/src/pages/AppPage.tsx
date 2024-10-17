import React from "react";
import { AuthSection } from "@/components/Home/AuthSection";
import { DemoSection } from "@/components/Home/Demo";
import { GeneralFooter } from "@/components/Footer";
import { BGParticle } from "@/components/Home/BgParticle";
import { LazyHistory } from "@/components/History";

export default async function AppPage() {
  return (
    <>
      <BGParticle />
      <section className="mt-auto">
        <h1 className="text-4xl lg:text-7xl mt-10 font-bold text-center mb-4 tracking-tight">
          Graph Mode
        </h1>
        <AuthSection />
        <DemoSection />
        <LazyHistory />
      </section>
      <GeneralFooter />
    </>
  );
}
