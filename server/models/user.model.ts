import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  fullName: string;
  password?: string;
  profilePic?: string;
  bio?: string;
}

export type UserDocument = IUser & Document;

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    bio: { type: String },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
