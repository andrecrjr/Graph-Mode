import express, { Router } from "express";
import stripe from "stripe"

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

  switch (event.type) {
    case "checkout.session.completed":
      if(event.data.object.payment_status==="paid"){
        console.log("paid", event.data.object)
      }
    case "customer.subscription.deleted":
        console.log(`Usuário saiu da inscrição :( ${event.data.object.status}`)
        // remover o usuário daqui
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send();
});

export {router as webhookStriperRouter};