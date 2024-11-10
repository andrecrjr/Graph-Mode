import { auth, stripe } from "@/components/Auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, res: NextResponse) {
  const data = await auth();

  try {
    await stripe.subscriptions.update(data?.user.subscriptionId as string, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error canceling subscription" });
  }
}
