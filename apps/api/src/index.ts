import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

import { authRouter } from './routes/auth';
import { complianceRouter } from './routes/compliance';
import { workLogRouter } from './routes/worklog';
import { documentRouter } from './routes/documents';
import { notificationRouter } from './routes/notifications';
import { permitRouter } from './routes/permits';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===================
// MIDDLEWARE
// ===================

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ===================
// ROUTES
// ===================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'NorthStar Student API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/work-logs', workLogRouter);
app.use('/api/documents', documentRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/permits', permitRouter);

// ===================
// ERROR HANDLING
// ===================

app.use(errorHandler);

// ===================
// START SERVER
// ===================

app.listen(PORT, () => {
  console.log(`
  =============================================
   NorthStar Student API
   Running on http://localhost:${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
  =============================================
  `);
});

export default app;
