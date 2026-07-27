import mongoose from "mongoose";
import { AppError } from "./AppError.js";

export const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new AppError("MONGODB_URI is not defined", 500);
    }

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });

    mongoose.connection.on("error", (err: unknown) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "chat-app",
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new AppError("Failed to connect to MongoDB", 500, errorMessage);
  }
};
