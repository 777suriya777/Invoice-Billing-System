import jsonwebtoken from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string;
                email: string;
                firstName: string;
                lastName: string | null;
                iat?: number;
                exp?: number;
                iss?: string;
            };
        }
    }
}

function authenticateUser(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies.accessToken; 

    if (!token) {
        res.status(401).json({ 
            message: 'Unauthorized: Session expired or not found' 
        });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not defined');
        const decoded = jsonwebtoken.verify(token, secret) as any;
        req.user = decoded;

        next();
    } catch (err) {
        res.clearCookie('accessToken'); 
        
        res.status(403).json({ 
            message: 'Forbidden: Invalid or expired session' 
        });
    }
}

export default authenticateUser;
