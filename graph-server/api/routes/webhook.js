import express, { Router } from "express";
import stripe from "stripe"

const router = Router()


router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(JSON.stringify(paymentIntent.metadata))
      console.log('PaymentIntent was successful!');
      break;
    case 'customer.subscription.created':
      // Lógica para quando uma assinatura é criada
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send();
});

export {router as webhookStriperRouter};