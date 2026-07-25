import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { asyncHandler } from './lib/asyncHandler.js';
import { AppError } from './lib/AppError.js';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

dotenv.config();
const app = express();
const server = http.createServer(app);

//init socket.io
export const io = new Server(server, {
    cors: {
        origin: "*"
    },
});


export const userSocketMap = {}; // userId -> socketId 

//socket connection
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
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));

// test error route
app.get('/api/test-error', asyncHandler((req, res) => {
    throw new AppError('This is a custom application error', 400);
}));

// unknown route handler
app.use((req, res, next) => {
    next(new AppError('Route not found', 404));
});

// errror handling middleware
app.use((err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const details = err.details || null;

    res.status(statusCode).json({
        success: false,
        message,
        details,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// connect to MongoDB
try {
    await connectDB();
} catch (error) {
    console.error('MongoDB startup failed:', error.message);
}

// ROUTES

app.get('/api/status', asyncHandler((req, res) => {
    res.status(200).json({ status: 'ok' });
}));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);


const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});