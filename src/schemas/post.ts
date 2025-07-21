import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  content: z.string().min(1, 'Conteúdo obrigatório'),
  authorId: z.number().int().positive(),
});
export type CreatePostDTO = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = z
  .object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });
export type UpdatePostDTO = z.infer<typeof UpdatePostSchema>;

export const SearchPostSchema = z.object({
  q: z.string().min(1, 'Termo de busca obrigatório'),
});
export type SearchPostDTO = z.infer<typeof SearchPostSchema>;
