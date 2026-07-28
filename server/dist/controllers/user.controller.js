import User from "../models/user.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/AppError.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from 'bcryptjs';
import events from '../lib/events.js';
// Signup a new user
export const signup = asyncHandler(async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    if (!fullName || !email || !password || !bio) {
        throw new AppError("Missing details", 400, "Please provide fullName, email, password, and bio");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("Email already exists", 400, "A user with this email already exists");
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const user = await User.create({ fullName, email, password: hashedPassword, bio });
    // notify runtime that a new user was created so server can broadcast to sockets
    try {
        events.emit('userCreated', user);
    }
    catch (err) {
        // non-fatal — continue
        console.warn('Failed to emit userCreated event', err);
    }
    const token = generateToken(user._id.toString());
    res.status(201).json({ success: true, user, token, message: "User registered successfully" });
});
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError("Missing credentials", 400, "Please provide email and password");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid credentials", 401, "Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401, "Invalid email or password");
    }
    const token = generateToken(user._id.toString());
    res.json({ success: true, user, token, message: "User logged in successfully" });
});
// controller to check if user is authenticated
export const checkAuth = asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
});
// controller to update user profile
export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { fullName, bio, profilePic } = req.body;
    if (!userId) {
        throw new AppError("Unauthorized access", 401);
    }
    let updatedUser = null;
    if (!profilePic) {
        updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });
    }
    else {
        const upload = await cloudinary.uploader.upload(profilePic, {
            folder: "profile_pics",
            public_id: `${userId}_profile_pic`,
            overwrite: true,
            transformation: [{ width: 200, height: 200, crop: "fill" }]
        });
        updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio, profilePic: upload.secure_url }, { new: true });
    }
    res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });
});
