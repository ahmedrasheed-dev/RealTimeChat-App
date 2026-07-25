import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { asyncHandler } from './lib/asyncHandler.js';
import { AppError } from './lib/AppError.js';
import { connectDB } from './lib/db.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

// middleware
app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/status', asyncHandler((req, res) => {
    res.status(200).json({ status: 'ok' });
}));
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

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});