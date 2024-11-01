import { stripe } from "@/components/Auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId!);
    return session;
  } catch (error) {
    console.error("Error in billing management session");
  }
}

export default async function CheckoutReturn({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  const sessionId = searchParams.session_id;
  const session = await getSession(sessionId);

  if (!session) {
    redirect("/");
  }

  if (session?.status === "open") {
    return (
      <section className="p-6 mx-auto">
        <p>
          Oops, problem in your payment, did not work. Please check if{" "}
          {"you're"} with{" "}
          <Link href="/subscription">subscription activated</Link>.
        </p>
        <p>
          If there was a problem send your session id: <code>{sessionId}</code>{" "}
          to our{" "}
          <a
            href="https://acjr.notion.site/12db5e58148c80c19144ce5f22f3f392?pvs=105"
            className="font-bold underline"
          >
            Contact form
          </a>
          detailing the problem then {"you'll"} be assisted as soon as possible
          .
        </p>
      </section>
    );
  }

  if (session?.status === "complete") {
    return (
      <Card className="max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Thank you for your business! Your subscription is now active. You
            can manage your subscription at any time in your{" "}
            <Link
              href="/subscription"
              className="font-medium text-primary underline"
            >
              subscription dashboard
            </Link>
            .
          </p>
          <p className="pt-4 font-bold text-center">
            You now have full access to all premium features. Start exploring
            Graph Mode!
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}
