import { auth } from "@/components/Auth";
import AuthButton from "@/components/Buttons";
import { GeneralFooter } from "@/components/Footer";
import { AuthSection } from "@/components/Home/AuthSection";
import { BGParticle } from "@/components/Home/BgParticle";

import Landing from "@/components/Home/Landing";

export default async function Home() {
  const data = await auth();
  return (
    <div className="flex flex-col mt-5 h-full">
      <BGParticle />
      <Landing />
      <GeneralFooter />
    </div>
  );
}
