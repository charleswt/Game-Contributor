import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt' ;


const exp = process.env.JWT_EXP || '3h';
const secret = process.env.SECRET || 'example';

interface AuthRequest extends Request {
    token?: string;
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token = req.token || req.headers.authorization

    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }
    if (!token) {
        return next();
    }

    try {
        const data = jwt.verify(token, secret, { maxAge: exp }) as JwtPayload;
        req.user = data;
    } catch (error) {
        req.token = undefined;
        delete req.headers.authorization;
    }
    next();
};

export const packToken = (id: string): string => {
    return jwt.sign({ id }, secret, { expiresIn: exp });
    
};

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 13;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

export const comparePasswordHash = async (password: string, hashedPassword: string): Promise<boolean> => {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
};