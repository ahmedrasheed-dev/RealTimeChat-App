import express, { Router } from "express";
import { signup, login, checkAuth, updateProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const userRouter: Router = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/check", protectRoute, checkAuth);
userRouter.put("/update-profile", protectRoute, updateProfile);

export default userRouter;
