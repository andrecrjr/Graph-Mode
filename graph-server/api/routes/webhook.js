import express, { Router } from "express";
import stripe from "stripe"
import { RedisController } from "../controller/RedisController/index.js";
import logger from "../logs/index.js";

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

  switch (event.type) {
    case "customer.subscription.created":
      if (eventData?.payment_status === "paid") {
        const notionUserId = eventData.metadata?.notionUserId;
        if (!notionUserId) {
          logger.error("Metadata missing notionUserId in checkout.session.completed");
          return res.status(400).send({ error: "Invalid event: Missing notionUserId" });
        }
        try {
          let userData = await userController.getKey(`notion-${notionUserId}`);
          userData = userData || {};
          userData.subscriptionId = eventData.subscription;
          userData.lastPaymentDate = eventData.created * 1000;
          await userController.setKey(`notion-${notionUserId}`, userData);
          logger.info(`Subscription updated for user: ${notionUserId}`);
          return res.status(200).send();
        } catch (err) {
          logger.error(`Error handling checkout session for user ${notionUserId}: ${err.message}`);
          return res.status(500).send("Internal Server Error");
        }
      }
      break;

    case "customer.subscription.deleted":
      const notionUserId = eventData.metadata?.notionUserId;
      if (!notionUserId) {
        logger.error("Metadata missing notionUserId in customer.subscription.deleted");
        return res.status(404).send({ error: "User not found" });
      }

      try {
        const userData = await userController.getKey(`notion-${notionUserId}`);
        if (userData) {
          userData.subscriptionId = null;
          await userController.setKey(`notion-${notionUserId}`, userData);
          logger.info(`Subscription removed for user: ${notionUserId}`);
        }

        return res.status(200).send();
      } catch (err) {
        logger.error(`Error handling subscription deletion for user ${notionUserId}: ${err.message}`);
        return res.status(500).send("Internal Server Error");
      }
    
    case "invoice.payment_succeeded":
      const succeededNotionUserId = eventData.metadata?.notionUserId;
      if (!succeededNotionUserId) {
        logger.error("Metadata missing notionUserId in invoice.payment_succeeded");
        return res.status(400).send({ error: "Invalid event: Missing notionUserId" });
      }

      try {
        // Update user record to reflect successful payment
        let userData = await userController.getKey(`notion-${succeededNotionUserId}`);
        if (userData) {
          userData.lastPaymentDate = eventData.created * 1000;
          await userController.setKey(`notion-${succeededNotionUserId}`, userData);
          logger.info(`Payment succeeded for user: ${succeededNotionUserId}`);
        }

        return res.status(200).send();
      } catch (err) {
        logger.error(`Error handling successful payment for user ${succeededNotionUserId}: ${err.message}`);
        return res.status(500).send("Internal Server Error");
      }
    
    case "invoice.payment_failed":
      const failedNotionUserId = eventData.metadata?.notionUserId;
      if (!failedNotionUserId) {
        logger.error("Metadata missing notionUserId in invoice.payment_failed");
        return res.status(400).send({ error: "Invalid event: Missing notionUserId" });
      }

      try {
        let userData = await userController.getKey(`notion-${failedNotionUserId}`);
        if (userData) {
          userData.paymentFailed = true;
          await userController.setKey(`notion-${failedNotionUserId}`, userData);
          logger.warn(`Payment failed for user: ${failedNotionUserId}`);
        }

        return res.status(200).send();
      } catch (err) {
        logger.error(`Error handling failed payment for user ${failedNotionUserId}: ${err.message}`);
        return res.status(500).send("Internal Server Error");
      }

    default:
      return res.status(200).send();
  }

  return res.status(200).send();
});

export {router as webhookStriperRouter};