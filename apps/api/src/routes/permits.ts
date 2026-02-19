import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const permitRouter = Router();

permitRouter.use(authenticate);

const permitSchema = z.object({
  permitNumber: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid expiry date required'),
  conditions: z.array(z.string()).optional(),
});

// ===================
// POST /api/permits
// Create or update study permit
// ===================
permitRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = permitSchema.parse(req.body);

    const expiryDate = new Date(data.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' = 'ACTIVE';
    if (daysUntilExpiry <= 0) status = 'EXPIRED';
    else if (daysUntilExpiry <= 90) status = 'EXPIRING_SOON';

    const permit = await prisma.studyPermit.upsert({
      where: { userId: req.userId! },
      update: {
        permitNumber: data.permitNumber,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate,
        conditions: data.conditions || [],
        status,
      },
      create: {
        userId: req.userId!,
        permitNumber: data.permitNumber,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate,
        conditions: data.conditions || [],
        status,
      },
    });

    // Create expiry warning notification if needed
    if (status === 'EXPIRING_SOON') {
      await prisma.notification.create({
        data: {
          userId: req.userId!,
          type: 'PERMIT_EXPIRY',
          title: 'Study Permit Expiring Soon',
          message: `Your study permit expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()}). Begin your renewal process now.`,
          channel: 'IN_APP',
        },
      });
    }

    res.json({
      permit,
      daysUntilExpiry,
      status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ===================
// GET /api/permits
// Get user's study permit
// ===================
permitRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const permit = await prisma.studyPermit.findUnique({
      where: { userId: req.userId! },
    });

    if (!permit) {
      return res.json({ permit: null, message: 'No study permit on file' });
    }

    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (permit.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      permit,
      daysUntilExpiry,
    });
  } catch (error) {
    next(error);
  }
});
