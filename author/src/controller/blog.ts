import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/daraUri.js";
import { sql } from "../utils/db.js";
import { invalidateChacheJob } from "../utils/rabbitmq.js";
import TryCatch from "../utils/TryCatch.js";
import cloudinary from "cloudinary"

export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogContent, category } = req.body
  const file = req.file;
  if (!file) {
    res.status(400).json({
      message: "No file to upload"
    })
    return
  }

  const fileBuffer = getBuffer(file);
  if (!fileBuffer || !fileBuffer.content) {
    res.status(400).json({
      message: "Failed to get buffer"
    })
    return
  }

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, { folder: "blogs" })

  const result = await sql`INSERT INTO blogs (title,description,image,blogcontent,category,author) VALUES (${title},${description},${cloud.secure_url},${blogContent},${category},${req.user?._id}) RETURNING *`;

  await invalidateChacheJob(["blogs:*"]);

  res.json({
    message: "Blog Created",
    blog: result[0]
  })
})

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const id = req.params.id;
  console.log(id)
  const { title, description, blogContent, category } = req.body
  const file = req.file;

  const blog = await sql`SELECT * FROM blogs WHERE id=${id}`

  if (!blog.length) {
    res.status(404).json({
      message: "Blog with this id doesn't exist"
    })
    return
  }
  if (blog[0]?.author !== req.user?._id) {
    res.status(400).json({
      message: "Not a authenticated user"
    })
    return
  }

  let imageUrl = blog[0]?.image;

  if (file) {
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to get buffer"
      })
      return
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, { folder: "blogs" })

    imageUrl = cloud.secure_url
  }

  const updatedBlog = await sql`UPDATE blogs SET 
  title=${title || blog[0]?.title},
  description=${description || blog[0]?.description}, 
  image=${imageUrl}, 
  blogcontent=${blogContent || blog[0]?.blogcontent}, 
  category=${category || blog[0]?.category}
  WHERE id=${id}
  RETURNING *
  `
  await invalidateChacheJob(["blogs:*", `blog:${id}`]);
  res.json({
    message: "blog updated ",
    blog: updatedBlog[0]
  })
})


export const deleteBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const id = req.params.id;

  const blog = await sql`SELECT * FROM blogs WHERE id=${id}`

  if (!blog.length) {
    res.status(404).json({
      message: "Blog with this id doesn't exist"
    })
    return
  }
  if (blog[0]?.author !== req.user?._id) {
    res.status(400).json({
      message: "Not a authenticated user"
    })
    return
  }

  await sql`DELETE FROM savedBlogs WHERE blogid=${id}`
  await sql`DELETE FROM comments WHERE blogid=${id}`
  await sql`DELETE FROM blogs WHERE id=${id}`

  await invalidateChacheJob(["blogs:*", `blog:${id}`]);


  res.status(200).json({
    message: "Blog deleted successfully"
  })
})