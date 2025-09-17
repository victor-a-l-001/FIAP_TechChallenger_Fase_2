import { z } from 'zod';

export type CreatePostDTO = {
  title: string;
  content: string;
  description: string;
};

export const UpdatePostSchema = z
  .object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });
export type UpdatePostDTO = z.infer<typeof UpdatePostSchema>;

export const SearchPostSchema = z.object({
  q: z.string().trim().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
