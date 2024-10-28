import { stripe } from "@/components/Auth";
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
    return <p>Oops, problem in your payment, did not work.</p>;
  }

  if (session?.status === "complete") {
    return (
      <section className="mx-auto">
        <h3>
          We appreciate your business! You can cancel anytime in{" "}
          <Link href="/subscription">Subscription Management</Link> .
        </h3>
      </section>
    );
  }

  return null;
}
