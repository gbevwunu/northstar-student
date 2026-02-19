import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { WORK_HOUR_CAP_PER_WEEK, WORK_HOUR_WARNING_THRESHOLD } from '@northstar/shared/constants';

export const workLogRouter = Router();

workLogRouter.use(authenticate);

// Validation
const createWorkLogSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid date required'),
  hoursWorked: z.number().min(0.25, 'Minimum 0.25 hours').max(24, 'Maximum 24 hours per day'),
  employer: z.string().min(1, 'Employer name required'),
  notes: z.string().optional(),
});

// ===================
// POST /api/work-logs
// Log work hours
// ===================
workLogRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createWorkLogSchema.parse(req.body);
    const logDate = new Date(data.date);

    // Create the work log
    const workLog = await prisma.workLog.create({
      data: {
        userId: req.userId!,
        date: logDate,
        hoursWorked: data.hoursWorked,
        employer: data.employer,
        notes: data.notes,
      },
    });

    // Calculate week total for alerts
    const weekData = await getWeekTotal(req.userId!, logDate);

    // Check if approaching or exceeding limit
    let alert = null;
    if (weekData.totalHours > WORK_HOUR_CAP_PER_WEEK) {
      alert = {
        level: 'CRITICAL',
        message: `You have exceeded the ${WORK_HOUR_CAP_PER_WEEK}-hour weekly work limit! Current total: ${weekData.totalHours}h. This puts your study permit at risk.`,
      };

      // Create notification
      await prisma.notification.create({
        data: {
          userId: req.userId!,
          type: 'WORK_HOUR_LIMIT',
          title: 'Work Hour Limit Exceeded!',
          message: `You have logged ${weekData.totalHours} hours this week, exceeding the ${WORK_HOUR_CAP_PER_WEEK}-hour cap.`,
          channel: 'IN_APP',
        },
      });
    } else if (weekData.totalHours >= WORK_HOUR_WARNING_THRESHOLD) {
      alert = {
        level: 'WARNING',
        message: `You are approaching the ${WORK_HOUR_CAP_PER_WEEK}-hour weekly limit. Current total: ${weekData.totalHours}h. Remaining: ${WORK_HOUR_CAP_PER_WEEK - weekData.totalHours}h.`,
      };

      await prisma.notification.create({
        data: {
          userId: req.userId!,
          type: 'WORK_HOUR_WARNING',
          title: 'Approaching Work Hour Limit',
          message: `You have logged ${weekData.totalHours} hours this week. Only ${WORK_HOUR_CAP_PER_WEEK - weekData.totalHours}h remaining.`,
          channel: 'IN_APP',
        },
      });
    }

    res.status(201).json({
      workLog,
      weekSummary: weekData,
      alert,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ===================
// GET /api/work-logs/week/:date
// Get work hours for a specific week
// ===================
workLogRouter.get('/week/:date', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const weekData = await getWeekTotal(req.userId!, date);

    res.json(weekData);
  } catch (error) {
    next(error);
  }
});

// ===================
// GET /api/work-logs/history
// Get work log history with pagination
// ===================
workLogRouter.get('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.workLog.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workLog.count({ where: { userId: req.userId } }),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ===================
// DELETE /api/work-logs/:id
// Delete a work log entry
// ===================
workLogRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await prisma.workLog.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!log) {
      throw new AppError('Work log not found', 404);
    }

    await prisma.workLog.delete({ where: { id: req.params.id } });

    res.json({ message: 'Work log deleted' });
  } catch (error) {
    next(error);
  }
});

// ===================
// GET /api/work-logs/dashboard
// Dashboard summary for current week + month
// ===================
workLogRouter.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const currentWeek = await getWeekTotal(req.userId!, now);

    // Month total
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthLogs = await prisma.workLog.findMany({
      where: {
        userId: req.userId,
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    const monthTotal = monthLogs.reduce((sum, log) => sum + log.hoursWorked, 0);

    res.json({
      currentWeek,
      month: {
        totalHours: monthTotal,
        logCount: monthLogs.length,
        period: `${monthStart.toISOString().split('T')[0]} to ${monthEnd.toISOString().split('T')[0]}`,
      },
      cap: WORK_HOUR_CAP_PER_WEEK,
      remainingThisWeek: Math.max(0, WORK_HOUR_CAP_PER_WEEK - currentWeek.totalHours),
    });
  } catch (error) {
    next(error);
  }
});

// ===================
// Helper: Get week total hours
// ===================
async function getWeekTotal(userId: string, date: Date) {
  // Calculate Monday-Sunday of the week containing `date`
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const logs = await prisma.workLog.findMany({
    where: {
      userId,
      date: { gte: weekStart, lte: weekEnd },
    },
    orderBy: { date: 'asc' },
  });

  const totalHours = logs.reduce((sum, log) => sum + log.hoursWorked, 0);

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
    totalHours,
    remaining: Math.max(0, WORK_HOUR_CAP_PER_WEEK - totalHours),
    isOverLimit: totalHours > WORK_HOUR_CAP_PER_WEEK,
    isNearLimit: totalHours >= WORK_HOUR_WARNING_THRESHOLD,
    logs,
  };
}
