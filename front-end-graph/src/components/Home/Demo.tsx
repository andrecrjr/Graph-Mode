import Link from "next/link";
import { Button } from "../ui/button";
import { KofiDonate } from "../Donate";
import { Session } from "next-auth";
import { ChartLineIcon, Trophy, Unlock } from "lucide-react";

export async function DemoSection({ data }: { data: Session | null }) {
  return (
    <section className="flex justify-center items-center">
      {data?.user.subscriptionId || data?.user.lifetimePaymentId ? (
        <Link
          href={
            process.env.NODE_ENV !== "production"
              ? "https://billing.stripe.com/p/login/test_00g00Fc3LdBX9dm8ww"
              : "https://billing.stripe.com/p/login/eVaeVj7y46EY0Jq288"
          }
          className="ml-4"
        >
          <Button className="flex items-center space-x-2" variant={"secondary"}>
            Manage Subscription
          </Button>
        </Link>
      ) : (
        <>
          {process.env.NEXT_PUBLIC_TIER_RELEASED && (
            <Link href="/pricing">
              <Button variant={"outline"} className="font-bold dark:text-white dark:bg-green-700">
                <Unlock className="mr-2" />
                Unlock Full Potential: Upgrade to PRO Today
              </Button>
            </Link>
          )}
        </>
      )}
      {!data && (
        <Link href="/graph/mock" className="ml-4">
          <Button className="flex items-center space-x-2">View Demo Now</Button>
        </Link>
      )}
    </section>
  );
}
