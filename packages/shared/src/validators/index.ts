import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  university: z.string().optional(),
  program: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

export const workLogSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  hoursWorked: z.number().min(0.25).max(24),
  employer: z.string().min(1, 'Employer name is required'),
  notes: z.string().optional(),
});

export const permitSchema = z.object({
  permitNumber: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  conditions: z.array(z.string()).optional(),
});
