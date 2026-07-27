import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import http from 'http';
import { asyncHandler } from './lib/asyncHandler.js';
import { AppError } from './lib/AppError.js';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);

// init socket.io
export const io = new Server(server, {
    cors: {
        origin: "*"
    },
});

export const userSocketMap: Record<string, string> = {}; // userId -> socketId 

// socket connection
io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);
    const userId = socket.handshake.query.userId as string | undefined;
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

// middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));

// test error route
app.get('/api/test-error', asyncHandler(async (_req: Request, _res: Response) => {
    throw new AppError('This is a custom application error', 400);
}));

// connect to MongoDB
try {
    await connectDB();
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('MongoDB startup failed:', message);
}

// ROUTES
app.get('/api/status', asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
}));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// unknown route handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError('Route not found', 404));
});

// error handling middleware
app.use((err: AppError | Error, _req: Request, res: Response, _next: NextFunction) => {
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
