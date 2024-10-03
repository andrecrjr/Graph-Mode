import React from "react";
import { AuthSection } from "@/components/Home/AuthSection";
import { DemoSection } from "@/components/Home/Demo";
import { auth } from "@/components/Auth";
import { GeneralFooter } from "@/components/Footer";
import { BGParticle } from "@/components/Home/BgParticle";
import { History } from "@/components/History";

export default async function Page() {
  const data = await auth();

  return (
    <section className="flex flex-col mx-auto sm:px-6 lg:px-8 mt-auto h-screen">
      <BGParticle />
      <section className="mt-auto">
        <h1 className="text-3xl sm:text-5xl mt-10 font-bold text-center mb-4">
          Graph Mode
        </h1>
        <AuthSection data={data} />
        <DemoSection />
        <History />
      </section>
      <GeneralFooter />
    </section>
  );
}
