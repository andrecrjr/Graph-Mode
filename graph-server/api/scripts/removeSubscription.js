import { RedisController } from "../controller/RedisController/index.js";
const args = process.argv;


if (args.length < 3) {
    console.log("Uso correto: node ./api/scripts/removeSubscription.js email@email.com");
    process.exit(1);
}

const email = args[2];
const expiry = args[3] || null;

async function deleteSub(email) {
    try {
        const redisClient = new RedisController()
        const data = await redisClient.deleteKey(`notion-${email}`);
        await redisClient.closeConnection()
        return data;
    } catch (error) {
        console.log(error)
    }

}

await deleteSub(email);
