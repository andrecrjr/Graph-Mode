import React from "react";
import { AuthSection } from "@/components/Home/AuthSection";
import { DemoSection } from "@/components/Home/Demo";
import { auth } from "@/components/Auth";
import { GeneralFooter } from "@/components/Footer";
import { NotionHome } from "@/components/svg/NotionHome";

export default async function Page() {
  const data = await auth();

  return (
    <section className="flex flex-col mx-auto sm:px-6 lg:px-8 mt-auto h-screen">
      <section className="mt-auto">
        <h1 className="text-3xl sm:text-5xl mt-10 font-bold text-center mb-4">
          Graph Mode
        </h1>
        <p className="text-sm text-center mb-6">
          A Notion Integration to watch in graph way your Notion Workspace/Pages{" "}
          <a href="https://obsidian.md/" className="underline" target="_blank">
            like-Obsidian
          </a>
          !
        </p>
        <AuthSection data={data} />
        <DemoSection />
      </section>
      <GeneralFooter />
    </section>
  );
}
