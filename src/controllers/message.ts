import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { UserRepositoryPrisma } from '../repositories/user-prisma';
import { CreateMessageUseCase } from '../use-cases/message/create';
import { MessageRepositoryPrisma } from '../repositories/message-prisma';
import { CreateMessageDTO } from '../schemas/message'; 
import { GetMessageUseCase } from '../use-cases/message/get';

const messageRepo = new MessageRepositoryPrisma();
const userRepo = new UserRepositoryPrisma();

const createMessageUseCase = new CreateMessageUseCase(messageRepo, userRepo);
const getMessageUseCase = new GetMessageUseCase(messageRepo);

export class MessageController {
  static async create(req: Request, res: Response) {
    try {
      const data = req.body as CreateMessageDTO;
      const userId = req.user?.sub ? Number(req.user.sub) : undefined;
      if (typeof userId !== 'number' || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user id' });
      }

      const post = await createMessageUseCase.execute(data, userId);

      return res.status(201).json(post);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.flatten().fieldErrors });
      }
      return res.status(400).json({ error: err.message });
    }
  }

  static async show(req: Request, res: Response) {
    const id = Number(req.params.id); 
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    try {
      const post = await getMessageUseCase.execute(id);
      return res.json(post);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }
}
