import Stripe from "stripe";
import logger from "../../logs/index.js";
import { RedisController } from "../RedisController/index.js";

const userController = new RedisController();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handleSubscriptionCreated(event, res) {
	const eventData = event.data.object;

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
			userData.nextPaymentDate = updatedSubscription.current_period_end * 1000;
			await userController.setKey(`notion-${notionUserId}`, userData);
			const userCancelledButSubscribedAgain = userData.cancelAt || userData.cancelAtPeriodEnd
			if(userCancelledButSubscribedAgain){
				delete userData["cancelAt"]
				delete userData["cancelAtPeriodEnd"]
				logger.info(`User:${notionUserId} subscribed again successfuly`)
			}
            await userController.setKey(`notion-${notionUserId}`, userData);

            logger.info(`Subscription successfully updated for user: ${notionUserId}`);
        }
        else if (eventData.payment_intent) {
            let userData = (await userController.getKey(`notion-${notionUserId}`)||{});
            userData.lifetimePaymentId = eventData.payment_intent;
            userData.lastPaymentDate = eventData.created * 1000;
			const userHasSubscriptionButBoughtLifetime = userData.subscriptionId && !userData.cancelAt && !userData.cancelAtPeriodEnd
			if(userHasSubscriptionButBoughtLifetime){
				await stripe.subscriptions.update(userData.subscriptionId, {
      				cancel_at_period_end: true,
                    metadata: {
                        notionUserId,
                    },
		    	});
				delete userData["subscriptionId"]		
			}

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
	const notionUserId = eventData.metadata.notionUserId
	try {
		
		if(!eventData.metadata.notionUserId){
			logger.error(`Metadata missing notionUserId in ${event.type}`);
			return res.status(400).send({ error: "Invalid event: Missing notionUserId" });
		}
		const userSub = await userController.getKey(`notion-${notionUserId}`);

		if (userSub && !userSub.lifetimePaymentId) {
			await userController.deleteKey(`notion-${notionUserId}`);
			logger.info(`Subscription removed for user: ${notionUserId}`);
		}
		return res.status(200).send(`Removed subscription successfully processed for user: : ${notionUserId}`);
	} catch (err) {
		logger.error(
			`Error handling subscription deletion for subscription ${eventData.id} with metadata ${JSON.stringify(eventData.metadata)}: ${err.message}`,
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
		console.log("nextpaymentdate", subscription.current_period_end)
		const userCancelledButPaid = userData.cancelAt || userData.cancelAtPeriodEnd
		if(userCancelledButPaid){
			delete userData["cancelAt"]
			delete userData["cancelAtPeriodEnd"]
			logger.info(`User:${notionUserId} paid again successfully even if he cancelled before`)
		}

        await userController.setKey(`notion-${notionUserId}`, userData);

        logger.info(`Payment succeeded for user: ${notionUserId}, subscription updated`);

        return res.status(200).send(`Payment succeeded for user: ${notionUserId}, subscription updated`);
    } catch (err) {
        logger.error(`Error handling payment succeeded for user: ${err.message}`, err);
        return res.status(500).send("Internal Server Error");
    }
}

export async function handleCancelAtEnd(event, res) {
	const eventData = event.data.object;

	if (!eventData.metadata || !eventData.metadata.notionUserId) {
		logger.error(`Metadata missing notionUserId in ${event.type}`);
		return res.status(400).send({ error: "Invalid event: Missing notionUserId" });
	}

	const notionUserId = eventData.metadata.notionUserId;

	try {

		if (eventData.cancel_at_period_end) {
			const cancelAt = eventData.current_period_end * 1000;
			let userData = await userController.getKey(`notion-${notionUserId}`);
			userData = userData || {};

			userData.cancelAtPeriodEnd = true;
			userData.cancelAt = cancelAt;

			await userController.setKey(`notion-${notionUserId}`, userData);

			logger.info(`Subscription for user ${notionUserId} set to cancel at ${new Date(cancelAt)}`);
		} else {
			logger.info(`Subscription for user ${notionUserId} is not set to cancel at the end of the period`);
		}

		return res.status(200).send(`Cancellation status updated for user: ${notionUserId}`);
	} catch (err) {
		logger.error(
			`Error handling cancel at end for subscription ${eventData.id} for user ${notionUserId}: ${err.message}`,
			err
		);
		return res.status(500).send("Internal Server Error");
	}
}
