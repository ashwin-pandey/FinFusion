import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface User {
  id: string;
  email: string;
  googleId?: string | null;
  password?: string | null;
  name: string;
  profilePicture?: string | null;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  googleId?: string;
  email: string;
  name: string;
  password?: string;
  profilePicture?: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER';
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  profilePicture?: string;
  password?: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER';
  isActive?: boolean;
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    return await prisma.user.create({
      data: {
        googleId: data.googleId ?? null,
        email: data.email,
        name: data.name,
        password: data.password,
        profilePicture: data.profilePicture,
        role: data.role || 'USER',
        isActive: data.isActive ?? true
      }
    });
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { googleId }
    });
  }

  static async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  static async update(id: string, data: UpdateUserData): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }

  static async findMany(limit: number = 10, offset: number = 0): Promise<User[]> {
    return await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async count(): Promise<number> {
    return await prisma.user.count();
  }
}
