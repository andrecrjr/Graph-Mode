import { auth, stripe } from "@/components/Auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await auth();
    const { priceId } = await request.json();

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        notionUserId: data?.user.id || "",
      },
      mode: "subscription",
      return_url: `${request.headers.get("origin")}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
