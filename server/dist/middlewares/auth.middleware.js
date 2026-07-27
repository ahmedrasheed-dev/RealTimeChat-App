import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
export const protectRoute = async (req, res, next) => {
    const authHeader = (req.headers.authorization || req.headers.Authorization || req.headers.token);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }
    const decodedToken = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ success: false, message: 'JWT_SECRET is missing' });
        }
        const decoded = jwt.verify(decodedToken, secret);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        req.user = user;
        req.userId = user._id.toString();
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
