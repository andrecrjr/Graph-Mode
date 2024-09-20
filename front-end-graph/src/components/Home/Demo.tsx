import Link from "next/link";
import { Button } from "../ui/button";
import { auth } from "../Auth";
import { KofiDonate } from "../Donate";

// DemoSection.js
export async function DemoSection() {
  const data = await auth();

  return (
    <section className="flex justify-center items-center">
      <KofiDonate />
      {!data && (
        <Link href="/graph/mock" className="ml-4">
          <Button className="flex items-center space-x-2">
            See Graph Example
          </Button>
        </Link>
      )}
    </section>
  );
}
