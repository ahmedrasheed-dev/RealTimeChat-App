import jwt from 'jsonwebtoken';

export const generateToken = (userId, secret) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET);
}