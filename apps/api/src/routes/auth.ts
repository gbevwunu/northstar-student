import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { hashPassword, comparePassword } from '../services/auth.service';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  university: z.enum([
    'UNIVERSITY_OF_MANITOBA',
    'UNIVERSITY_OF_WINNIPEG',
    'RED_RIVER_COLLEGE',
    'BRANDON_UNIVERSITY',
    'OTHER',
  ]).optional(),
  program: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ===================
// POST /api/auth/register
// ===================
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        university: data.university || 'UNIVERSITY_OF_MANITOBA',
        program: data.program,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        university: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      message: 'Registration successful',
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ===================
// POST /api/auth/login
// ===================
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ===================
// GET /api/auth/me
// ===================
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        university: true,
        program: true,
        studentId: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// ===================
// PATCH /api/auth/profile
// Update user profile
// ===================
const profileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  university: z.enum([
    'UNIVERSITY_OF_MANITOBA',
    'UNIVERSITY_OF_WINNIPEG',
    'RED_RIVER_COLLEGE',
    'BRANDON_UNIVERSITY',
    'OTHER',
  ]).optional(),
  program: z.string().optional(),
  studentId: z.string().optional(),
});

authRouter.patch('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = profileUpdateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        university: true,
        program: true,
        studentId: true,
        role: true,
      },
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ===================
// POST /api/auth/change-password
// ===================
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

authRouter.post('/change-password', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new AppError('User not found', 404);

    const isValid = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isValid) throw new AppError('Current password is incorrect', 401);

    const newHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash: newHash },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ===================
// Helper
// ===================
function generateToken(userId: string, email: string, role: string): string {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign({ userId, email, role }, secret, {
    expiresIn: '7d',
  } as jwt.SignOptions);
}
