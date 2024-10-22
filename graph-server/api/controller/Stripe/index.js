import stripe from "stripe";
import logger from "../../logs/index.js";
import { RedisController } from "../RedisController/index.js";

const userController = new RedisController();

// Função para lidar com eventos de atualização de assinatura
export async function handleSubscriptionUpdated(event, res) {
	console.log("INICIANDO", event);
	const eventData = event.data.object;

	// Verifique se o status de pagamento é inválido
	if (eventData?.payment_status !== "paid") {
		return res.status(400).send({ error: "Invalid payment status" });
	}

	const notionUserId = eventData.metadata?.notionUserId;

	// Validação do notionUserId
	if (!notionUserId) {
		logger.error(`Metadata missing notionUserId in ${event.type}`);
		return res
			.status(400)
			.send({ error: "Invalid event: Missing notionUserId" });
	}

	try {
		let userData = await userController.getKey(`notion-${notionUserId}`);
		userData = userData || {};

		userData.subscriptionId = eventData.subscription;
		userData.lastPaymentDate = eventData.created * 1000;

		await userController.setKey(`notion-${notionUserId}`, userData);
		await userController.setKey(
			`notion-sub-${userData.subscriptionId}`,
			userData,
		);

		logger.info(`Subscription updated for user: ${notionUserId}`);
		return res.status(200).send();
	} catch (err) {
		logger.error(
			`Error handling subscription update for user ${notionUserId}: ${err.message}`,
		);
		return res.status(500).send("Internal Server Error");
	}
}

export async function handleSubscriptionDeleted(event, res) {
	const eventData = event.data.object;

	try {
		const userSub = await userController.getKey(`notion-sub-${eventData.id}`);

		if (!userSub) {
			logger.error(
				`Subscription not found for ${eventData.id} in ${event.type}`,
			);
			return res.status(404).send({ error: "Subscription not found" });
		}

		const userData = await userController.getKey(
			`notion-${userSub.person.email}`,
		);

		if (userData) {
			userData.subscriptionId = null;
			await userController.setKey(`notion-${userSub.person.email}`, userData);
			logger.info(`Subscription removed for user: ${userSub.person.email}`);
		}

		return res.status(200).send();
	} catch (err) {
		logger.error(
			`Error handling subscription deletion for subscription ${eventData.id}: ${err.message}`,
		);
		return res.status(500).send("Internal Server Error");
	}
}
