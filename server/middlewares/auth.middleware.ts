import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.model.js';

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const authHeader = (req.headers.authorization || req.headers.Authorization || req.headers.token) as string | undefined;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized access' });
  }

  const decodedToken = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT_SECRET is missing' });
    }

    const decoded = jwt.verify(decodedToken, secret) as CustomJwtPayload;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
