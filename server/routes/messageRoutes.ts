import express, { Router } from "express";
import { getMessagesForUser, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const messageRouter: Router = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessagesForUser);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

export default messageRouter;
