import { auth } from "@/components/Auth";
import { GeneralFooter } from "@/components/Footer";
import { BGParticle } from "@/components/Home/BgParticle";
import CreatorSection from "@/components/Home/CreatorSection";

import Landing from "@/components/Home/Landing";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <BGParticle />
      <Landing />
      <CreatorSection />
      <GeneralFooter />
    </div>
  );
}
