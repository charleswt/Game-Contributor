import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt' ;

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

export const hashPassword = async (password: string): Promise<string> => {
    console.log('here 5')
    const saltRounds = 13;
    console.log('here 6')
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword)
    return hashedPassword;
};

export const comparePasswordHash = async (password: string, hashedPassword: string): Promise<boolean> => {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
};