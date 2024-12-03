import { auth, stripe } from "@/components/Auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await auth();
    const { priceId } = await request.json();
    if (!priceId || !data) {
      throw new Error("No price id or user data");
    }

    let price;
    const prices = process.env.PRICE_IDS?.split(",")!;
    const validPriceIds = ["month", "lifetime"];
    if (!validPriceIds.includes(priceId)) {
      throw new Error("Invalid priceId");
    }

    if (priceId === "month") price = prices[1];
    if (priceId === "lifetime") price = prices[3];

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      metadata: {
        notionUserId: data?.user?.person?.email || "",
      },
      mode: priceId === "lifetime" ? "payment" : "subscription",
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
