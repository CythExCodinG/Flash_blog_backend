import express from "express";
import dotenv from "dotenv";
import blogRoutes from './routes/blog.js';
import { createClient } from "redis";
import cors from "cors";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;
export const client = createClient({
    url: process.env.REDIS_URL
});
await client.connect().then(() => { console.log("Conneted to redis client"); });
console.log("Connected to redis");
app.use("/app/v1", blogRoutes);
app.listen(port, () => {
    console.log(`Server running on http://locahost:${port}`);
});
//# sourceMappingURL=server.js.map