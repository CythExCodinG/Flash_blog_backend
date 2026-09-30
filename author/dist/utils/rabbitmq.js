import amqp from 'amqplib';
import { buffer } from 'stream/consumers';
let channel;
export const connetRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username: "admin",
            password: "admin123"
        });
        channel = await connection.createChannel();
        console.log("✅Connection successful");
    }
    catch (error) {
        console.error("❌ failed to connect :", error);
    }
};
export const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.error("Rabbitmq channel is not intialized ");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true
    });
};
export const invalidateChacheJob = async (cacheKeys) => {
    try {
        const message = {
            action: "invalidateCache",
            keys: cacheKeys
        };
        await publishToQueue("cache-invalidation", message);
        console.log("✅ chache invalidation job publish to rabbitmq");
    }
    catch (error) {
        console.error("❌ failed to publish chache :", error);
    }
};
//# sourceMappingURL=rabbitmq.js.map