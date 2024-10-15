// Code generated by automation script, DO NOT EDIT.
// Automated by pulling database and generating zod schema
// To update. Just run npm run generate:schema
// Written by akhilmhdh.

import { z } from "zod";



import { TImmutableDBKeys } from "./models";

export const ConsumerSecretsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
  data: z.string(),
  created_at: z.date(),
  updated_at: z.date()
});

export type TConsumerSecrets = z.infer<typeof ConsumerSecretsSchema>;
export type TConsumerSecretsInsert = Omit<z.input<typeof ConsumerSecretsSchema>, TImmutableDBKeys>;
export type TConsumerSecretsUpdate = Partial<Omit<z.input<typeof ConsumerSecretsSchema>, TImmutableDBKeys>>;
