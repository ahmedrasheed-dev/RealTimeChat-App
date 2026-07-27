import { Request, Response } from "express";
import User, { IUser } from "../models/user.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/AppError.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from 'bcryptjs';

interface SignupBody {
    fullName?: string;
    email?: string;
    password?: string;
    bio?: string;
}

interface LoginBody {
    email?: string;
    password?: string;
}

interface UpdateProfileBody {
    fullName?: string;
    bio?: string;
    profilePic?: string;
}

// Signup a new user
export const signup = asyncHandler(async (req: Request<{}, {}, SignupBody>, res: Response): Promise<void> => {
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

    const token = generateToken(user._id.toString());

    res.status(201).json({ success: true, user, token, message: "User registered successfully" });
});

export const login = asyncHandler(async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
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
export const checkAuth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, user: req.user });
});

// controller to update user profile
export const updateProfile = asyncHandler(async (req: Request<{}, {}, UpdateProfileBody>, res: Response): Promise<void> => {
    const userId = req.userId;
    const { fullName, bio, profilePic } = req.body;

    if (!userId) {
        throw new AppError("Unauthorized access", 401);
    }

    let updatedUser: IUser | null = null;

    if (!profilePic) {
        updatedUser = await User.findByIdAndUpdate(
            userId, { fullName, bio }, { new: true }
        );
    } else {
        const upload = await cloudinary.uploader.upload(profilePic, {
            folder: "profile_pics",
            public_id: `${userId}_profile_pic`,
            overwrite: true,
            transformation: [{ width: 200, height: 200, crop: "fill" }]
        });
        updatedUser = await User.findByIdAndUpdate(
            userId, { fullName, bio, profilePic: upload.secure_url }, { new: true }
        );
    }
    res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });
});
