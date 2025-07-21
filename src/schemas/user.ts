import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  userTypeId: z.number().int().positive().optional(),
});
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Pelo menos um campo deve ser informado',
  },
);
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
