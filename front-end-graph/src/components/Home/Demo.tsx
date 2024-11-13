import Link from "next/link";
import { Button } from "../ui/button";
import { KofiDonate } from "../Donate";
import { Session } from "next-auth";

// DemoSection.js
export async function DemoSection({ data }: { data: Session | null }) {
  return (
    <section className="flex justify-center items-center">
      {data?.user.subscriptionId || data?.user.lifetimePaymentId ? (
        <Link href="/subscription" className="ml-4">
          <Button className="flex items-center space-x-2" variant={"secondary"}>
            Manage Subscription
          </Button>
        </Link>
      ) : (
        <KofiDonate />
      )}
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
