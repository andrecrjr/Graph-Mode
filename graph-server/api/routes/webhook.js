import express, { Router } from "express";
import stripe from "stripe";
import {
  handleSubscriptionCreated,
  handlePaymentSucceeded,
	handleSubscriptionDeleted,
} from "../controller/Stripe/index.js";

const router = Router();

router.post(
	"/stripe",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		const sig =
			req.headers["stripe-signature"] || req.headers["Stripe-Signature"];
		let event;
		try {
			event = await stripe.webhooks.constructEventAsync(
				req.body,
				sig,
				process.env.STRIPE_WEBHOOK_SECRET,
			);
		} catch (err) {
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}

		if (event.type === "checkout.session.completed")
			await handleSubscriptionCreated(event, res);
		if (event.type==="invoice.payment_succeeded")
			await handlePaymentSucceeded(event, res);
		if (event.type === "customer.subscription.deleted")
			await handleSubscriptionDeleted(event, res);

		return res.status(200).send();
	},
);

export { router as webhookStriperRouter };
