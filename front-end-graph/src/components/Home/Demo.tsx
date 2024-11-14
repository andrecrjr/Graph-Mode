import Link from "next/link";
import { Button } from "../ui/button";
import { KofiDonate } from "../Donate";
import { Session } from "next-auth";
import { ChartLineIcon, Trophy, Unlock } from "lucide-react";

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
        <Link href="/pricing">
          <Button variant={"outline"} className="font-bold">
            <Unlock className="mr-2" />
            Unlock Full Potential: Upgrade to PRO Today
          </Button>
        </Link>
      )}
      {!data && (
        <Link href="/graph/mock" className="ml-4">
          <Button className="flex items-center space-x-2">View Demo Now</Button>
        </Link>
      )}
    </section>
  );
}
