import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const exp = '3h';
const secret = process.env.SECRET || 'example';

interface AuthRequest extends Request {
    token?: string;
    user?: any;
}

interface UserData {
    username: string;
    _id: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.token || req.headers.authorization;

    if (!token) {
        return next();
    }

    try {
        const { data } = jwt.verify(token, secret, { maxAge: exp }) as JwtPayload;
        
        req.user = data;
    } catch (error) {
        console.error('Invalid token:', (error as Error).message);
        return res.status(401).send('Invalid token');
    }

    next();
};

export const packToken = (userData: UserData): string => {
    return jwt.sign({ data: userData }, secret, { expiresIn: exp });
};