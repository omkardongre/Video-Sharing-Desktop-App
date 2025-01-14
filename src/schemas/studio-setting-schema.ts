import { z } from 'zod';

export const updateStudioSettingsSchema = z.object({
  id: z.string(),
  screen: z.string(),
  audio: z.string(),
  preset: z.enum(['HD', 'SD']),
});
