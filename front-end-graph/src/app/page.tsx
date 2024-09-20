import { auth } from "@/components/Auth";
import { GeneralFooter } from "@/components/Footer";

import Landing, { MindMapIcon } from "@/components/Home/Landing";

export default async function Home() {
  const data = await auth();

  return (
    <div className="flex flex-col mt-5 h-full">
      <Landing />
      <GeneralFooter />
    </div>
  );
}
