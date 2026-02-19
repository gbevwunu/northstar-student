import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { sendEmail } from './email.service';

/**
 * Scheduled jobs for deadline monitoring
 * Run daily at 8:00 AM CST (Winnipeg time)
 */
export function startNotificationCron() {
  // Daily permit expiry check
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily permit expiry check...');
    await checkPermitExpiry();
    await checkOverdueCompliance();
    await checkWorkHourWeeklyReset();
  }, {
    timezone: 'America/Winnipeg',
  });

  console.log('[CRON] Notification scheduler started (daily at 8:00 AM CST)');
}

async function checkPermitExpiry() {
  const now = new Date();

  // Find permits expiring in 90, 60, or 30 days
  const checkpoints = [
    { days: 90, field: 'reminderSent90' as const },
    { days: 60, field: 'reminderSent60' as const },
    { days: 30, field: 'reminderSent30' as const },
  ];

  for (const checkpoint of checkpoints) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + checkpoint.days);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const permits = await prisma.studyPermit.findMany({
      where: {
        expiryDate: { gte: startOfDay, lte: endOfDay },
        [checkpoint.field]: false,
        status: { not: 'EXPIRED' },
      },
      include: { user: true },
    });

    for (const permit of permits) {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: permit.userId,
          type: 'PERMIT_EXPIRY',
          title: `Study Permit Expires in ${checkpoint.days} Days`,
          message: `Your study permit expires on ${permit.expiryDate.toLocaleDateString()}. Start your renewal process now to maintain your status in Canada.`,
          channel: 'EMAIL',
        },
      });

      // Send email
      await sendEmail({
        to: permit.user.email,
        subject: `[NorthStar] Study Permit Expires in ${checkpoint.days} Days`,
        html: `
          <h2>Study Permit Expiry Reminder</h2>
          <p>Hi ${permit.user.firstName},</p>
          <p>Your study permit expires on <strong>${permit.expiryDate.toLocaleDateString()}</strong> (${checkpoint.days} days from now).</p>
          <p>To maintain your legal status in Canada, you should begin the renewal process immediately.</p>
          <p><strong>What to do:</strong></p>
          <ul>
            <li>Log in to NorthStar Student to review your compliance checklist</li>
            <li>Gather required documents (enrollment letter, financial proof)</li>
            <li>Apply for renewal through IRCC at least 30 days before expiry</li>
          </ul>
          <p>— NorthStar Student Team</p>
        `,
      });

      // Mark reminder as sent
      await prisma.studyPermit.update({
        where: { id: permit.id },
        data: { [checkpoint.field]: true },
      });

      console.log(`[CRON] Sent ${checkpoint.days}-day permit reminder to ${permit.user.email}`);
    }
  }

  // Update expired permits
  await prisma.studyPermit.updateMany({
    where: {
      expiryDate: { lt: now },
      status: { not: 'EXPIRED' },
    },
    data: { status: 'EXPIRED' },
  });
}

async function checkOverdueCompliance() {
  const now = new Date();

  const overdueItems = await prisma.complianceItem.findMany({
    where: {
      dueDate: { lt: now },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    },
    include: { user: true, rule: true },
  });

  for (const item of overdueItems) {
    await prisma.complianceItem.update({
      where: { id: item.id },
      data: { status: 'OVERDUE' },
    });

    await prisma.notification.create({
      data: {
        userId: item.userId,
        type: 'COMPLIANCE_OVERDUE',
        title: `Overdue: ${item.rule.title}`,
        message: `Your compliance item "${item.rule.title}" is now overdue. Complete it immediately to maintain your status.`,
        channel: 'IN_APP',
      },
    });
  }

  if (overdueItems.length > 0) {
    console.log(`[CRON] Marked ${overdueItems.length} compliance items as overdue`);
  }
}

async function checkWorkHourWeeklyReset() {
  // Log weekly summary for analytics (runs on Monday)
  const now = new Date();
  if (now.getDay() === 1) {
    console.log('[CRON] Monday - new work hour tracking week started');
  }
}
