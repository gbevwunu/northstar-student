import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateUploadUrl, generateDownloadUrl, deleteFile } from '../services/s3.service';

export const documentRouter = Router();

documentRouter.use(authenticate);

// ===================
// POST /api/documents/upload-url
// Get a presigned upload URL
// ===================
const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().max(10 * 1024 * 1024, 'File size must be under 10MB'),
  mimeType: z.string().min(1),
  type: z.enum([
    'STUDY_PERMIT',
    'ENROLLMENT_LETTER',
    'WORK_PERMIT',
    'COOOP_LETTER',
    'LEASE_AGREEMENT',
    'HEALTH_INSURANCE',
    'TAX_RETURN',
    'OTHER',
  ]),
});

documentRouter.post('/upload-url', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = uploadRequestSchema.parse(req.body);

    const s3Key = `${req.userId}/${data.type}/${Date.now()}-${data.fileName}`;
    const uploadUrl = await generateUploadUrl(s3Key, data.mimeType);

    // Create document record (pending upload)
    const document = await prisma.document.create({
      data: {
        userId: req.userId!,
        type: data.type,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        s3Key,
      },
    });

    res.json({
      uploadUrl,
      document: {
        id: document.id,
        fileName: document.fileName,
        type: document.type,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ===================
// GET /api/documents
// List user's documents
// ===================
documentRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as string | undefined;

    const documents = await prisma.document.findMany({
      where: {
        userId: req.userId,
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        type: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        isVerified: true,
        uploadedAt: true,
        expiresAt: true,
      },
    });

    res.json({ documents });
  } catch (error) {
    next(error);
  }
});

// ===================
// GET /api/documents/:id/download
// Get a presigned download URL
// ===================
documentRouter.get('/:id/download', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    const downloadUrl = await generateDownloadUrl(doc.s3Key);

    res.json({ downloadUrl, fileName: doc.fileName });
  } catch (error) {
    next(error);
  }
});

// ===================
// DELETE /api/documents/:id
// Delete a document
// ===================
documentRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    await deleteFile(doc.s3Key);
    await prisma.document.delete({ where: { id: doc.id } });

    res.json({ message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
});
