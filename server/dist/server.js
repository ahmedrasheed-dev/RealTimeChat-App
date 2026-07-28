import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import http from 'http';
import { asyncHandler } from './lib/asyncHandler.js';
import { AppError } from './lib/AppError.js';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import events from './lib/events.js';
const app = express();
const server = http.createServer(app);
// init socket.io
export const io = new Server(server, {
    cors: {
        origin: "*"
    },
});
export const userSocketMap = {}; // userId -> socketId 
// socket connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        if (userId) {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
// listen for application-level events and forward to sockets
events.on('userCreated', (user) => {
    try {
        io.emit('newUser', user);
    }
    catch (err) {
        console.warn('Failed to emit newUser via socket.io', err);
    }
});
// middleware
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://real-time-chat-app-nu-wine.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        }
        else {
            callback(null, true); // Permissive CORS for deployed clients
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));
// test error route
app.get('/api/test-error', asyncHandler(async (_req, _res) => {
    throw new AppError('This is a custom application error', 400);
}));
// connect to MongoDB
try {
    await connectDB();
}
catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('MongoDB startup failed:', message);
}
// ROUTES
app.get('/api/status', asyncHandler(async (_req, res) => {
    res.status(200).json({ status: 'ok' });
}));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);
// unknown route handler
app.use((_req, _res, next) => {
    next(new AppError('Route not found', 404));
});
// error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err);
    const statusCode = 'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    const details = 'details' in err ? err.details : null;
    res.status(statusCode).json({
        success: false,
        message,
        details,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
