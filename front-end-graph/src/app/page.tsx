import { auth } from "@/components/Auth";
import { GeneralFooter } from "@/components/Footer";
import { AuthSection } from "@/components/Home/AuthSection";
import { DemoSection } from "@/components/Home/Demo";

export default async function Home() {
  const data = await auth();

  return (
    <div className="w-10/12 flex flex-col mx-auto sm:px-6 lg:px-8 mt-5 h-full">
      <h1 className="text-3xl font-bold text-center mb-4">Graph View Mode</h1>
      <p className="text-lg text-center mb-6">
        A Notion Integration to watch in graph way your pages{" "}
        <a href="https://obsidian.md/" className="underline" target="_blank">
          like-Obsidian
        </a>
        !
      </p>
      <AuthSection data={data} />
      <DemoSection />
      <GeneralFooter />
    </div>
  );
}
