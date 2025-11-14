import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface Context {
  prisma: PrismaClient;
  user: {
    id: string;
    walletAddress: string;
  } | null;
}

export async function createContext(req: Request): Promise<Context> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  let user = null;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      user = {
        id: decoded.userId,
        walletAddress: decoded.walletAddress,
      };
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  return {
    prisma,
    user,
  };
}

export { prisma };

