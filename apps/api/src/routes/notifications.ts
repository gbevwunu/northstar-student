import { Router, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

// ===================
// GET /api/notifications
// Get user notifications
// ===================
notificationRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const limit = parseInt(req.query.limit as string) || 50;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

// ===================
// PATCH /api/notifications/:id/read
// Mark notification as read
// ===================
notificationRouter.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    res.json({ message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
});

// ===================
// POST /api/notifications/read-all
// Mark all notifications as read
// ===================
notificationRouter.post('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});
