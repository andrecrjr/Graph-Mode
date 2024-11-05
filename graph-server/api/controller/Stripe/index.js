import Stripe from "stripe";
import logger from "../../logs/index.js";
import { RedisController } from "../RedisController/index.js";

const userController = new RedisController();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handleSubscriptionCreated(event, res) {
	const eventData = event.data.object;

	if (eventData?.payment_status !== "paid") {
		return res.status(400).send({ error: "Invalid payment status" });
	}

	const notionUserId = eventData.metadata?.notionUserId;

	if (!notionUserId) {
		logger.error(`Metadata missing notionUserId in ${event.type}`);
		return res
			.status(400)
			.send({ error: "Invalid event: Missing notionUserId" });
	}

	try {
        if (eventData.subscription) {
            const updatedSubscription = await stripe.subscriptions.update(
                eventData.subscription,
                {
                    metadata: {
                        notionUserId,
                    },
                }
            );
            
            logger.info(`Updated subscription with metadata: ${JSON.stringify(updatedSubscription.metadata)}`);

            let userData = (await userController.getKey(`notion-${notionUserId}`)||{});
            userData.subscriptionId = eventData.subscription;
            userData.lastPaymentDate = eventData.created * 1000;

            await userController.setKey(`notion-${notionUserId}`, userData);

            logger.info(`Subscription successfully updated for user: ${notionUserId}`);
        }
        else if (eventData.payment_intent) {
            let userData = (await userController.getKey(`notion-${notionUserId}`)||{});
            userData.lifetimePaymentId = eventData.payment_intent;
            userData.lastPaymentDate = eventData.created * 1000;

            await userController.setKey(`notion-${notionUserId}`, userData);

            logger.info(`One-time payment successfully processed for user: ${notionUserId}`);
        }
        return res.status(200).send(`One-time payment successfully processed for user: : ${notionUserId}`);
	} catch (err) {
		logger.error(
			`Error handling subscription update for user ${notionUserId}: ${err.message}`,
		);
		return res.status(500).send(`Internal Server Error for ${notionUserId}`);
	}
}

export async function handleSubscriptionDeleted(event, res) {
	const eventData = event.data.object;

	try {
		
		if(!eventData.metadata.notionUserId){
			logger.error(`Metadata missing notionUserId in ${event.type}`);
			return res.status(400).send({ error: "Invalid event: Missing notionUserId" });
		}
		const userSub = await userController.getKey(`notion-${eventData.metadata.notionUserId}`);

		if (userSub) {
			await userController.deleteKey(`notion-${eventData.metadata.notionUserId}`);
			logger.info(`Subscription removed for user: ${eventData.metadata.notionUserId}`);
		}
		return res.status(200).send(`Removed subscription successfully processed for user: : ${notionUserId}`);
	} catch (err) {
		logger.error(
			`Error handling subscription deletion for subscription ${eventData.id}: ${err.message}`,
		);
		return res.status(500).send("Internal Server Error");
	}
}

export async function handlePaymentSucceeded(event, res) {
    const eventData = event.data.object;

    if (!eventData) {
        logger.error("Event data is missing");
        return res.status(400).send({ error: "Invalid event data" });
    }

    if (!eventData.subscription) {
        logger.warn("Payment succeeded event is not related to a subscription");
        return res.status(400).send({ error: "Payment is not related to a subscription" });
    }

    try {
        const subscription = await stripe.subscriptions.retrieve(eventData.subscription);
		const notionUserId = subscription.metadata.notionUserId
		
		if (!notionUserId) {
			logger.error(`Metadata missing notionUserId in ${event.type}`);
			return res.status(400).send({ error: "Invalid event: Missing notionUserId" });
		}

        let userData = await userController.getKey(`notion-${notionUserId}`);
        userData = userData || {};

        userData.subscriptionId = subscription.id;
        userData.lastPaymentDate = eventData.created * 1000;
        userData.nextPaymentDate = subscription.current_period_end * 1000;

        await userController.setKey(`notion-${notionUserId}`, userData);

        logger.info(`Payment succeeded for user: ${notionUserId}, subscription updated`);

        return res.status(200).send(`Payment succeeded for user: ${notionUserId}, subscription updated`);
    } catch (err) {
        logger.error(`Error handling payment succeeded for user ${notionUserId}: ${err.message}`, err);
        return res.status(500).send("Internal Server Error");
    }
}