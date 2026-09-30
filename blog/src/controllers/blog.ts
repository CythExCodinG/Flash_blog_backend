import { client } from "../server.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";


export const getAllBlogs = TryCatch(async (req, res) => {

  const { searchQuery, category } = req.query;

  let blogs
  const key = `blogs:${searchQuery || "all"}:${category || "all"}`

  const chachedBlogs = await client.get(key);
  if (chachedBlogs) {
    res.json(JSON.parse(chachedBlogs));
    console.log("served from redis")
    return
  }

  if (searchQuery && category) {
    blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) AND category = ${category} ORDER BY created_at desc`
  } else if (searchQuery) {
    blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) ORDER BY created_at desc`
  } else {
    blogs = await sql`SELECT * FROM blogs ORDER BY created_at desc`;
  }

  await client.set(key, JSON.stringify(blogs));

  res.json(blogs)
  console.log("Served from DB");

})

export const getSingleBlog = TryCatch(async (req, res) => {

  const blog = await sql`
        SELECT * FROM blogs
        WHERE id = ${req.params.id}
    `;

  const blogData = blog[0];

  if (!blogData) {
    res.status(404).json({
      message: "Blog not found"
    });
    return;
  }

  const { data } = await axios.get(
    `${process.env.USER_SERVICE}/app/v1/user/${blogData.author}`
  );

  res.json({
    blog: blogData,
    author: data
  });
});