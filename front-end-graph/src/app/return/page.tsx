import { stripe } from "@/components/Auth";
import Link from "next/link";

async function getSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId!);
  return session;
}

export default async function CheckoutReturn({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  const sessionId = searchParams.session_id;
  const session = await getSession(sessionId);

  if (session?.status === "open") {
    return <p>Oops, payment did not work.</p>;
  }

  if (session?.status === "complete") {
    return (
      <h3>
        We appreciate your business! You can cancel anytime in{" "}
        <Link href="/billing">Billing</Link> .
      </h3>
    );
  }

  return null;
}
