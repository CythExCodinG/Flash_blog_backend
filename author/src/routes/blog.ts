import express from "express"
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";

import { createBlog, deleteBlog, updateBlog } from "../controller/blog.js";


const router = express()


router.post("/blog/new", isAuth, uploadFile, createBlog)
router.post("/blog/:id", isAuth, updateBlog)
router.post("/blog/delete/:id", isAuth, deleteBlog)

export default router;
