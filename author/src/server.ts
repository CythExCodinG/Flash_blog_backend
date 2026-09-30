import express from "express"
import dotenv from "dotenv"
import blogRoutes from "./routes/blog.js"
import { sql } from "./utils/db.js";
import { v2 as cloudinary } from 'cloudinary'
import { connetRabbitMQ } from "./utils/rabbitmq.js";
import cors from "cors"
dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())
const port = process.env.PORT;

cloudinary.config({
  cloud_name: process.env.Cloud_Name as string,
  api_key: process.env.Cloud_Api_Key as string,
  api_secret: process.env.Cloud_Api_Secret as string
});

async function initDB() {
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS blogs(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      blogContent TEXT NOT NULL,
      category VARCHAR(30) NOT NULL,
      image TEXT NOT NULL,
      author VARCHAR(30) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) 
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS comments(
      id SERIAL PRIMARY KEY,
      comment VARCHAR(255) NOT NULL,
      userid VARCHAR(255) NOT NULL,
      username VARCHAR(30) NOT NULL,
      blogid  VARCHAR(30) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS savedBlogs(
      id SERIAL PRIMARY KEY,
      userid VARCHAR(255) NOT NULL,
      blogid  VARCHAR(30) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    console.log("DB init successfully")
  } catch (error) {
    console.log("Error initDB", error)
  }
}
connetRabbitMQ();

app.use("/app/v1/", blogRoutes);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://locahost:${port}`)
  })
})
