import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const complianceRouter = Router();

// All routes require authentication
complianceRouter.use(authenticate);

// ===================
// GET /api/compliance/checklist
// Get user's full compliance checklist
// ===================
complianceRouter.get('/checklist', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.complianceItem.findMany({
      where: { userId: req.userId },
      include: {
        rule: true,
        document: {
          select: { id: true, fileName: true, type: true, uploadedAt: true },
        },
      },
      orderBy: [
        { rule: { priority: 'desc' } },
        { dueDate: 'asc' },
      ],
    });

    // Calculate stats
    const stats = {
      total: items.length,
      completed: items.filter(i => i.status === 'COMPLETED').length,
      pending: items.filter(i => i.status === 'PENDING').length,
      overdue: items.filter(i => i.status === 'OVERDUE').length,
      inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
    };

    const completionRate = stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

    res.json({
      checklist: items,
      stats: { ...stats, completionRate },
    });
  } catch (error) {
    next(error);
  }
});

// ===================
// PATCH /api/compliance/checklist/:itemId
// Update a compliance item status
// ===================
const updateItemSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE']),
  notes: z.string().optional(),
  documentId: z.string().optional(),
});

complianceRouter.patch(
  '/checklist/:itemId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const data = updateItemSchema.parse(req.body);

      const item = await prisma.complianceItem.findFirst({
        where: { id: itemId, userId: req.userId },
      });

      if (!item) {
        throw new AppError('Compliance item not found', 404);
      }

      const updated = await prisma.complianceItem.update({
        where: { id: itemId },
        data: {
          status: data.status,
          notes: data.notes,
          documentId: data.documentId,
          completedAt: data.status === 'COMPLETED' ? new Date() : null,
        },
        include: { rule: true },
      });

      res.json({ item: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError(error.errors[0].message, 400));
      }
      next(error);
    }
  }
);

// ===================
// POST /api/compliance/initialize
// Initialize checklist for a new user (creates items from active rules)
// ===================
complianceRouter.post('/initialize', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user already has compliance items
    const existingItems = await prisma.complianceItem.count({
      where: { userId: req.userId },
    });

    if (existingItems > 0) {
      throw new AppError('Checklist already initialized', 409);
    }

    // Get all active rules
    const rules = await prisma.complianceRule.findMany({
      where: { isActive: true },
    });

    if (rules.length === 0) {
      throw new AppError('No compliance rules found. Please contact admin.', 404);
    }

    // Get user's permit for deadline calculation
    const permit = await prisma.studyPermit.findUnique({
      where: { userId: req.userId },
    });

    // Create compliance items for each rule
    const items = await prisma.complianceItem.createMany({
      data: rules.map(rule => ({
        userId: req.userId!,
        ruleId: rule.id,
        status: 'PENDING',
        dueDate: calculateDueDate(rule, permit?.expiryDate),
      })),
    });

    res.status(201).json({
      message: `Checklist initialized with ${items.count} items`,
      count: items.count,
    });
  } catch (error) {
    next(error);
  }
});

// ===================
// GET /api/compliance/rules (Admin)
// Get all compliance rules
// ===================
complianceRouter.get('/rules', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rules = await prisma.complianceRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    res.json({ rules });
  } catch (error) {
    next(error);
  }
});

// ===================
// Helper: Calculate due dates based on rule type
// ===================
function calculateDueDate(
  rule: { deadlineType: string; deadlineDays: number | null },
  permitExpiry?: Date | null
): Date | null {
  const now = new Date();

  switch (rule.deadlineType) {
    case 'RELATIVE_TO_PERMIT':
      if (permitExpiry && rule.deadlineDays) {
        const due = new Date(permitExpiry);
        due.setDate(due.getDate() - rule.deadlineDays);
        return due;
      }
      return null;

    case 'FIXED_DATE':
      if (rule.deadlineDays) {
        const due = new Date(now);
        due.setDate(due.getDate() + rule.deadlineDays);
        return due;
      }
      return null;

    case 'RECURRING':
      // Default to 90 days from now for recurring items
      const recurring = new Date(now);
      recurring.setDate(recurring.getDate() + (rule.deadlineDays || 90));
      return recurring;

    case 'ONE_TIME':
      return null; // No specific deadline

    default:
      return null;
  }
}
