import express, { Router } from "express";
import stripe from "stripe"
import { RedisController } from "../controller/RedisController/index.js";

const router = Router()

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] || req.headers['Stripe-Signature'];
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  const eventData = event.data.object;
  const userController = new RedisController()
  if (event.type === "checkout.session.completed" && eventData?.payment_status === "paid") {
    const notionUserId = eventData.metadata?.notionUserId;

    if (!notionUserId) {
      console.error("Metadata missing notionUserId in checkout.session.completed");
      return res.status(400).send({ error: "Invalid event: Missing notionUserId" });
    }

    try {
      let userData = await userController.getKey(`notion-${notionUserId}`);

      userData = userData || {};
      userData.subscriptionId = eventData.subscription;

      await userController.setKey(`notion-${notionUserId}`, userData);
      console.log(`Subscription updated for user: ${notionUserId}`);

      return res.status(200).send();
    } catch (err) {
      console.error(`Error handling checkout session for user ${notionUserId}: ${err.message}`);
      return res.status(500).send("Internal Server Error");
    }
  }
  if (event.type === "customer.subscription.deleted") {
    const notionUserId = eventData.metadata?.notionUserId;

    if (!notionUserId) {
      console.error("Metadata missing notionUserId in customer.subscription.deleted");
      return res.status(404).send({ error: "User not found" });
    }

    try {
      const userData = await userController.getKey(`notion-${notionUserId}`);

      if (userData) {
        userData.subscriptionId = null;
        await userController.setKey(`notion-${notionUserId}`, userData);
        console.log(`Subscription removed for user: ${notionUserId}`);
      }

      return res.status(200).send();
    } catch (err) {
      console.error(`Error handling subscription deletion for user ${notionUserId}: ${err.message}`);
      return res.status(500).send("Internal Server Error");
    }
  }

  return res.status(200).send();
});

export {router as webhookStriperRouter};