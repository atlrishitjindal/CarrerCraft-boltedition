import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['user', 'employer']).default('user')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  company: z.string().min(2, 'Company name required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).default([]),
  location: z.string().min(2, 'Location required'),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'remote'])
});

export const coverLetterSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  resumeText: z.string().min(100, 'Resume text required')
});
