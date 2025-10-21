import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}
