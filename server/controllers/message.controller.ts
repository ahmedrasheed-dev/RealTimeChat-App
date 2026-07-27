import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

interface UnreadAggregateResult {
  _id: mongoose.Types.ObjectId;
  count: number;
}

// get all users except the logged in user
export const getUsersForSidebar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const loggedInUserId = req.userId!;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    const unreadCounts = await Message.aggregate<UnreadAggregateResult>([
        {
            $match: {
                receiverId: loggedInUserId ? new mongoose.Types.ObjectId(loggedInUserId) : null,
                seen: false,
            },
        },
        {
            $group: {
                _id: "$senderId",
                count: { $sum: 1 },
            },
        },
    ]);

    const unSeenMessages = unreadCounts.reduce<Record<string, number>>((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
    }, {});

    res.status(200).json({ success: true, users: filteredUsers, unSeenMessages });
});

// get all msgs for selected user
export const getMessagesForUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const loggedInUserId = req.userId;
    const selectedUserId = req.params.id as string;

    const messages = await Message.find({
        $or: [
            { senderId: loggedInUserId, receiverId: selectedUserId },
            { senderId: selectedUserId, receiverId: loggedInUserId },
        ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
        { senderId: selectedUserId, receiverId: loggedInUserId, seen: false },
        { $set: { seen: true } }
    );

    res.status(200).json({ success: true, messages });
});

// controller to mark message as seen
export const markMessageAsSeen = asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const loggedInUserId = req.userId;
    const messageId = req.params.id as string;

    const message = await Message.findOne({
        _id: messageId,
        receiverId: loggedInUserId,
    });

    if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
    }

    message.seen = true;
    await message.save();

    res.status(200).json({ success: true, message: "Message marked as seen" });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const senderId = req.userId;
    const { text, image } = req.body as { text?: string; image?: string };
    const receiverId = req.params.id as string;

    let imageUrl: string | undefined = undefined;
    if (image) {
        const upload = await cloudinary.uploader.upload(image);
        imageUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
        senderId: new mongoose.Types.ObjectId(senderId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        text,
        image: imageUrl
    });

    // emit the new message to the receiver if they are online
    if (receiverId) {
        const receiverSocketId = userSocketMap[receiverId]; // look receiver socket id in the map
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    }

    res.status(201).json({ success: true, message: newMessage });
});
