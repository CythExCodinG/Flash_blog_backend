import amqp from "amqplib"
import { client } from "../server.js";
import { sql } from "./db.js";

interface CacheInvalidationMessage {
  action: string,
  keys: string[];
}

export const startCacheConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: "localhost",
      port: 5672,
      username: "admin",
      password: "admin123"
    });

    const channel = await connection.createChannel();
    const queueName = "cache-invalidation";

    await channel.assertQueue(queueName, { durable: true });

    console.log("✅ Blog service cache consumer started ")

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString()) as CacheInvalidationMessage;

          console.log("📩blog service received cache invalidation message", content)

          if (content.action === "invalidateCache") {
            for (const pattern of content.keys) {
              const keys = await client.keys(pattern)

              if (keys.length > 0) {
                await client.del(keys);

                console.log(`🗑️Blog service invalidated ${keys.length} cache keys matching :${pattern}`)
              }
              const category = ""
              const searchQuery = ""

              const cacheKey = `blogs:${searchQuery || "all"}:${category || "all"}`

              const blogs = await sql`SELECT * FROM blogs ORDER BY created_at DESC`;

              await client.set(cacheKey, JSON.stringify(blogs));

              console.log("🔄️ Cache Rebuilt with key", cacheKey);

            }
            channel.ack(msg);

          }
        } catch (error) {
          console.error("❌ Error processing cache invalidation in blog service")

          channel.nack(msg, false, true)
        }
      }
    })
  } catch (error) {
    console.error("❌ failed to start rabbit mq consumer")
  }
}

