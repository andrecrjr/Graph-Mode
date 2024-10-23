import express, { Router } from "express";
import stripe from "stripe";
import {
	handleSubscriptionDeleted,
	handleSubscriptionUpdated,
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
			return await handleSubscriptionUpdated(event, res);

		if (event.type === "customer.subscription.deleted")
			return await handleSubscriptionDeleted(event, res);
		console.log("events: ", event.type);
		return res.status(200).send();
	},
);

export { router as webhookStriperRouter };
