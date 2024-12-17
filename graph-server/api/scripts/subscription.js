import { RedisController } from "../controller/RedisController/index.js";
const args = process.argv;


if (args.length < 3) {
    console.log("Uso correto: node ./api/scripts/subscriptions.js email@email.com  expiry");
    process.exit(1);
}

const email = args[2];
const expiry = args[3] || null;

async function generateAccessUrl(email) {
    try {
        const redisClient = new RedisController()
        const data = await redisClient.setKey(`notion-${email}`, { lifetimePaymentId:"bonus"}, expiry);
        await redisClient.closeConnection()
        return data;
    } catch (error) {
        console.log(error)
    }

}

await generateAccessUrl(email);
