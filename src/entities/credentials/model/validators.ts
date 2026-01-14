import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type CredentialsFormData = z.infer<typeof credentialsSchema>;


