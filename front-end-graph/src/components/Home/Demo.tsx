import Link from "next/link";
import { Button } from "../ui/button";
import { auth } from "../Auth";

// DemoSection.js
export async function DemoSection() {
  const data = await auth();
  if (!data)
    return (
      <section className="flex justify-center">
        <Link href="/graph/mock">
          <Button className="inline-block text-white font-semibold py-2 px-4 rounded-lg shadow">
            See Graph Example
          </Button>
        </Link>
      </section>
    );
}
