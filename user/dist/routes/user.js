import express from 'express';
import { getUserProfile, loginUser, myProfile, updateProfile, updateUser } from '../controller/user.js';
import { isAuth } from '../middleware/isAuth.js';
import uploadFile from '../middleware/multer.js';
const router = express.Router();
router.post("/login", loginUser);
router.get("/me", isAuth, myProfile);
router.put("/user/update", isAuth, updateUser);
router.post("/user/updateprofile", isAuth, uploadFile, updateProfile);
router.get("/user/:id", getUserProfile);
export default router;
//# sourceMappingURL=user.js.map