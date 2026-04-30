import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Érvénytelen e-mail cím.'),
  password: z.string().min(1, 'A jelszó kötelező.'),
});
