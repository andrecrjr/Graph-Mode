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
          <Button className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow">
            Demo Graph example
          </Button>
        </Link>
      </section>
    );
}
