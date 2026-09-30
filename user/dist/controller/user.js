import User from "../model/user.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import { v2 as cloudinary } from 'cloudinary';
import getBuffer from "../utils/daraUri.js";
export const loginUser = async (req, res) => {
    try {
        const { email, name, image } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                image
            });
        }
        const token = jwt.sign({ user }, process.env.JWT_SEC);
        res.status(200).json({
            message: "Login success",
            token: token,
            user: user
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json({ user });
});
export const getUserProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404).json({
            message: "User with this id not found"
        });
    }
    else {
        res.json({ user });
    }
});
export const updateUser = TryCatch(async (req, res) => {
    const { name, instagram, facebook } = req.body;
    const user = await User.findByIdAndUpdate(req.user?._id, {
        name, instagram, facebook
    }, {
        returnDocument: "after"
    });
    const token = jwt.sign({ user }, process.env.JWT_SEC);
    res.json({
        message: "User Updated",
        token,
        user
    });
});
export const updateProfile = TryCatch(async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).json({
            message: "No file to upload"
        });
        return;
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to get buffer"
        });
        return;
    }
    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs"
    });
    const user = await User.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url
    }, {
        returnDocument: "after"
    });
    const token = jwt.sign({ user }, process.env.JWT_SEC);
    res.json({
        message: "User Profile pic uploaded",
        token,
        user
    });
});
//# sourceMappingURL=user.js.map