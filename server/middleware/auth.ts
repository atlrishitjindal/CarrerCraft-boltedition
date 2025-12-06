import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;

    // Check Bearer token
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    const token = header.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // Attach decoded user to request
    (req as any).user = decoded;


    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userResult = (req as any).user;

    if (!userResult || !allowedRoles.includes(userResult.role)) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to perform this action',
      });
    }

    next();
  };
};
