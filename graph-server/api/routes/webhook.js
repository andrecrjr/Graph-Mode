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
  const userController = new RedisController()
  if(event.type === "checkout.session.completed"){
    if(event.data.object.payment_status==="paid"){
        const data = await userController.getKey(`notion-${event.data.object.metadata.notionUserId}`)
        if(!data){
          await userController.setKey(`notion-${event.data.object.metadata.notionUserId}`, {"subscriptionId": event.data.object.subscription})
          return res.status(200).send();
        }
        await userController.setKey(`notion-${event.data.object.metadata.notionUserId}`,
            {...data, ...{"subscriptionId": event.data.object.subscription}})
        return res.status(200).send();
    }
  }

  if(event.type === "customer.subscription.deleted"){
    console.log("removido", event.data.object)
  }

  return res.status(200).send();
});

export {router as webhookStriperRouter};