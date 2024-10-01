import { auth } from "@/components/Auth";
import { GeneralFooter } from "@/components/Footer";
import { BGParticle } from "@/components/Home/BgParticle";

import Landing from "@/components/Home/Landing";

export default async function Home() {
  return (
    <div className="flex flex-col mt-5 h-full">
      <BGParticle />
      <Landing />
      <GeneralFooter />
    </div>
  );
}
